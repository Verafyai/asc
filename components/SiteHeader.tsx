/**
 * Reference implementation of the unified product header (DESIGN.md §3, UNIFIED_HEADER_SPEC.md).
 * Copy into the repo, wire `credits` to the shared credits client, keep markup and class names.
 * Styling lives in tokens.css (.site-header*, .credits-badge*, .blog-header*).
 *
 * Order is fixed:
 *   >=1100px  [lockup] ................ [nav ≤5] | [Verafy.ai ↗] [credits badge]
 *   <1100px   [Menu] [lockup] ........................... [credits badge]
 * Rules the props enforce:
 *   - Menu button is FAR LEFT, before the lockup, whenever it shows. 44×44.
 *   - Lockup (icon + name) is always visible down to 320px. The stage pill stays on phones, just tighter.
 *   - Lockup links to this product's own home: root-relative (default "/"), aria-label "<name> home".
 *     Never "#", never verafy.ai (the "Verafy.ai ↗" link does that).
 *   - Credits badge is last and flush right.
 * Header sizes 15/14/10px are documented exceptions to the 16px floor (data-allow-small-text).
 */
"use client";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export type HeaderLink = { href: string; label: string; current?: boolean };
export type Credits = { count: number | null; free?: boolean; onBuy: () => void };

type ProductProps = {
  variant?: "product";
  icon: ReactNode;               // 24px inline SVG using currentColor (teal via CSS). Never a recoloured PNG.
  name: string;                  // "Bias Detector", "Swarm Explorer", "Fact Checker", "Perspective", "Lineage", "Savor.love"
  beta?: boolean;                // deprecated: use stage
  stage?: "alpha" | "beta";      // release-stage pill after the name. Alpha = amber, Beta = teal
  homeHref?: string;             // root-relative. "/" on a subdomain root; "/ask/fact-check" for Fact Checker
  links?: HeaderLink[];          // max 5
  verafyLink?: boolean;          // "Verafy.ai ↗". Default true; false on Lineage/Savor/rexstjohn.com
  credits?: Credits;             // omit only on sites that do not sell credits
};
type BlogProps = {
  variant: "blog";
  wordmark: ReactNode;           // white VERAFY wordmark SVG, 20px tall
  links?: HeaderLink[];          // Home · Blog
  onToggleTheme: () => void;
  social: { discord: string; telegram: string; x: string };
};

const MAX_LINKS = 5;

function assertHomeHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    throw new Error(`SiteHeader: homeHref must be root-relative (got "${href}"). The lockup goes to this product's home, not verafy.ai.`);
  }
  return href;
}

function useMenu() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, setOpen, btn };
}

function MenuButton({ open, onClick, btn }: { open: boolean; onClick: () => void; btn: RefObject<HTMLButtonElement | null> }) {
  return (
    <button ref={btn} type="button" className="site-header__menu" aria-expanded={open} aria-controls="site-menu"
      aria-label={open ? "Close menu" : "Menu"} onClick={onClick} data-header-menu>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
      </svg>
    </button>
  );
}

function CreditsBadge({ count, free = true, onBuy }: Credits) {
  const full = count == null ? "…" : count.toLocaleString("en-US");
  const short = count == null ? "…" : count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count);
  const label = count == null ? "Credits loading" : `${full}${free ? " free" : ""} credits`;
  return (
    <div className="credits-badge" data-credits-badge data-allow-small-text>
      <span className="credits-badge__balance" aria-label={label} role="status">
        <span className="credits-badge__dot" aria-hidden="true" />
        <span className="credits-badge__count credits-badge__count--full" aria-hidden="true">{full}</span>
        <span className="credits-badge__count credits-badge__count--short" aria-hidden="true">{short}</span>
        <span className="credits-badge__words" aria-hidden="true">{free ? "free credits" : "credits"}</span>
      </span>
      <button type="button" className="credits-badge__buy" onClick={onBuy} aria-label="Buy more credits">
        <span className="credits-badge__buy-full">Buy more</span>
        <span className="credits-badge__buy-short" aria-hidden="true">Buy</span>
      </button>
    </div>
  );
}

