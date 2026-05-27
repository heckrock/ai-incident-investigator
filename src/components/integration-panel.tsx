"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { GrafanaConfig, JiraConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IntegrationPanelProps {
  jira: JiraConfig;
  grafana: GrafanaConfig;
  onJiraChange: (config: JiraConfig) => void;
  onGrafanaChange: (config: GrafanaConfig) => void;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

export function IntegrationPanel({
  jira,
  grafana,
  onJiraChange,
  onGrafanaChange,
}: IntegrationPanelProps) {
  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-left transition-colors hover:bg-muted/40">
        <div>
          <p className="text-sm font-medium">Data source integrations</p>
          <p className="text-muted-foreground text-xs">
            Enrich analysis with Jira war-room threads and Grafana observability
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(jira.enabled || grafana.enabled) && (
            <Badge variant="secondary" className="text-[10px]">
              {[jira.enabled && "Jira", grafana.enabled && "Grafana"]
                .filter(Boolean)
                .join(" + ")}
            </Badge>
          )}
          <ChevronDown className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <Tabs defaultValue="jira" className="rounded-lg border border-border/60 bg-card/30 p-4">
          <TabsList className="mb-4">
            <TabsTrigger value="jira">Jira</TabsTrigger>
            <TabsTrigger value="grafana">Grafana</TabsTrigger>
          </TabsList>

          <TabsContent value="jira" className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border/40 bg-muted/10 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Enable Jira integration</p>
                <p className="text-muted-foreground text-xs">
                  Pull incident ticket and troubleshooting comments
                </p>
              </div>
              <Switch
                checked={jira.enabled}
                onCheckedChange={(enabled) =>
                  onJiraChange({ ...jira, enabled })
                }
              />
            </div>

            <div
              className={cn(
                "grid gap-4 sm:grid-cols-2",
                !jira.enabled && "pointer-events-none opacity-40"
              )}
            >
              <Field
                id="jira-base-url"
                label="Jira base URL"
                hint="e.g. https://your-org.atlassian.net"
              >
                <Input
                  id="jira-base-url"
                  placeholder="https://your-org.atlassian.net"
                  value={jira.baseUrl}
                  onChange={(e) =>
                    onJiraChange({ ...jira, baseUrl: e.target.value })
                  }
                />
              </Field>

              <Field id="jira-issue-key" label="Incident issue key">
                <Input
                  id="jira-issue-key"
                  placeholder="INC-1234"
                  value={jira.issueKey}
                  onChange={(e) =>
                    onJiraChange({ ...jira, issueKey: e.target.value })
                  }
                />
              </Field>

              <Field
                id="jira-channel"
                label="Troubleshooting channel name"
                hint="Slack/Teams channel mirrored in Jira comments"
              >
                <Input
                  id="jira-channel"
                  placeholder="#inc-0514-payments"
                  value={jira.channelName}
                  onChange={(e) =>
                    onJiraChange({ ...jira, channelName: e.target.value })
                  }
                />
              </Field>

              <Field id="jira-email" label="Atlassian account email">
                <Input
                  id="jira-email"
                  type="email"
                  placeholder="you@company.com"
                  value={jira.email}
                  onChange={(e) =>
                    onJiraChange({ ...jira, email: e.target.value })
                  }
                />
              </Field>

              <Field
                id="jira-token"
                label="API token"
                hint={
                  <>
                    Create at{" "}
                    <a
                      href="https://id.atlassian.com/manage-profile/security/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex items-center gap-0.5 hover:underline"
                    >
                      Atlassian settings
                      <ExternalLink className="size-3" />
                    </a>
                  </>
                }
              >
                <Input
                  id="jira-token"
                  type="password"
                  placeholder="••••••••••••••••"
                  value={jira.apiToken}
                  onChange={(e) =>
                    onJiraChange({ ...jira, apiToken: e.target.value })
                  }
                />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="grafana" className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border/40 bg-muted/10 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Enable Grafana integration</p>
                <p className="text-muted-foreground text-xs">
                  Query Loki logs and Tempo traces for the incident window
                </p>
              </div>
              <Switch
                checked={grafana.enabled}
                onCheckedChange={(enabled) =>
                  onGrafanaChange({ ...grafana, enabled })
                }
              />
            </div>

            <div
              className={cn(
                "grid gap-4 sm:grid-cols-2",
                !grafana.enabled && "pointer-events-none opacity-40"
              )}
            >
              <Field
                id="grafana-url"
                label="Grafana URL"
                hint="Grafana Cloud or self-hosted instance"
              >
                <Input
                  id="grafana-url"
                  placeholder="https://your-org.grafana.net"
                  value={grafana.url}
                  onChange={(e) =>
                    onGrafanaChange({ ...grafana, url: e.target.value })
                  }
                />
              </Field>

              <Field id="grafana-api-key" label="Service account token">
                <Input
                  id="grafana-api-key"
                  type="password"
                  placeholder="glsa_…"
                  value={grafana.apiKey}
                  onChange={(e) =>
                    onGrafanaChange({ ...grafana, apiKey: e.target.value })
                  }
                />
              </Field>

              <Field id="grafana-service" label="Service name">
                <Input
                  id="grafana-service"
                  placeholder="payment-api"
                  value={grafana.serviceName}
                  onChange={(e) =>
                    onGrafanaChange({ ...grafana, serviceName: e.target.value })
                  }
                />
              </Field>

              <Field id="grafana-loki-uid" label="Loki datasource UID">
                <Input
                  id="grafana-loki-uid"
                  placeholder="grafanacloud-logs"
                  value={grafana.lokiDatasourceUid}
                  onChange={(e) =>
                    onGrafanaChange({
                      ...grafana,
                      lokiDatasourceUid: e.target.value,
                    })
                  }
                />
              </Field>

              <Field id="grafana-tempo-uid" label="Tempo datasource UID">
                <Input
                  id="grafana-tempo-uid"
                  placeholder="grafanacloud-traces"
                  value={grafana.tempoDatasourceUid}
                  onChange={(e) =>
                    onGrafanaChange({
                      ...grafana,
                      tempoDatasourceUid: e.target.value,
                    })
                  }
                />
              </Field>

              <Field id="grafana-start" label="Incident start (ISO 8601)">
                <Input
                  id="grafana-start"
                  type="datetime-local"
                  value={grafana.incidentStart}
                  onChange={(e) =>
                    onGrafanaChange({
                      ...grafana,
                      incidentStart: e.target.value,
                    })
                  }
                />
              </Field>

              <Field id="grafana-end" label="Incident end (ISO 8601)">
                <Input
                  id="grafana-end"
                  type="datetime-local"
                  value={grafana.incidentEnd}
                  onChange={(e) =>
                    onGrafanaChange({
                      ...grafana,
                      incidentEnd: e.target.value,
                    })
                  }
                />
              </Field>
            </div>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
}
