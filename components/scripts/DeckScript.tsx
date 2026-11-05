"use client";
import { useEffect } from "react";

/** The home deck: 19 slides, arrows, counter, title, dots, keyboard arrows and the speaker script. Ported from the reference build. */
export const SLIDES: Array<[string, string]> = [
  ["cover", "Bringing Inference Programs To Solana"],
  ["gap", "Motivation: trustless systems still run on human judgment"],
  ["idea", "A prompt on chain. Models off chain. A signed, provable answer."],
  ["whyproof", "Why proof of inference is the key"],
  ["offchain", "The proof problem: too big for the chain"],
  ["whynow", "Why now: two missing pieces"],
  ["possible", "What it would make possible"],
  ["draft", "Six pieces, three SIMDs"],
  ["anatomy", "Anatomy of an Actually Smart Contract"],
  ["calling", "Calling an Actually Smart Contract"],
  ["request", "What goes into a request"],
  ["ruling", "What the contract writes back: a signed ruling"],
  ["rulingacct", "What a ruling records on chain"],
  ["challenge", "Any ruling can be challenged. None is erased."],
  ["predict", "Predictions and prediction markets"],
  ["systemone", "System 1 screens. System 2 rules."],
  ["small", "Small, private and changeable"],
  ["doesnt", "Honest limits"],
  ["next", "Next step: open the idea to Solana"],
];

export default function DeckScript() {
  useEffect(() => {
    const S = SLIDES;
    const $ = (id: string) => document.getElementById(id)!;
    const track = $("track"), dots = $("dots"), deck = $("deck");
    const notes: Record<string, string> = {};
    track.innerHTML = ""; dots.innerHTML = "";
    let cur = 0;
    S.forEach((s, i) => {
      const f = document.createElement("figure"); f.className = "slide"; f.setAttribute("role", "group");
      f.setAttribute("aria-roledescription", "slide"); f.setAttribute("aria-label", `${i + 1} of ${S.length}: ${s[1]}`);
      if (s[0] === "idea") {
        f.innerHTML = '<div class="live"><span class="e">THE IDEA IN ONE PARAGRAPH</span><p class="t">A prompt on chain. Models off chain. A signed, provable answer.</p><img src="/simd-flow.svg" alt="Animation: a Solana program requests a ruling; AI models off chain read the prompt and context stored on chain, vote and attach proofs; the signed ruling is recorded on chain; the program verifies it and acts."></div>';
      } else {
        f.innerHTML = `<img src="/slides/${s[0]}.jpg" alt="${s[1].replace(/"/g, "&quot;")}"${i > 1 ? ' loading="lazy"' : ""}>`;
      }
      track.appendChild(f);
      const d = document.createElement("button"); d.setAttribute("role", "tab"); d.setAttribute("aria-label", `Slide ${i + 1}: ${s[1]}`);
      d.onclick = () => go(i); dots.appendChild(d);
    });
    function go(i: number) { i = Math.max(0, Math.min(S.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }
    function show() {
      $("count").textContent = `${cur + 1} / ${S.length}`;
      $("ttl").textContent = S[cur][1];
      $("notes").textContent = notes[S[cur][0]] || "";
      Array.from(dots.children).forEach((d, j) => { d.classList.toggle("on", j === cur); d.setAttribute("aria-selected", j === cur ? "true" : "false"); });
      ($("prev") as HTMLButtonElement).disabled = cur === 0; ($("next") as HTMLButtonElement).disabled = cur === S.length - 1;
    }
    let alive = true;
    fetch("/slides/slides.json").then((r) => r.json()).then((a: Array<{ id: string; notes: string }>) => { if (!alive) return; a.forEach((x) => { notes[x.id] = x.notes; }); show(); }).catch(() => {});
    let t: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) { cur = i; show(); } }, 60); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); } };
    const onResize = () => { track.scrollLeft = cur * track.clientWidth; };
    track.addEventListener("scroll", onScroll);
    track.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    $("prev").onclick = () => go(cur - 1);
    $("next").onclick = () => go(cur + 1);
    const nb = $("nb");
    nb.onclick = () => { const on = deck.classList.toggle("shownotes"); nb.textContent = on ? "Hide script" : "Show script"; nb.setAttribute("aria-pressed", String(on)); };
    show();
    return () => {
      alive = false; clearTimeout(t);
      track.removeEventListener("scroll", onScroll); track.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize);
    };
  }, []);
  return null;
}
