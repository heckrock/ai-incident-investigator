import { getServerEnv } from "./server-env";
import type { GrafanaConfig } from "./types";

interface LokiResponse {
  data?: {
    result?: Array<{
      stream?: Record<string, string>;
      values?: Array<[string, string]>;
    }>;
  };
}

interface TempoResponse {
  traces?: Array<{
    traceID?: string;
    rootServiceName?: string;
    rootTraceName?: string;
    durationMs?: number;
    startTimeUnixNano?: string;
  }>;
}

async function queryLoki(
  baseUrl: string,
  apiKey: string,
  datasourceUid: string,
  query: string,
  start: string,
  end: string
): Promise<string[]> {
  const params = new URLSearchParams({
    query,
    start: new Date(start).getTime().toString() + "000000",
    end: new Date(end).getTime().toString() + "000000",
    limit: "50",
  });

  const res = await fetch(
    `${baseUrl}/api/datasources/proxy/uid/${datasourceUid}/loki/api/v1/query_range?${params}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    const altRes = await fetch(
      `${baseUrl}/api/datasources/uid/${datasourceUid}/resources/api/v1/query_range?${params}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!altRes.ok) {
      return [`[Loki query failed: ${res.status} ${res.statusText}]`];
    }

    const altData = (await altRes.json()) as LokiResponse;
    return extractLokiLines(altData);
  }

  const data = (await res.json()) as LokiResponse;
  return extractLokiLines(data);
}

function extractLokiLines(data: LokiResponse): string[] {
  const lines: string[] = [];
  for (const stream of data.data?.result ?? []) {
    const labels = stream.stream
      ? Object.entries(stream.stream)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ")
      : "";
    for (const [, line] of stream.values ?? []) {
      lines.push(labels ? `[${labels}] ${line}` : line);
    }
  }
  return lines.slice(0, 50);
}

async function queryTempo(
  baseUrl: string,
  apiKey: string,
  serviceName: string,
  start: string,
  end: string
): Promise<string[]> {
  const params = new URLSearchParams({
    q: `{ resource.service.name="${serviceName}" && status=error }`,
    start: Math.floor(new Date(start).getTime() / 1000).toString(),
    end: Math.floor(new Date(end).getTime() / 1000).toString(),
    limit: "20",
  });

  const res = await fetch(`${baseUrl}/api/search?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return [`[Tempo trace search failed: ${res.status} ${res.statusText}]`];
  }

  const data = (await res.json()) as TempoResponse;
  const traces = data.traces ?? [];

  if (!traces.length) {
    return ["No error traces found for the specified service and time range."];
  }

  return traces.map(
    (t) =>
      `Trace ${t.traceID?.slice(0, 16) ?? "unknown"}… | ${t.rootServiceName ?? "unknown"} / ${t.rootTraceName ?? "unknown"} | ${t.durationMs ?? 0}ms`
  );
}

export async function fetchGrafanaIncidentContext(
  config: GrafanaConfig
): Promise<string> {
  const baseUrl = (config.url || getServerEnv("GRAFANA_URL") || "").replace(
    /\/$/,
    ""
  );
  const apiKey = config.apiKey || getServerEnv("GRAFANA_API_KEY") || "";

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Grafana configuration incomplete. Provide URL and API key."
    );
  }

  if (!config.incidentStart || !config.incidentEnd) {
    throw new Error(
      "Grafana time range required. Set incident start and end times."
    );
  }

  const sections: string[] = [
    `=== GRAFANA OBSERVABILITY DATA ===`,
    `Time window: ${config.incidentStart} → ${config.incidentEnd}`,
    `Service: ${config.serviceName || "all services"}`,
    "",
  ];

  if (config.lokiDatasourceUid) {
    const serviceFilter = config.serviceName
      ? `{service_name="${config.serviceName}"}`
      : `{job=~".+"}`;

    const logQuery = `${serviceFilter} |~ "(?i)(error|fatal|timeout|503|500|exception|panic)"`;

    sections.push("--- LOKI LOGS (errors/timeouts) ---");
    const logs = await queryLoki(
      baseUrl,
      apiKey,
      config.lokiDatasourceUid,
      logQuery,
      config.incidentStart,
      config.incidentEnd
    );
    sections.push(...(logs.length ? logs : ["No matching error logs found."]));
    sections.push("");
  }

  if (config.tempoDatasourceUid && config.serviceName) {
    sections.push("--- TEMPO TRACES (errors) ---");
    const traces = await queryTempo(
      baseUrl,
      apiKey,
      config.serviceName,
      config.incidentStart,
      config.incidentEnd
    );
    sections.push(...traces);
    sections.push("");
  }

  if (!config.lokiDatasourceUid && !config.tempoDatasourceUid) {
    sections.push(
      "No datasource UIDs configured. Provide Loki and/or Tempo datasource UIDs to fetch logs and traces."
    );
  }

  return sections.join("\n");
}
