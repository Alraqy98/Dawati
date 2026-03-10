import { NextResponse } from "next/server";
import { generateInvitationBackground } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, width, height } = body as {
      prompt: string;
      width: number;
      height: number;
    };

    if (!prompt || !width || !height) {
      return NextResponse.json(
        { error: "Missing prompt or size" },
        { status: 400 }
      );
    }

    const imageUrl = await generateInvitationBackground({
      prompt,
      width,
      height
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

