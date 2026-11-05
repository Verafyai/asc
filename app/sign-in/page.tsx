import Chrome from "@/components/Chrome";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Sign in", "/sign-in");

export default function Page() {
  return (
    <Chrome>
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <div className="d-eb">Account</div>
        <h1 className="d-h1 d-md">Sign in</h1>
        <p className="d-lede">Sign-in is not connected in this build. There is no account, no API key, and no free credits.</p>
        <p className="d-mut">Paid actions still show a quote and a Confirm button. Confirming does not charge a Verafy credits account, because that account is not available here. <a href="/docs/credits">Credits and pricing</a></p>
      </div>
    </Chrome>
  );
}
