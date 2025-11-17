import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("contacts")
    .select("id,name,email,message,date")
    .order("date", { ascending: false });
  if (error) {
    console.error("Supabase GET contacts error:", error);
    return NextResponse.json({ contacts: [] });
  }
  const contacts = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    message: r.message,
    date: new Date(r.date ?? Date.now()).toISOString(),
  }));
  return NextResponse.json({ contacts });
}

export async function DELETE(req: NextRequest) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const name = body?.name;
  const email = body?.email;
  const message = body?.message;
  const date = body?.date;

  try {
    if (id != null) {
      const { error: delError } = await sb.from("contacts").delete().eq("id", id);
      if (delError) {
        console.error("Supabase DELETE contact by id failed:", delError);
      }
    } else if (name && email && message && date) {
      const { error: delError } = await sb
        .from("contacts")
        .delete()
        .eq("name", name)
        .eq("email", email)
        .eq("message", message)
        .eq("date", new Date(date).toISOString());
      if (delError) {
        console.error("Supabase DELETE contact by composite failed:", delError);
      }
    }
  } catch (e) {
    console.error("DELETE /api/admin/contacts failed:", e);
  }

  const { data } = await sb
    .from("contacts")
    .select("id,name,email,message,date")
    .order("date", { ascending: false });
  const contacts = (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    message: r.message,
    date: new Date(r.date ?? Date.now()).toISOString(),
  }));
  return NextResponse.json({ ok: true, contacts });
}