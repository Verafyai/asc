/** Pulls the first JSON object out of a model reply. Returns null for empty, "n/a" or unparseable replies. */
export function extractJson(text: string | null | undefined): Record<string, unknown> | null {
  if (!text) return null;
  const t = text.trim();
  if (!t || /^(n\/?a|none|null|i (can(no|')t|am unable))/i.test(t)) return null;
  const start = t.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      try {
        const v = JSON.parse(t.slice(start, i + 1));
        return v && typeof v === "object" && !Array.isArray(v) ? v : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}
