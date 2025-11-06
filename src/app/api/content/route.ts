import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "content.json");

async function ensureStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, "{}", "utf8");
  }
}

async function readStore(): Promise<Record<string, string>> {
  await ensureStore();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeStore(data: Record<string, string>) {
  await ensureStore();
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const store = await readStore();
  const text = store[id] ?? null;
  return NextResponse.json({ id, text });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string" || typeof body.text !== "string") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const store = await readStore();
  store[body.id] = body.text;
  await writeStore(store);
  return NextResponse.json({ ok: true });
}