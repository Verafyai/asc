import fs from "node:fs";
import path from "node:path";
import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2 } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";
import { IQ_FILES, readExample } from "@/lib/samples";

export const metadata = pageMeta("Under the hood: inscription", "/docs/under-the-hood");

export default function Page() {
  const memo = fs.readFileSync(path.join(process.cwd(), "docs/IQ_INTEGRATION.md"), "utf8");
  return (
    <DocsFrame current="/docs/under-the-hood">
      <p className="d-status">You don&apos;t need this page to use ASC. It explains how published ASCs are stored.</p>
      <DocHead title="Under the hood: inscription" />
      <p className="d-mut">For contributors. The IQ Labs memo and the four IQ sample files, unchanged.</p>
      <H2>The IQ Labs memo</H2>
      <pre className="d-pre">{memo}</pre>
      <H2>IQ sample files</H2>
      {IQ_FILES.map((f) => <Code key={f} code={readExample(f)} title={f} pill="illustrative" lang="TypeScript" />)}
    </DocsFrame>
  );
}
