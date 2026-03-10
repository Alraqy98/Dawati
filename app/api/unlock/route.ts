import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationId } = body as { generationId: string };

    if (!generationId) {
      return NextResponse.json(
        { error: "Missing generationId" },
        { status: 400 }
      );
    }

    await supabase.from("downloads").insert({
      generation_id: generationId,
      paid: true
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return NextResponse.json(
      { error: "Failed to unlock download" },
      { status: 500 }
    );
  }
}

