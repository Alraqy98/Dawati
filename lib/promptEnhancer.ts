export function enhancePrompt(userPrompt: string, _style?: string) {
  const trimmedUserPrompt = userPrompt.trim();

  const baseTemplate =
    "Elegant Arabic invitation background design, " +
    "luxury gold or beige palette, " +
    "Islamic geometric patterns or arabesque floral decorations, " +
    "minimal empty space for Arabic typography, " +
    "clean invitation card background, " +
    "high quality lighting, " +
    "not western wedding style.";

  if (!trimmedUserPrompt) {
    return baseTemplate;
  }

  return `${baseTemplate} User request (Arabic or English): ${trimmedUserPrompt}`;
}


