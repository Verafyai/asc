import fs from "node:fs";
import path from "node:path";

export interface StandardRule {
  id: string;
  title: string;
  check: string;
  evidence: string;
  severity: string;
}

export interface StandardDoc {
  code: string;
  title: string;
  version: string;
  status: string;
  type: string;
  abstract: string;
  proposed: string;
  changelog: string;
  rules: StandardRule[];
  badge: string;
  shallNever: string;
  markdown: string;
}

const ROOT = path.join(process.cwd(), "asc-standards");

export const SHALL: Record<string, string> = {
  EDO: "A consumer device shall never do these 5 things.",
  EAO: "An AI agent shall never do these 10 things.",
  ETC: "A treasury shall never do these 12 things.",
  EVC: "A vesting contract shall never do these 8 things.",
  EMO: "A model deployment shall never do these 10 things.",
};

function field(fm: string, key: string): string {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

function section(body: string, name: string): string {
  const re = new RegExp(`## ${name}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = body.match(re);
  return m ? m[1].trim() : "";
}

function parseRules(body: string): StandardRule[] {
  const rulesBody = section(body, "Rules");
  if (!rulesBody) return [];
  const chunks = rulesBody.split(/\n(?=### )/).filter((c) => c.startsWith("### "));
  return chunks.map((chunk) => {
    const head = chunk.match(/^### ([A-Z]+-\d+):\s*(.+)$/m);
    const check = chunk.match(/\*\*Check:\*\*\s*(.+)/);
    const evidence = chunk.match(/\*\*Evidence the jury reads:\*\*\s*(.+)/);
    const severity = chunk.match(/\*\*Severity:\*\*\s*(.+)/);
    return {
      id: head?.[1] ?? "",
      title: head?.[2]?.trim() ?? "",
      check: check?.[1]?.trim() ?? "",
      evidence: evidence?.[1]?.trim() ?? "",
      severity: (severity?.[1] ?? "normal").trim(),
    };
  }).filter((r) => r.id);
}

export function loadStandard(code: string): StandardDoc | null {
  const file = path.join(ROOT, "standards", `${code.toUpperCase()}.md`);
  if (!fs.existsSync(file)) return null;
  const markdown = fs.readFileSync(file, "utf8");
  const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = fmMatch?.[1] ?? "";
  const body = fmMatch?.[2] ?? markdown;
  const id = field(fm, "id") || code.toUpperCase();
  const badgePath = path.join(ROOT, "badges", `${id}.txt`);
  const badge = fs.existsSync(badgePath) ? fs.readFileSync(badgePath, "utf8") : "";
  const abstractBlock = section(body, "Abstract");
  return {
    code: id,
    title: field(fm, "title"),
    version: field(fm, "version"),
    status: field(fm, "status"),
    type: field(fm, "type"),
    abstract: abstractBlock.replace(/\n+/g, " ").trim(),
    proposed: section(body, "Proposed for v1.1").replace(/\n+/g, " ").trim(),
    changelog: section(body, "Changelog").replace(/\n+/g, " ").trim(),
    rules: parseRules(body),
    badge,
    shallNever: SHALL[id] ?? "",
    markdown,
  };
}

export const STANDARD_ORDER = ["EDO", "EAO", "ETC", "EVC", "EMO", "ASC-0"] as const;

export function loadStandards(): StandardDoc[] {
  return STANDARD_ORDER.map((c) => loadStandard(c)).filter((s): s is StandardDoc => !!s);
}

export function fillBadge(badge: string, repo = "your-org/repo", sha7 = "a1b2c3d", sum12 = "4b1e07c2a9d3", date = "2026-11-04"): string {
  return badge
    .replaceAll("{repo}", repo)
    .replaceAll("{sha7}", sha7)
    .replaceAll("{sum12}", sum12)
    .replaceAll("{date}", date);
}

export const CHECKSUM_COMMAND = "git ls-tree -r <commit> | awk '{print $4\"\\t\"$3}' | LC_ALL=C sort | sha256sum";
