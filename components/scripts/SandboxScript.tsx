"use client";
import { useEffect } from "react";

/** tweetnacl 1.0.3 from cdnjs, pinned by version and subresource integrity. */
export const NACL_URL = "https://cdnjs.cloudflare.com/ajax/libs/tweetnacl/1.0.3/nacl-fast.min.js";
export const NACL_SRI = "sha512-aLSwsdjU35MF6PERT7Pic3+X6qL7O+Us8hYQl/gjrPoV4JXUNoCF2Ys3/vfJSiBW1QNxz2WTr4tEo5VcOdHt/g==";
/** The reference build's sandbox script, served as is from public/sandbox/. */
export const SANDBOX_URL = "/sandbox/sandbox.js";

function load(src: string, integrity?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    if (integrity) { s.integrity = integrity; s.crossOrigin = "anonymous"; }
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.body.appendChild(s);
  });
}

export default function SandboxScript() {
  useEffect(() => {
    const w = window as unknown as { nacl?: unknown; __ascSandbox?: boolean };
    if (w.__ascSandbox) return; // React strict mode runs effects twice in development
    w.__ascSandbox = true;
    (w.nacl ? Promise.resolve() : load(NACL_URL, NACL_SRI))
      .then(() => load(SANDBOX_URL))
      .catch((e: Error) => { const log = document.getElementById("log"); if (log) log.textContent = `${e.message}. The sandbox needs tweetnacl from cdnjs.`; });
  }, []);
  return null;
}
