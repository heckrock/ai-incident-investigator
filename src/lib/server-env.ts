/**
 * Read server-only environment variables at runtime.
 * Bracket notation prevents Next.js from inlining `undefined` at build time
 * when secrets are provided by the host (e.g. Render) at runtime only.
 */
export function getServerEnv(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getOpenAIApiKey(): string | undefined {
  return getServerEnv("OPENAI_API_KEY");
}
