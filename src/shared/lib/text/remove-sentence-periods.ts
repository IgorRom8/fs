export function removeSentencePeriods(text: string) {
  return text.replace(/\.(?=\s|$)/g, "");
}
