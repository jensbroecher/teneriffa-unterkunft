import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const provided = typeof body?.password === "string" ? body.password : "";
  const expected = process.env.EDIT_PASSWORD ?? "teneriffa 2026!";
  if (provided === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}