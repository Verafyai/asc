"use client";
import { useEffect } from "react";

/** Hash routing between the three SIMDs (#programs, #attestations, #rulings) and a table of contents that follows the scroll. */
export default function SimdsScript() {
  useEffect(() => {
    const docs = ["programs", "attestations", "rulings"];
    function pick() {
      const h = decodeURIComponent(location.hash.slice(1)) || "programs";
      const d = docs.filter((k) => h === k || h.indexOf(k + "-") === 0)[0] || "programs";
      document.querySelectorAll<HTMLElement>(".simd").forEach((a) => a.classList.toggle("on", a.id === d));
      document.querySelectorAll<HTMLElement>(".grp").forEach((g) => g.classList.toggle("on", g.dataset.doc === d));
      if (h === d) window.scrollTo(0, 0);
      else { const el = document.getElementById(h); if (el) el.scrollIntoView(); }
    }
    window.addEventListener("hashchange", pick); pick();
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a"));
    const onScroll = () => {
      let best: HTMLAnchorElement | null = null;
      links.forEach((a) => { const t = document.getElementById(a.getAttribute("href")!.slice(1)); if (t && t.offsetParent && t.getBoundingClientRect().top < 120) best = a; });
      links.forEach((a) => a.classList.toggle("on", a === best));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("hashchange", pick); window.removeEventListener("scroll", onScroll); };
  }, []);
  return null;
}
