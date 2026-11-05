import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, REQUEST_FULL as REQUEST, Status, T } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";
import { sharedFile } from "@/lib/samples";

export const metadata = pageMeta("Request a ruling", "/docs/request-a-ruling");

const PY = `from verafy_asc import asc

ruling = asc.request_ruling(
    asc="asc_hotwallet_v1",
    action={"type": "withdrawal", "to": to, "amount_usd": 250000},
    evidence={"account": account, "destination": destination, "ticket": ticket, "totals": totals},
    jury={"size": 5, "quorum": 4, "tier": "standard"},
)`;

const c = (s: string) => <code>{s}</code>;

export default function Page() {
  return (
    <DocsFrame current="/docs/request-a-ruling">
      <Status />
      <DocHead title="Request a ruling" intro={<>{c("asc.requestRuling()")} asks a jury to rule on one action under one published ASC, and returns a signed ruling.</>} />
      <Code code={REQUEST} title="asc.requestRuling()" pill="planned" lang="TypeScript" />
      <Code code={PY} title="asc.request_ruling()" pill="planned" lang="Python" />

      <H2 id="parameters">Parameters</H2>
      <T head={["Name", "Required", "Meaning"]} rows={[
        [c("asc"), "yes", <>The published ASC id. Without {c("@version")}, the ASC&apos;s current version is used and recorded on the ruling.</>],
        [c("action"), "yes", "The thing being decided. It's hashed, and the ruling is valid only for this exact action."],
        [c("evidence"), "no", <>Data the jury may read. Each item is saved and hashed before any juror sees it. URLs passed with {c("asc.snapshot()")} are fetched once.</>],
        [c("jury.size"), "no", <>3 to 9 jurors. Defaults to the ASC&apos;s {c("min_jury")}. It can&apos;t go below the ASC&apos;s minimum.</>],
        [c("jury.quorum"), "no", "How many must agree. Defaults to two thirds of size, rounded up. It can't go below the ASC's minimum."],
        [c("jury.tier"), "no", <>{c("fast")}, {c("standard")} or {c("frontier")}, which sets the model list and price. {c("fast")} suits agent loops; {c("frontier")} suits large sums and constitutions.</>],
        [c("jury.models"), "no", <>Pick models by name instead of a tier. They must come from different labs if the ASC says {c("different_labs")}.</>],
        [c("jury.proof"), "no", <>{c("none")} today. {c("model-proof")} is planned (provable inference, one open model so far).</>],
        [c("standards"), "no", "Standard ids whose rules are added to the ASC's rules for this ruling."],
        [c("maxCredits"), "no", <>The call fails with {c("over_budget")} before anything runs if the quote is higher.</>],
        [<>{c("wait")}, {c("webhook")}</>, "no", <>A ruling takes 20 to 60 seconds. {c("wait: true")} holds the call open; otherwise poll {c("getRuling")} or take the webhook.</>],
      ]} />

      <H2>What comes back</H2>
      <Code code={sharedFile("ruling.example.json")} title="ruling (illustrative)" pill="illustrative" lang="JSON" />
      <ul className="d-mut">
        <li>{c("status")} is {c("pending")}, {c("final")}, {c("disputed")} or {c("escalated")}.</li>
        <li>{c("outcome")} is one of the outcomes the ASC lists, or its {c("default")} when there&apos;s no quorum, a timeout or bad evidence.</li>
        <li>{c("rulesBroken")} lists the rule number, how many jurors cited it, and a one-line note.</li>
        <li>{c("votes")} has one entry per juror (model, lab, outcome, wallet, signature).</li>
        <li>{c("attestations")} is ready to pass to {c("verifyRuling")} on chain. See <a href="/docs/enforce">Enforce a ruling</a>.</li>
        <li>{c("dispute.open_until")} is when the dispute window closes. See <a href="/docs/disputes">Disputes</a>.</li>
        <li>{c("cost")} is quoted and charged, in credits.</li>
        <li>{c("record")} is a public link.</li>
      </ul>

      <H2>Failures are never a yes</H2>
      <p className="d-mut">On a timeout, no quorum, or too few jurors answering, the result is the ASC&apos;s {c("default")} outcome, and the call is charged 0.</p>

      <H2>Waiting and webhooks</H2>
      <p className="d-mut">A ruling takes 20 to 60 seconds. With {c("wait: true")} the call returns the final ruling. With {c("wait: false")} it returns at once with {c("status: 'pending'")}; read it later with {c("asc.getRuling(id)")} or take the {c("webhook")}, which receives the same ruling body when it&apos;s final.</p>

      <H2>Choosing a jury</H2>
      <T head={["Use", "Jury", "Why"]} rows={[
        ["Agent tool calls, outbound messages", <>3, quorum 2, {c("fast")}</>, "Sits in a loop; speed matters more than depth"],
        ["Withdrawals, payouts, grants", <>5, quorum 4, {c("standard")}</>, "The default for money"],
        ["Constitutions, treasury trades, large sums", <>7, quorum 5, {c("frontier")}</>, "Wrong answers are expensive; disputes are likely"],
        ["Model audits", <>5, quorum 4, {c("standard")}, run in batches</>, "Not live chat. A ruling takes 20 to 60 s"],
      ]} />

      <H2>What the jury sees and signs</H2>
      <p className="d-mut">Each juror reads the ASC, the action, and the evidence, hashed before any juror sees it. Each juror signs its vote with its own wallet, and answers are committed before any is revealed, so no juror can copy another. <a href="/how-it-works">How it works</a> draws each step.</p>
    </DocsFrame>
  );
}

