import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Persist contact to Supabase (no email sending)
  try {
    const sb = supabaseServer();
    const { error } = await sb.from("contacts").insert({
      name,
      email,
      message,
      date: new Date().toISOString(),
    });
    if (error) {
      console.error("Supabase insert contact failed:", error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }
  } catch (err) {
    console.error("Persist contact (Supabase) failed:", err);
  }

  return NextResponse.json({ ok: true });
}