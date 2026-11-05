import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Pill, Status, T } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("API reference", "/docs/api");

const c = (s: string) => <code>{s}</code>;
const live = <Pill kind="live" />;
const planned = <Pill kind="planned" />;
const doc = (href: string, label: string) => <a href={href}>{label}</a>;

const QUOTE = `curl -X POST https://asc.verafy.ai/v1/quotes \\
  -H 'content-type: application/json' \\
  -d '{"kind":"ruling","jury":{"size":7,"tier":"standard"}}'

# {"kind":"ruling","unit":"credits","proposed":true,"charged":0,"credits":35,
#  "jury":{"size":7,"tier":"standard"},"detail":"7 jurors, standard tier"}`;

export default function Page() {
  return (
    <DocsFrame current="/docs/api">
      <Status>the sandbox runs today <Pill kind="live" />, and so does <code>POST /v1/quotes</code> <Pill kind="live" />. Every other call on this page is planned <Pill kind="planned" />.</Status>
      <DocHead title="API reference" intro="One SDK, one REST API and two on-chain calls. Each row says whether it's live or planned." />

      <H2>SDK: @verafy/asc (TypeScript), verafy_asc (Python)</H2>
      <T head={["Call", "Does", "Status", "Docs"]} rows={[
        [c("asc.draft({ text })"), "Compiles an .asc.md into steps, runs the loophole check, and returns a draft with a report.", planned, doc("/docs/publish", "Publish an ASC")],
        [c("asc.publish(draft, { signer })"), "Publishes the signed-off draft on Solana and returns { id, version, url }.", planned, doc("/docs/publish", "Publish an ASC")],
        [c("asc.requestRuling({ asc, action, evidence, jury, ... })"), "Asks a jury to rule and returns a Ruling.", planned, doc("/docs/request-a-ruling", "Request a ruling")],
        [c("asc.getRuling(id)"), "Reads a ruling.", planned, doc("/docs/request-a-ruling", "Request a ruling")],
        [c("asc.dispute(rulingId, { reason })"), "Sends a ruling to a second jury.", planned, doc("/docs/disputes", "Disputes")],
        [c("asc.certify({ repo, commit, standards, jury })"), "Reviews a commit and returns a Certificate.", planned, doc("/docs/standards", "Standards and certification")],
        [c("asc.quote(request)"), <>Prices any requestRuling or certify call without running it. Until the SDK ships, use {c("POST /v1/quotes")}.</>, planned, doc("/docs/credits", "Credits and pricing")],
      ]} />

      <H2>REST</H2>
      <p className="d-mut">Each call takes the same body as the SDK call, with auth by API key. Quotes are free and need no key.</p>
      <T head={["Endpoint", "Same as", "Status", "Docs"]} rows={[
        [c("POST /v1/ascs"), c("asc.draft"), planned, doc("/docs/publish", "Publish an ASC")],
        [c("POST /v1/ascs/:id/publish"), c("asc.publish"), planned, doc("/docs/publish", "Publish an ASC")],
        [c("POST /v1/rulings"), c("asc.requestRuling"), planned, doc("/docs/request-a-ruling", "Request a ruling")],
        [c("GET /v1/rulings/:id"), c("asc.getRuling"), planned, doc("/docs/request-a-ruling", "Request a ruling")],
        [c("POST /v1/rulings/:id/dispute"), c("asc.dispute"), planned, doc("/docs/disputes", "Disputes")],
        [c("POST /v1/certifications"), c("asc.certify"), planned, doc("/docs/standards", "Standards and certification")],
        [c("GET /v1/certifications/:id"), "reads a certificate", planned, doc("/docs/standards", "Standards and certification")],
        [c("POST /v1/quotes"), c("asc.quote"), live, doc("/docs/credits", "Credits and pricing")],
        [c("GET /v1/standards"), "lists the standards", planned, doc("/docs/standards", "Standards and certification")],
      ]} />
      <Code code={QUOTE} title="POST /v1/quotes" pill="live" lang="shell" />
      <p className="d-mut">Quotes use the <a href="/docs/credits">proposed prices</a>. The <code>fast</code> and <code>frontier</code> tiers return <code>tier_price_not_set</code> until their prices are set.</p>

      <H2>On chain</H2>
      <T head={["Chain", "Call", "Status", "Docs"]} rows={[
        ["Solana", c("verify_ruling(&asc, &action, &instructions) -> Outcome"), planned, doc("/docs/enforce", "Enforce a ruling")],
        ["EVM", c("requestRuling(ascId, action, jury) → requestId"), planned, doc("/docs/enforce", "Enforce a ruling")],
        ["EVM", c("verifyRuling(requestId, attestations) → Outcome"), planned, doc("/docs/enforce", "Enforce a ruling")],
      ]} />
      <p className="d-mut">Hard caps stay in the contract&apos;s own code. The jury can only pick a listed outcome.</p>
    </DocsFrame>
  );
}
