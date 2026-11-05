import "@/styles/chrome.css";
import { BLOG_POST_URL, FOOTER_LINE, SIMD_DISCUSSION_URL } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="foot">
      {FOOTER_LINE} The three SIMDs are drafts. <a href={BLOG_POST_URL}>Bringing Inference Programs To Solana</a> · <a href={SIMD_DISCUSSION_URL}>Discussion #724</a>
    </footer>
  );
}
