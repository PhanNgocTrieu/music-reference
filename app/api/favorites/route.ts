import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { toggleFavorite, getUserFavorites } from "@/lib/db/queries";

const toggleSchema = z.object({
  artistId: z.string().uuid().optional(),
  releaseId: z.string().uuid().optional(),
}).refine((d) => d.artistId ?? d.releaseId, { message: "artistId or releaseId required" });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favs = await getUserFavorites(session.user.id);
  return NextResponse.json(favs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await toggleFavorite(session.user.id, parsed.data);
  return NextResponse.json(result);
}
