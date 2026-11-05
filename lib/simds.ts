/**
 * The three draft SIMDs, read from simds/*.md at build time. simds/ is the
 * single source: the /simds page renders these files and the download links
 * serve them unchanged.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";

export const SIMDS = [
  { key: "programs", n: 1, file: "inference-programs.md" },
  { key: "attestations", n: 2, file: "inference-attestations.md" },
  { key: "rulings", n: 3, file: "inference-rulings.md" },
] as const;

export type SimdKey = (typeof SIMDS)[number]["key"];
export type TocItem = { depth: 2 | 3; id: string; text: string };
export type Simd = { key: SimdKey; n: number; file: string; title: string; frontMatter: string; html: string; toc: TocItem[]; markdown: string };

const DIR = path.join(process.cwd(), "simds");

export function slugify(text: string): string {
  return text.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function readSimdMarkdown(file: string): string {
  return readFileSync(path.join(DIR, file), "utf8");
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

export function renderSimd(key: SimdKey, n: number, file: string, markdown: string): Simd {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  const frontMatter = fm ? fm[1] : "";
  const body = fm ? markdown.slice(fm[0].length) : markdown;
  const title = /^title:\s*(.+)$/m.exec(frontMatter)?.[1].trim() ?? key;
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { tokens, depth, text }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        let id = `${key}-${slugify(text)}`;
        const count = seen.get(id) ?? 0;
        seen.set(id, count + 1);
        if (count) id = `${id}-${count}`;
        if (depth === 2 || depth === 3) toc.push({ depth, id, text: inner.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  });
  let html = marked.parse(body, { async: false }) as string;
  html = html.replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, "</table></div>");
  return { key, n, file, title, frontMatter: escapeHtml(frontMatter), html, toc, markdown };
}

export function loadSimds(): Simd[] {
  return SIMDS.map((s) => renderSimd(s.key, s.n, s.file, readSimdMarkdown(s.file)));
}
