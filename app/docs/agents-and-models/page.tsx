import DocsFrame from "@/components/DocsFrame";
import { Code, DocHead, H2, Status } from "@/components/DocBits";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Guard agents and models", "/docs/agents-and-models");

const TOOL = `const GUARDED = new Set(['purchase', 'pay_invoice', 'start_subscription']);

async function beforeToolCall(call) {
  if (!GUARDED.has(call.name)) return { run: true };     // every other tool runs as normal
  const ruling = await asc.requestRuling({
    asc: 'asc_agent_spending_v1',
    jury: { size: 3, quorum: 2, tier: 'fast' },
    action: { type: 'agent_tool_call', tool: call.name, input: call.input },
    evidence: { task, budget, vendor },                  // the owner's words, not the agent's summary
  });
  if (ruling.outcome === 'allow') return { run: true };
  if (ruling.outcome === 'ask') return { run: false, askOwner: ruling.rulesBroken };
  return { run: false, toolResult: 'Blocked by spending rules' };
}`;

const MSG = `ruling = asc.request_ruling(
    asc="asc_customer_data_v1",
    jury={"size": 3, "quorum": 2, "tier": "fast"},
    action={"type": "agent_outbound_message", "to": to, "body": body},
    evidence={"ticket": ticket, "customer": customer_id},
)
if ruling.outcome == "send":
    send(to, body)
elif ruling.outcome == "redact":
    send(to, asc.redact(body, ruling))     # flagged lines removed
else:
    escalate(ticket, ruling)               # block: a human takes it`;

const AUDIT = `rulings = asc.request_rulings(
    asc="asc_model_behavior_v1",
    jury={"size": 5, "quorum": 4, "tier": "standard"},
    requests=[{"action": {"type": "model_output", "id": row.id},
               "evidence": {"prompt": row.prompt, "answer": row.answer}} for row in batch],
)
failures = [r for r in rulings if r.outcome == "fail"]
asc.publish_report("asc_model_behavior_v1", {"checked": len(rulings), "failed": len(failures)})`;

export default function Page() {
  return (
    <DocsFrame current="/docs/agents-and-models">
      <Status />
      <DocHead title="Guard agents and models" intro="Put a jury in front of the few actions that can hurt you: spending, sending and what a model says." />
      <p className="d-mut">Be plain about latency: a jury takes seconds, so it guards actions, not keystrokes.</p>

      <H2>1. Before a risky tool call</H2>
      <p className="d-mut">Guard only the tools that spend, send or delete. Every other tool runs as normal. Outcomes are allow, ask or deny.</p>
      <Code code={TOOL} title="asc.requestRuling() in a tool hook" pill="planned" lang="TypeScript" />
      <p className="d-mut">Full sample: <a href="/code/agent-spending">An agent&apos;s spending limits</a>.</p>

      <H2>2. Before a message leaves</H2>
      <p className="d-mut">Outcomes are send, redact or block.</p>
      <Code code={MSG} title="asc.request_ruling() before send" pill="planned" lang="Python" />
      <p className="d-mut">Full sample: <a href="/code/customer-data">A support agent&apos;s data rules</a>.</p>

      <H2>3. Auditing a model</H2>
      <p className="d-mut">A batch of logged answers is checked nightly, and a signed report is published. A ruling takes 20 to 60 seconds, so this is for audits, not live chat.</p>
      <Code code={AUDIT} title="asc.request_rulings() in a nightly job" pill="planned" lang="Python" />
      <p className="d-mut">Full sample: <a href="/code/model-behavior">Model behavior audit</a>.</p>
    </DocsFrame>
  );
}
