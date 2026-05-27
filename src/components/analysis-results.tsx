"use client";

import type { ComponentType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  Target,
  Wrench,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyzeResponse, IncidentAnalysis } from "@/lib/types";

interface AnalysisResultsProps {
  result: AnalyzeResponse;
  compact?: boolean;
}

const sections: Array<{
  key: keyof IncidentAnalysis;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  list?: boolean;
}> = [
  {
    key: "executiveSummary",
    title: "Executive Summary",
    description: "Leadership-ready overview",
    icon: FileText,
    accent: "text-sky-400",
  },
  {
    key: "rootCause",
    title: "Root Cause",
    description: "Technical failure analysis",
    icon: Target,
    accent: "text-rose-400",
  },
  {
    key: "timeline",
    title: "Timeline",
    description: "Chronological event sequence",
    icon: Clock,
    accent: "text-amber-400",
    list: true,
  },
  {
    key: "impact",
    title: "Impact",
    description: "Business and operational effects",
    icon: AlertTriangle,
    accent: "text-orange-400",
  },
  {
    key: "remediation",
    title: "Remediation",
    description: "Actions taken and next steps",
    icon: Wrench,
    accent: "text-emerald-400",
    list: true,
  },
  {
    key: "preventionRecommendations",
    title: "Prevention Recommendations",
    description: "Measures to avoid recurrence",
    icon: Shield,
    accent: "text-violet-400",
    list: true,
  },
];

function renderContent(
  key: keyof IncidentAnalysis,
  value: string | string[],
  list?: boolean
) {
  if (list && Array.isArray(value)) {
    return (
      <ul className="space-y-2.5">
        {value.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span className="text-muted-foreground mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-sm leading-relaxed text-foreground/90">
      {typeof value === "string" ? value : value.join("\n")}
    </p>
  );
}

export function AnalysisResults({ result, compact = false }: AnalysisResultsProps) {
  const { analysis, sources } = result;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <CheckCircle2 className="size-3" />
          Analysis complete
        </Badge>
        {sources.manualInput && (
          <Badge variant="outline">Manual input</Badge>
        )}
        {sources.jira && <Badge variant="outline">Jira enriched</Badge>}
        {sources.grafana && <Badge variant="outline">Grafana enriched</Badge>}
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        {sections.map(({ key, title, description, icon: Icon, accent, list }) => (
          <Card
            key={key}
            className="border-border/50 bg-card/50 backdrop-blur-sm transition-colors hover:border-border"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg bg-muted/50 p-2 ${accent}`}
                >
                  <Icon className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderContent(key, analysis[key], list)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
