import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Booking = {
  name: string;
  email?: string;
  phone?: string;
  persons: number;
  start: string;
  end: string;
};

const FILE_PATH = path.join(process.cwd(), "data", "bookings.json");

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf-8");
  }
}

async function readList(): Promise<Booking[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf-8");
  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

export async function GET() {
  const list = await readList();
  return NextResponse.json({ bookings: list });
}