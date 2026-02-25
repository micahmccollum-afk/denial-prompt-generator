import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { DenialPromptsSchema } from "@/lib/denialPrompts";
import {
  getPromptsFromFirestore,
  setPromptsInFirestore,
  isFirebaseConfigured,
} from "@/lib/firestore";

const DATA_PATH = path.join(process.cwd(), "data", "denial-prompts.json");

async function readFromFile(): Promise<DenialPromptsSchema> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as DenialPromptsSchema;
}

async function readPrompts(): Promise<DenialPromptsSchema> {
  if (isFirebaseConfigured()) {
    const fromFirestore = await getPromptsFromFirestore();
    if (fromFirestore) return fromFirestore;
  }
  return readFromFile();
}

export async function GET() {
  try {
    const data = await readPrompts();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error reading denial prompts:", err);
    return NextResponse.json(
      { error: "Failed to read denial prompts" },
      { status: 500 }
    );
  }
}

function validateSchema(body: unknown): body is DenialPromptsSchema {
  if (!body || typeof body !== "object") return false;
  const obj = body as Record<string, unknown>;
  if (!Array.isArray(obj.categories)) return false;
  for (const cat of obj.categories) {
    if (typeof cat?.id !== "string" || typeof cat?.label !== "string") return false;
    if (!Array.isArray(cat.keywords)) return false;
    for (const kw of cat.keywords) {
      if (
        typeof kw?.id !== "string" ||
        typeof kw?.label !== "string" ||
        typeof kw?.template !== "string"
      )
        return false;
    }
  }
  return true;
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!validateSchema(body)) {
      return NextResponse.json(
        { error: "Invalid data: expected { categories: [...] }" },
        { status: 400 }
      );
    }

    if (isFirebaseConfigured()) {
      const ok = await setPromptsInFirestore(body);
      if (ok) return NextResponse.json({ success: true });
      return NextResponse.json(
        { error: "Failed to save to Firestore" },
        { status: 500 }
      );
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save denial prompts";
    console.error("Error writing denial prompts:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
