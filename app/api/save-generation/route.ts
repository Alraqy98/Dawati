import { NextResponse } from "next/server";
import { supabase, SizePresetId } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, imageUrl, parentGenerationId, sizePresetId } = body as {
      prompt: string;
      imageUrl: string;
      parentGenerationId?: string | null;
      sizePresetId?: SizePresetId;
    };

    if (!prompt || !imageUrl) {
      return NextResponse.json(
        { error: "Missing prompt or imageUrl" },
        { status: 400 }
      );
    }

    const { data: design } = await supabase
      .from("designs")
      .insert({
        user_id: null
      })
      .select("id")
      .single();

    const { data: generation, error } = await supabase
      .from("generations")
      .insert({
        design_id: design?.id,
        parent_generation_id: parentGenerationId ?? null,
        prompt,
        image_url: imageUrl,
        size_preset_id: sizePresetId ?? null
      })
      .select("id")
      .single();

    if (error || !generation) {
      return NextResponse.json(
        { error: "Failed to save generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: generation.id });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save generation" },
      { status: 500 }
    );
  }
}

