import "@/styles/chrome.css";
import { BLOG_POST_URL, FOOTER_LINE } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="foot">
      {FOOTER_LINE} The three SIMDs are drafts. <a href={BLOG_POST_URL}>Bringing Inference Programs To Solana</a>
    </footer>
  );
}
