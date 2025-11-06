import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type Booking = {
  name: string;
  email?: string;
  phone?: string;
  persons: number;
  start: string;
  end: string;
};

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("bookings")
    .select("name,email,phone,persons,start,end")
    .order("start", { ascending: false });
  if (error) {
    console.error("Supabase GET bookings error:", error);
    return NextResponse.json({ bookings: [] });
  }
  const list: Booking[] = (data ?? []).map((r: any) => ({
    name: r.name,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    persons: Number(r.persons),
    start: new Date(r.start).toISOString(),
    end: new Date(r.end).toISOString(),
  }));
  return NextResponse.json({ bookings: list });
}