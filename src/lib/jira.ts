import type { JiraConfig } from "./types";

interface JiraComment {
  author: string;
  created: string;
  body: string;
}

interface JiraIssue {
  key: string;
  summary: string;
  description: string;
  status: string;
  comments: JiraComment[];
}

function stripAdfText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;

  if (n.type === "text" && typeof n.text === "string") {
    return n.text;
  }

  if (Array.isArray(n.content)) {
    return n.content.map(stripAdfText).join("");
  }

  return "";
}

function parseDescription(description: unknown): string {
  if (typeof description === "string") return description;
  if (description && typeof description === "object") {
    return stripAdfText(description);
  }
  return "";
}

export async function fetchJiraIncidentContext(
  config: JiraConfig
): Promise<string> {
  const baseUrl = (config.baseUrl || process.env.JIRA_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  const email = config.email || process.env.JIRA_EMAIL || "";
  const apiToken = config.apiToken || process.env.JIRA_API_TOKEN || "";

  if (!baseUrl || !email || !apiToken || !config.issueKey) {
    throw new Error(
      "Jira configuration incomplete. Provide base URL, credentials, and issue key."
    );
  }

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  const headers = {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const issueRes = await fetch(
    `${baseUrl}/rest/api/3/issue/${config.issueKey}?expand=renderedFields`,
    { headers }
  );

  if (!issueRes.ok) {
    throw new Error(
      `Failed to fetch Jira issue ${config.issueKey}: ${issueRes.status} ${issueRes.statusText}`
    );
  }

  const issueData = await issueRes.json();
  const fields = issueData.fields ?? {};

  const commentsRes = await fetch(
    `${baseUrl}/rest/api/3/issue/${config.issueKey}/comment?maxResults=100&orderBy=-created`,
    { headers }
  );

  let comments: JiraComment[] = [];
  if (commentsRes.ok) {
    const commentsData = await commentsRes.json();
    comments = (commentsData.comments ?? []).map(
      (c: {
        author?: { displayName?: string };
        created?: string;
        body?: unknown;
      }) => ({
        author: c.author?.displayName ?? "Unknown",
        created: c.created ?? "",
        body: parseDescription(c.body),
      })
    );
  }

  const issue: JiraIssue = {
    key: issueData.key ?? config.issueKey,
    summary: fields.summary ?? "",
    description: parseDescription(fields.description),
    status: fields.status?.name ?? "Unknown",
    comments,
  };

  const channelLabel = config.channelName
    ? ` (Troubleshooting channel: ${config.channelName})`
    : "";

  const commentBlock = issue.comments.length
    ? issue.comments
        .slice()
        .reverse()
        .map(
          (c) =>
            `[${c.created}] ${c.author}: ${c.body.replace(/\s+/g, " ").trim()}`
        )
        .join("\n")
    : "No comments found on this issue.";

  return `=== JIRA INCIDENT TICKET${channelLabel} ===
Issue: ${issue.key} — ${issue.summary}
Status: ${issue.status}

Description:
${issue.description || "No description provided."}

=== TROUBLESHOOTING THREAD / COMMENTS ===
${commentBlock}`;
}
