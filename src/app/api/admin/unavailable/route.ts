import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type Range = { start: string; end: string };

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("unavailable")
    .select("id,start,end")
    .order("start", { ascending: true });

  if (error) {
    console.error("Supabase GET unavailable error:", error);
    return NextResponse.json({ unavailable: [] });
  }

  const list: Range[] = (data ?? []).map((r: any) => ({
    start: new Date(r.start).toISOString(),
    end: new Date(r.end).toISOString(),
  }));
  return NextResponse.json({ unavailable: list });
}

export async function POST(req: NextRequest) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => null);
  const start = body?.start;
  const end = body?.end;
  if (!start || !end) {
    return NextResponse.json({ error: "Missing start/end" }, { status: 400 });
  }

  const { error: insertError } = await sb
    .from("unavailable")
    .insert({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  if (insertError) {
    console.error("Supabase POST unavailable insert error:", insertError);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  const { data } = await sb
    .from("unavailable")
    .select("start,end")
    .order("start", { ascending: true });
  const list: Range[] = (data ?? []).map((r: any) => ({
    start: new Date(r.start).toISOString(),
    end: new Date(r.end).toISOString(),
  }));
  return NextResponse.json({ ok: true, unavailable: list });
}

export async function DELETE(req: NextRequest) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => ({}));
  const index = typeof body?.index === "number" ? body.index : undefined;

  if (typeof index === "number") {
    const { data } = await sb
      .from("unavailable")
      .select("id")
      .order("start", { ascending: true });
    const rows = data ?? [];
    const row = rows[index];
    if (row?.id != null) {
      await sb.from("unavailable").delete().eq("id", row.id);
    }
  } else {
    await sb.from("unavailable").delete().neq("id", 0); // delete all
  }

  const { data } = await sb
    .from("unavailable")
    .select("start,end")
    .order("start", { ascending: true });
  const list: Range[] = (data ?? []).map((r: any) => ({
    start: new Date(r.start).toISOString(),
    end: new Date(r.end).toISOString(),
  }));
  return NextResponse.json({ ok: true, unavailable: list });
}