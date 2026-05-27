import OpenAI from "openai";
import type { IncidentAnalysis } from "./types";

const SYSTEM_PROMPT = `You are an expert Site Reliability Engineer and incident investigator. Analyze the provided incident data and produce a structured post-incident analysis.

Respond ONLY with valid JSON matching this exact schema:
{
  "executiveSummary": "2-3 sentence summary for leadership",
  "rootCause": "Detailed technical root cause analysis",
  "timeline": ["HH:MM UTC - Event description", ...],
  "impact": "Business and technical impact summary with metrics where available",
  "remediation": ["Action taken or recommended", ...],
  "preventionRecommendations": ["Preventive measure", ...]
}

Be specific, actionable, and reference evidence from the incident data. Use professional SRE language.`;

export async function analyzeIncident(
  incidentContext: string
): Promise<IncidentAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to Render Environment variables (production) or .env.local (local development)."
    );
  }

  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze the following incident data and produce a comprehensive post-incident report:\n\n${incidentContext}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response received from OpenAI.");
  }

  const parsed = JSON.parse(content) as IncidentAnalysis;

  if (
    !parsed.executiveSummary ||
    !parsed.rootCause ||
    !Array.isArray(parsed.timeline) ||
    !parsed.impact ||
    !Array.isArray(parsed.remediation) ||
    !Array.isArray(parsed.preventionRecommendations)
  ) {
    throw new Error("Invalid analysis structure returned from OpenAI.");
  }

  return parsed;
}
