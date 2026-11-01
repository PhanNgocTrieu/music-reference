import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { upsertRating } from "@/lib/db/queries";

const schema = z.object({
  releaseId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const score = await upsertRating(session.user.id, parsed.data.releaseId, parsed.data.score);
  return NextResponse.json({ score });
}
