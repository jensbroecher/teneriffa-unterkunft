import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("pricing")
    .select("id,base_per_night,included_persons,extra_person_per_night,cleaning_fee")
    .order("id", { ascending: true })
    .limit(1);
  if (error) {
    console.error("Supabase GET pricing error:", error);
    return NextResponse.json({ pricing: null }, { status: 500 });
  }
  let row = (data ?? [])[0];
  if (!row) {
    // Initialize defaults if table empty
    const defaults = {
      id: 1,
      base_per_night: 85,
      included_persons: 2,
      extra_person_per_night: 15,
      cleaning_fee: 45,
    };
    const { error: initError } = await sb.from("pricing").insert(defaults);
    if (initError) {
      console.error("Supabase pricing init error:", initError);
      return NextResponse.json({ pricing: null }, { status: 500 });
    }
    row = defaults;
  }
  const pricing = {
    basePerNight: Number(row.base_per_night),
    includedPersons: Number(row.included_persons),
    extraPersonPerNight: Number(row.extra_person_per_night),
    cleaningFee: Number(row.cleaning_fee),
  };
  return NextResponse.json({ pricing });
}

export async function POST(req: NextRequest) {
  const sb = supabaseServer();
  const body = await req.json();
  const pricing = {
    basePerNight: Number(body.basePerNight),
    includedPersons: Number(body.includedPersons),
    extraPersonPerNight: Number(body.extraPersonPerNight),
    cleaningFee: Number(body.cleaningFee),
  };
  if (
    !isFinite(pricing.basePerNight) ||
    !isFinite(pricing.includedPersons) ||
    !isFinite(pricing.extraPersonPerNight) ||
    !isFinite(pricing.cleaningFee)
  ) {
    return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });
  }

  const { error } = await sb.from("pricing").upsert({
    id: 1,
    base_per_night: pricing.basePerNight,
    included_persons: pricing.includedPersons,
    extra_person_per_night: pricing.extraPersonPerNight,
    cleaning_fee: pricing.cleaningFee,
  });
  if (error) {
    console.error("Supabase POST pricing error:", error);
    return NextResponse.json({ error: "Write pricing failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, pricing });
}