import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./tokens.css";
import "./app.css";
import "./site.css";
import { PRODUCT_NAME, SITE_URL, TAGLINE } from "@/lib/brand";

const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const description = "An actually smart contract (ASC) is a policy, a set of rules or a prompt, written in plain language and inscribed on Solana. An AI jury reads it, votes, and signs the result. Play money only. No coin, no token.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description,
  openGraph: { title: `${PRODUCT_NAME}: ${TAGLINE}`, description, siteName: `${PRODUCT_NAME} by Verafy`, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="verafy" className={`${sans.className} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
