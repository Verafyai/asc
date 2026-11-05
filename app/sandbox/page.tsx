import Chrome from "@/components/Chrome";
import SandboxApp from "@/components/SandboxApp";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Sandbox", "/sandbox");

export default function Page() {
  return (
    <Chrome current="/sandbox">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">Sandbox · free · simulated jury</div>
        <h1 className="d-h1 d-md">Try an ASC without spending anything</h1>
        <p className="d-lede">Write rules, send a request, and watch a simulated jury vote. Nothing is inscribed and no model is called. When you are ready, run the same thing with the real jury for credits.</p>
      </div>
      <SandboxApp />
    </Chrome>
  );
}
