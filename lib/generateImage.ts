import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadGeneratedImage } from "@/lib/uploadGeneratedImage";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn("GOOGLE_API_KEY is not set");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateImage({
  prompt,
  width,
  height
}: {
  prompt: string;
  width: number;
  height: number;
}): Promise<string> {
  if (!genAI) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image-preview",
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        width,
        height
      }
    }
  });

  const fullPrompt = `
Luxury Arabic invitation background.

Design rules:
- elegant minimal ornament frame
- soft gradient or floral background
- luxury wedding invitation aesthetic
- center area empty for text overlay
- no text in the image
- symmetrical composition
- high quality design

Aspect ratio: ${width}:${height}

Description:
${prompt}
`;

  const result = (await Promise.race([
    model.generateContent(fullPrompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Image generation timeout")), 20000)
    )
  ])) as any;

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData);

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini did not return an image");
  }

  const image = imagePart.inlineData.data;

  if (image.length > 10_000_000) {
    throw new Error("Generated image too large");
  }

  const publicUrl = await uploadGeneratedImage(image);
  return publicUrl;
}

