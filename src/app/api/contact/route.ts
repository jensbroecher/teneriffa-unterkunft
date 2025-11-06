import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const transportEnabled = !!process.env.EMAIL_HOST;

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

    const to = process.env.EMAIL_TO ?? process.env.EMAIL_USER;
    try {
      await transporter.sendMail({
        from: `Casa Tenerife <${process.env.EMAIL_USER}>`,
        to,
        replyTo: email,
        subject: `Kontaktanfrage von ${name}`,
        text: message,
      });
    } catch (err) {
      console.error("Mail send error:", err);
      return NextResponse.json({ error: "Mail send failed" }, { status: 500 });
    }
  } else {
    console.log("CONTACT MESSAGE (no mail configured):", { name, email, message });
  }

  return NextResponse.json({ ok: true });
}