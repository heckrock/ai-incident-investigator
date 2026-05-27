import { NextRequest, NextResponse } from "next/server";
import { fetchGrafanaIncidentContext } from "@/lib/grafana";
import { fetchJiraIncidentContext } from "@/lib/jira";
import { analyzeIncident } from "@/lib/openai";
import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { incidentText, jira, grafana } = body;

    const contextParts: string[] = [];
    const sources = {
      manualInput: Boolean(incidentText?.trim()),
      jira: false,
      grafana: false,
    };

    if (incidentText?.trim()) {
      contextParts.push("=== MANUAL INCIDENT INPUT ===\n" + incidentText.trim());
    }

    if (jira?.enabled) {
      try {
        const jiraContext = await fetchJiraIncidentContext(jira);
        contextParts.push(jiraContext);
        sources.jira = true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Jira fetch failed.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (grafana?.enabled) {
      try {
        const grafanaContext = await fetchGrafanaIncidentContext(grafana);
        contextParts.push(grafanaContext);
        sources.grafana = true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Grafana fetch failed.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (contextParts.length === 0) {
      return NextResponse.json(
        { error: "No incident data provided." },
        { status: 400 }
      );
    }

    const enrichedContext = contextParts.join("\n\n");
    const analysis = await analyzeIncident(enrichedContext);

    const response: AnalyzeResponse = {
      analysis,
      sources,
      enrichedContext,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
