import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PRODUCT_NAME, SITE_URL, TAGLINE } from "@/lib/brand";

const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

const description = "Three draft SIMDs to bring inference programs to Solana: prompts and context stored on chain, run by AI models off chain, with signed, provable rulings that programs act on.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${TAGLINE} · ${PRODUCT_NAME}`, template: `%s · ${PRODUCT_NAME}` },
  description,
  openGraph: { title: `${PRODUCT_NAME}: ${TAGLINE}`, description, siteName: `${PRODUCT_NAME} by Verafy`, type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="verafy" className={`${sans.variable} ${mono.variable}`}>
      <body className={sans.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
