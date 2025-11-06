import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "pricing.json");

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    const defaults = {
      basePerNight: 85,
      includedPersons: 2,
      extraPersonPerNight: 15,
      cleaningFee: 45,
    };
    await fs.writeFile(FILE_PATH, JSON.stringify(defaults, null, 2), "utf-8");
  }
}

export async function GET() {
  await ensureFile();
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const pricing = JSON.parse(raw);
    return NextResponse.json({ pricing });
  } catch (err) {
    console.error("Read pricing failed:", err);
    return NextResponse.json({ pricing: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureFile();
  try {
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
    await fs.writeFile(FILE_PATH, JSON.stringify(pricing, null, 2), "utf-8");
    return NextResponse.json({ ok: true, pricing });
  } catch (err) {
    console.error("Write pricing failed:", err);
    return NextResponse.json({ error: "Write pricing failed" }, { status: 500 });
  }
}