import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

  // Persist booking to server JSON file for admin area
  try {
    const filePath = path.join(process.cwd(), "data", "bookings.json");
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, "[]", "utf-8");
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const list = (() => { try { return JSON.parse(raw); } catch { return []; } })();
    list.push({ name, email, phone, persons, start, end });
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Persist booking failed:", err);
  }

  return NextResponse.json({ ok: true });
}