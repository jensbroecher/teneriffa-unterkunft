import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const {
    name,
    email,
    phone,
    persons,
    start,
    end,
    nights,
    perNight,
    total,
  } = payload ?? {};

  if (!name || !persons || !start || !end) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const transportEnabled = !!process.env.EMAIL_HOST;

  const text = [
    `Neue Buchungsanfrage`,
    `Name: ${name}`,
    email ? `E-Mail: ${email}` : `E-Mail: —`,
    phone ? `Telefon: ${phone}` : `Telefon: —`,
    `Personen: ${persons}`,
    `Zeitraum: ${start} bis ${end}`,
    nights ? `Nächte: ${nights}` : undefined,
    perNight ? `Preis/Nacht: ${perNight} EUR` : undefined,
    total ? `Gesamtkosten: ${total} EUR` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  if (transportEnabled) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const to = process.env.EMAIL_TO ?? "klausbroecher84@gmail.com";
    try {
      await transporter.sendMail({
        from: `Casa Tenerife <${process.env.EMAIL_USER}>`,
        to,
        replyTo: email ?? undefined,
        subject: `Buchungsanfrage von ${name}`,
        text,
      });
    } catch (err) {
      console.error("Booking mail send error:", err);
      return NextResponse.json({ error: "Mail send failed" }, { status: 500 });
    }
  } else {
    console.log("BOOKING REQUEST (no mail configured):", payload);
  }

  // Persist booking to Supabase
  try {
    const sb = supabaseServer();
    const { error } = await sb.from("bookings").insert({
      name,
      email,
      phone,
      persons: Number(persons),
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      nights: typeof nights === "number" ? nights : null,
      per_night: typeof perNight === "number" ? perNight : null,
      total: typeof total === "number" ? total : null,
    });
    if (error) {
      console.error("Supabase insert booking failed:", error);
    }
  } catch (err) {
    console.error("Persist booking (Supabase) failed:", err);
  }

  return NextResponse.json({ ok: true });
}