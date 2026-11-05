import Chrome from "@/components/Chrome";

export const DOCS = [
  ["/docs", "Quickstart"],
  ["/docs/write", "Write an ASC"],
  ["/docs/publish", "Publish an ASC"],
  ["/docs/request-a-ruling", "Request a ruling"],
  ["/docs/enforce", "Enforce a ruling"],
  ["/docs/agents-and-models", "Guard agents and models"],
  ["/docs/disputes", "Disputes"],
  ["/docs/standards", "Standards and certification"],
  ["/docs/credits", "Credits and pricing"],
  ["/docs/api", "API reference"],
  ["/docs/trust", "Trust and limits"],
  ["/docs/recorded-runs", "Recorded runs"],
  ["/docs/under-the-hood", "Under the hood: inscription"],
] as const;

export default function DocsFrame({ current, children }: { current: string; children: React.ReactNode }) {
  return (
    <Chrome current={current.startsWith("/docs") || current === "/proposal" || current === "/inscribed" ? current : "/docs"}>
      <div className="d-wrap d-docs">
        <nav aria-label="Docs">
          {DOCS.map(([href, label]) => (
            <a key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</a>
          ))}
        </nav>
        <article>{children}</article>
      </div>
    </Chrome>
  );
}
