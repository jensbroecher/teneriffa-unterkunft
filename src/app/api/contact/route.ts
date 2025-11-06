import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Persist contact to server JSON (no email sending)
  try {
    const filePath = path.join(process.cwd(), "data", "contacts.json");
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, "[]", "utf-8");
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const list = (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    })();
    list.push({ name, email, message, date: new Date().toISOString() });
    await fs.writeFile(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Persist contact failed:", err);
  }

  return NextResponse.json({ ok: true });
}