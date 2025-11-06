import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Range = { start: string; end: string };

const FILE_PATH = path.join(process.cwd(), "data", "unavailable.json");

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf-8");
  }
}

async function readList(): Promise<Range[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf-8");
  try {
    return JSON.parse(raw) as Range[];
  } catch {
    return [];
  }
}

async function writeList(list: Range[]) {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
}

export async function GET() {
  const list = await readList();
  return NextResponse.json({ unavailable: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const start = body?.start;
  const end = body?.end;
  if (!start || !end) {
    return NextResponse.json({ error: "Missing start/end" }, { status: 400 });
  }
  const list = await readList();
  list.push({ start, end });
  await writeList(list);
  return NextResponse.json({ ok: true, unavailable: list });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const index = typeof body?.index === "number" ? body.index : undefined;
  const list = await readList();
  if (typeof index === "number") {
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
    }
  } else {
    // clear all
    list.length = 0;
  }
  await writeList(list);
  return NextResponse.json({ ok: true, unavailable: list });
}