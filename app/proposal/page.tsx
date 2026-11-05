import Chrome from "@/components/Chrome";
import { PROPOSAL } from "@/content/copy";
import { pageMeta } from "@/lib/page-meta";
import { getSample, sharedFile } from "@/lib/samples";

export const metadata = pageMeta("requestRuling() proposal", "/proposal");

export default function Page() {
  const anchor = getSample("exchange-withdrawals")!.code.find((f) => f.name.endsWith("withdraw.anchor.rs"))!.text;
  const iface = sharedFile("IAsc.sol");
  const ruling = sharedFile("ruling.example.json");
  return (
    <Chrome current="/proposal">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div className="d-eb">{PROPOSAL.eyebrow} <span className="d-tag" style={{ marginLeft: 6 }}>{PROPOSAL.tag}</span> · {PROPOSAL.outline}</div>
        <h1 className="d-h1" style={{ fontSize: "clamp(32px, 6vw, 52px)" }}>{PROPOSAL.headline}</h1>
        <p className="d-lede">{PROPOSAL.subhead}</p>
        <div className="d-card" style={{ marginTop: 22, fontFamily: "var(--font-mono)", fontSize: 15, overflowWrap: "anywhere" }}>{PROPOSAL.diagram}</div>
        <p className="d-dim" style={{ fontSize: 14, marginTop: 12 }}>For the how-to, see <a href="/docs/enforce">Enforce a ruling</a>.</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.whyTitle}</h2>
        <p className="d-mut" style={{ maxWidth: 760 }}>{PROPOSAL.why}</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.ifaceTitle}</h2>
        <p className="d-mut">{PROPOSAL.solana}</p>
        <pre className="d-pre">{anchor}</pre>
        <p className="d-mut" style={{ marginTop: 18 }}>{PROPOSAL.evm}</p>
        <pre className="d-pre">{iface}</pre>
        <p className="d-mut" style={{ marginTop: 18 }}>{PROPOSAL.caps}</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.storeTitle}</h2>
        <ul className="d-b d-mut">
          <li>Published ASCs are stored on Solana with IQ Labs inscriptions. See <a href="/docs/under-the-hood">Under the hood</a>.</li>
          <li>The contract stores the ASC id and version, so the rules can&apos;t change under it.</li>
        </ul>
        <p className="d-dim" style={{ fontSize: 14 }}>{PROPOSAL.storeStatus}</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.signTitle}</h2>
        <pre className="d-pre">{ruling}</pre>
        <p className="d-mut" style={{ fontSize: 16 }}>{PROPOSAL.signLine}</p>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.failTitle}</h2>
        <ul className="d-b d-mut">{PROPOSAL.fail.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <div className="d-wrap d-sec">
        <h2 className="d-h2">{PROPOSAL.limitsTitle}</h2>
        <ul className="d-b d-mut">{PROPOSAL.limits.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </Chrome>
  );
}
