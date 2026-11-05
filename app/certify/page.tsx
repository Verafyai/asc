import { Suspense } from "react";
import Chrome from "@/components/Chrome";
import CertifyForm from "@/components/CertifyForm";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta("Certify", "/certify");

export default function Page() {
  return (
    <Chrome current="/certify">
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 32 }}>
        <div className="d-eb">Certify · a repository push against an inscribed standard</div>
        <h1 className="d-h1 d-md">Certify a repo</h1>
        <p className="d-lede">Pick a standard, point at a GitHub push, and the jury checks the code rule by rule. The result is checksummed, scored and inscribed on Solana with its ASCII badge.</p>
      </div>
      <Suspense fallback={<div className="d-wrap d-mut">Loading the form.</div>}>
        <CertifyForm />
      </Suspense>
    </Chrome>
  );
}
