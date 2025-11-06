import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("contacts")
    .select("name,email,message,date")
    .order("date", { ascending: false });
  if (error) {
    console.error("Supabase GET contacts error:", error);
    return NextResponse.json({ contacts: [] });
  }
  const contacts = (data ?? []).map((r: any) => ({
    name: r.name,
    email: r.email,
    message: r.message,
    date: new Date(r.date ?? Date.now()).toISOString(),
  }));
  return NextResponse.json({ contacts });
}