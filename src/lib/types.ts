export interface IncidentAnalysis {
  executiveSummary: string;
  rootCause: string;
  timeline: string[];
  impact: string;
  remediation: string[];
  preventionRecommendations: string[];
}

export interface JiraConfig {
  enabled: boolean;
  baseUrl: string;
  email: string;
  apiToken: string;
  issueKey: string;
  channelName: string;
}

export interface GrafanaConfig {
  enabled: boolean;
  url: string;
  apiKey: string;
  lokiDatasourceUid: string;
  tempoDatasourceUid: string;
  serviceName: string;
  incidentStart: string;
  incidentEnd: string;
}

export interface AnalyzeRequest {
  incidentText: string;
  jira?: JiraConfig;
  grafana?: GrafanaConfig;
}

export interface AnalyzeResponse {
  analysis: IncidentAnalysis;
  sources: {
    manualInput: boolean;
    jira: boolean;
    grafana: boolean;
  };
  enrichedContext?: string;
}

export const DEFAULT_JIRA_CONFIG: JiraConfig = {
  enabled: false,
  baseUrl: "",
  email: "",
  apiToken: "",
  issueKey: "",
  channelName: "",
};

export const DEFAULT_GRAFANA_CONFIG: GrafanaConfig = {
  enabled: false,
  url: "",
  apiKey: "",
  lokiDatasourceUid: "",
  tempoDatasourceUid: "",
  serviceName: "",
  incidentStart: "",
  incidentEnd: "",
};
