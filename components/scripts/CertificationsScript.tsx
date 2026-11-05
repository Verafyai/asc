"use client";
import { useEffect } from "react";

/** Maps a repo, a commit and a standard onto the RequestRuling fields. Ported from the reference build. */
export default function CertificationsScript() {
  useEffect(() => {
    const $ = (i: string) => document.getElementById(i) as HTMLInputElement & HTMLSelectElement;
    const q = new URLSearchParams(location.search).get("std");
    if (q) Array.from($("std").options).forEach((o) => { if (o.text.indexOf(q) === 0) $("std").value = o.text; });
    const esc = (s: string) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    function map() {
      const r = esc($("repo").value), c = esc($("commit").value), s = esc($("std").value);
      $("map").innerHTML = [
        ["Program", "ASC repository certification (frozen)"],
        ["Internal context", s + " from asc-standards, pinned at a commit"],
        ["Request prompt", "Does " + r + " at " + c + " meet " + s + "? Rule by rule, cite file and lines."],
        ["External context", r + " at commit " + c + " (git, every file hashed)"],
        ["Input", '{ "type": "certification", "repo": "' + r + '", "commit": "' + c + '", "standard": "' + s + '" }'],
        ["Jury", "5 evaluators, quorum 4, L1, distinct families"],
        ["Outcomes", "pass, fail, needs_evidence (default)"],
        ["Payment", "QuoteRuling, then an escrowed budget; unspent is refunded"],
        ["Review", "ReviewPolicy: anyone may challenge, with a bond"],
      ].map((x) => "<tr><td>" + x[0] + "</td><td>" + x[1] + "</td></tr>").join("");
    }
    const ids = ["repo", "commit", "std"];
    ids.forEach((i) => $(i).addEventListener("input", map));
    $("go").onclick = map;
    map();
    return () => ids.forEach((i) => $(i)?.removeEventListener("input", map));
  }, []);
  return null;
}
