import Replicate from "replicate";

if (!process.env.REPLICATE_API_TOKEN) {
  // eslint-disable-next-line no-console
  console.warn("REPLICATE_API_TOKEN is not set");
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || ""
});

export type GenerateImageParams = {
  prompt: string;
  width: number;
  height: number;
};

export async function generateInvitationBackground({
  prompt,
  width,
  height
}: GenerateImageParams): Promise<string> {
  const defaultModel: `${string}/${string}:${string}` =
    "stability-ai/sdxl-lightning:dc9d0d8e4a9c4f8e8b9b8e96e65e6a85";
  const model =
    (process.env.REPLICATE_SDXL_MODEL as `${string}/${string}:${string}` | undefined) ??
    defaultModel;

  const output = (await replicate.run(model, {
    input: {
      prompt,
      width,
      height,
      // keep prompt-only background
      negative_prompt: "text, words, typography, watermark, logo",
      num_inference_steps: 25
    }
  })) as string[] | string;

  if (Array.isArray(output)) {
    return output[0];
  }

  return output;
}

