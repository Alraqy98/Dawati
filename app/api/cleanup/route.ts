import { NextResponse } from "next/server";
import { cleanupGeneratedImages } from "../../../scripts/cleanupGeneratedImages";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await cleanupGeneratedImages();

    return NextResponse.json({
      status: "cleanup complete"
    });
  } catch {
    return NextResponse.json(
      { error: "cleanup failed" },
      { status: 500 }
    );
  }
}

