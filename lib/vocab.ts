/** Display-only wording for recorded data. Recorded files and hashes keep their original bytes. */
export function vocab(s: string): string {
  return s
    .replace(/\bboth committees\b/g, "both juries")
    .replace(/\bsecond committee\b/g, "second jury")
    .replace(/\bThe swarm\b/g, "The jury")
    .replace(/\bthe swarm\b/g, "the jury")
    .replace(/\bswarm reached\b/g, "jury reached")
    .replace(/\bwriter\.codeIn\b/g, "an IQ Labs inscription")
    .replace(/\bvia IQ Labs codeIn\b/g, "via an IQ Labs inscription")
    .replace(/\bIQ Labs codeIn inscription\b/g, "IQ Labs inscription")
    .replace(/\bIQ readCodeIn round trip\b/g, "IQ read-back round trip")
    .replace(/\breader\.readCodeIn\b/g, "the IQ reader")
    .replace(/\breadCodeIn\b/g, "IQ read-back")
    .replace(/\bcodeIn\b/g, "IQ inscription");
}
