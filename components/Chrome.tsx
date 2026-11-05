import "@/app/tokens.css";
import "@/app/app.css";
import "@/app/site.css";

/** Frame for the older evidence pages (/inscribed, /runs, /standards/:code). Header and footer come from the root layout. */
export default function Chrome({ children }: { children: React.ReactNode; current?: string }) {
  return <main className="legacy">{children}</main>;
}
