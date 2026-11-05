import type { Metadata } from "next";
import { PRODUCT_NAME } from "@/lib/brand";

/** Canonical and Open Graph URLs are paths. metadataBase resolves them to https://asc.verafy.ai. */
export function pageMeta(title: string, path: string, absolute = false): Metadata {
  return {
    title: absolute ? { absolute: title } : title,
    alternates: { canonical: path },
    openGraph: { url: path, title: absolute ? title : `${title} · ${PRODUCT_NAME}` },
  };
}
