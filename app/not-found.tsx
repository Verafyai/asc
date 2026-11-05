import Chrome from "@/components/Chrome";

export default function NotFound() {
  return (
    <Chrome>
      <div className="d-wrap" style={{ paddingTop: 56, paddingBottom: 48 }}>
        <h1 className="d-h1 d-md">Page not found</h1>
        <p className="d-lede">That URL is not on this site. Recorded runs live under Docs.</p>
        <p><a href="/">Home</a> · <a href="/docs">Docs</a></p>
      </div>
    </Chrome>
  );
}
