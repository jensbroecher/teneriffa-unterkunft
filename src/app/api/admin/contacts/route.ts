import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "contacts.json");
  try {
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, "[]", "utf-8");
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const contacts = (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    })();
    return NextResponse.json({ contacts });
  } catch (err) {
    console.error("Read contacts failed:", err);
    return NextResponse.json({ contacts: [] });
  }
}