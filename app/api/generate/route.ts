import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateImage } from "@/lib/generateImage";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip =
      headers().get("x-forwarded-for")?.split(",")[0] ||
      "anonymous";

    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

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

    const imageUrl = await generateImage({
      prompt,
      width,
      height
    });

    return NextResponse.json({
      imageUrl,
      image_url: imageUrl
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