export function SiteHeader(props: ProductProps | BlogProps) {
  const { open, setOpen, btn } = useMenu();
  const links = (props.links ?? []).slice(0, MAX_LINKS);
  if (process.env.NODE_ENV !== "production" && (props.links?.length ?? 0) > MAX_LINKS) {
    console.warn(`SiteHeader: ${props.links?.length} links given, max is ${MAX_LINKS}. Fix the IA.`);
  }

  if (props.variant === "blog") {
    return (
      <header className="site-header site-header--blog" data-site-header>
        <div className="site-header__inner" data-header-inner>
          <MenuButton open={open} onClick={() => setOpen((o) => !o)} btn={btn} />
          <a className="site-header__brand" href="/" aria-label="Verafy blog home" data-lockup>
            {props.wordmark}
          </a>
          <div className="site-header__right">
            <nav className="site-header__nav" aria-label="Primary" data-allow-small-text>
              {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
            </nav>
            <span className="site-header__divider" aria-hidden="true" />
            <div className="blog-header__icons">
              <button type="button" className="blog-header__icon" aria-label="Toggle theme" onClick={props.onToggleTheme}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>
              </button>
              <a className="blog-header__icon" href={props.social.discord} aria-label="Verafy on Discord">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5.5A16 16 0 0 0 15 4l-.5 1a14 14 0 0 0-5 0L9 4a16 16 0 0 0-4 1.5C2.5 9.3 1.8 13 2.2 16.6A16 16 0 0 0 7 19l1-1.6a10 10 0 0 1-1.6-.8l.4-.3a11.5 11.5 0 0 0 10.4 0l.4.3a10 10 0 0 1-1.6.8L17 19a16 16 0 0 0 4.8-2.4c.5-4.2-.8-7.9-2.8-11.1ZM9 14.5c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Zm6 0c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Z" /></svg>
              </a>
              <a className="blog-header__icon" href={props.social.telegram} aria-label="Verafy on Telegram">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.2 2.9 11.4c-1 .4-1 1.6 0 1.9l4.6 1.4 1.8 5.4c.2.7 1.1.9 1.6.4l2.6-2.4 4.6 3.4c.6.4 1.4.1 1.6-.6l3.2-15.1c.2-1-.7-1.8-1.7-1.4ZM9.6 14.6l-.4 3.5-1.4-4.3L17.6 7.6Z" /></svg>
              </a>
              <a className="blog-header__icon" href={props.social.x} aria-label="Verafy on X">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.5l11.2 14.5Z" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div id="site-menu" className="site-header__panel" data-open={open}>
          {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
        </div>
      </header>
    );
  }

  const { icon, name, beta = false, stage: stageProp, homeHref = "/", verafyLink = true, credits } = props;
  const stage = stageProp ?? (beta ? "beta" : undefined);
  const hasMenu = links.length > 0 || verafyLink;
  return (
    <header className="site-header" data-site-header>
      <div className="site-header__inner" data-header-inner>
        {hasMenu && <MenuButton open={open} onClick={() => setOpen((o) => !o)} btn={btn} />}
        <a className="site-header__brand" href={assertHomeHref(homeHref)} aria-label={`${name} home`} data-lockup>
          <span className="site-header__icon" aria-hidden="true">{icon}</span>
          <span className="site-header__name">{name}</span>
          {stage && <span className="site-header__beta site-header__stage" data-stage={stage} data-product-stage data-allow-small-text>{stage === "alpha" ? "Alpha" : "Beta"}</span>}
        </a>
        <div className="site-header__right">
          {links.length > 0 && (
            <nav className="site-header__nav" aria-label="Primary" data-allow-small-text>
              {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
            </nav>
          )}
          {verafyLink && (
            <>
              <span className="site-header__divider" aria-hidden="true" />
              <a className="site-header__verafy" href="https://www.verafy.ai" data-allow-small-text>
                Verafy.ai<span aria-hidden="true">↗</span>
              </a>
            </>
          )}
          {credits && <CreditsBadge {...credits} />}
        </div>
      </div>
      {hasMenu && (
        <div id="site-menu" className="site-header__panel" data-open={open}>
          {links.map((l) => <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>)}
          {verafyLink && <a href="https://www.verafy.ai">Verafy.ai ↗</a>}
        </div>
      )}
    </header>
  );
}

/* Usage (per product):
<SiteHeader name="Bias Detector" beta icon={<ScaleIcon />} homeHref="/"
  links={[{ href: "/", label: "Overview", current: true }, { href: "/questions", label: "Questions" },
          { href: "/leaderboard", label: "Leaderboard" }, { href: "/models", label: "Models" }, { href: "/benchmark", label: "Benchmark" }]}
  credits={{ count: 1000, free: true, onBuy: openBuy }} />
<SiteHeader name="Swarm Explorer" icon={<SwarmIcon />} links={[{ href: "/ask", label: "Ask" }, { href: "/validators", label: "Validators" }]} credits={...} />
<SiteHeader name="Fact Checker" icon={<FactIcon />} homeHref="/ask/fact-check"
  links={[{ label: "Fact check", href: "/ask/fact-check" }, { label: "Batch", href: "/ask/batch-fact-check" }]} credits={...} />
<SiteHeader name="Perspective" beta icon={<PerspectiveIcon />} links={[{ href: "/perspectivepedia", label: "Perspectivepedia" }]} credits={...} />
<SiteHeader name="Lineage" icon={<LineageIcon />} verafyLink={false} links={[...]} credits={...} />   // inside <html data-theme="lineage">
<SiteHeader variant="blog" wordmark={<VerafyWordmark />} links={[{ href: "https://www.verafy.ai", label: "Home" }, { href: "/", label: "Blog", current: true }]} ... />
*/
