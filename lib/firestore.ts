import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { DenialPromptsSchema } from "./denialPrompts";

const COLLECTION = "config";
const DOC_ID = "denial-prompts";

const DEBUG = process.env.VERCEL === "1";

function getPrivateKey(): string | null {
  const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64) {
    try {
      const decoded = Buffer.from(base64, "base64").toString("utf-8");
      if (DEBUG) console.log("[firestore] FIREBASE_PRIVATE_KEY_BASE64 decoded OK, length:", decoded.length);
      return decoded;
    } catch (e) {
      if (DEBUG) console.error("[firestore] FIREBASE_PRIVATE_KEY_BASE64 decode failed:", e instanceof Error ? e.message : e);
      return null;
    }
  }
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    if (DEBUG) console.log("[firestore] No FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64");
    return null;
  }
  if (DEBUG) console.log("[firestore] Using FIREBASE_PRIVATE_KEY (raw)");
  return raw.replace(/\\n/g, "\n");
}

function getFirebaseApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (DEBUG) {
    console.log("[firestore] Env check:", {
      projectId: projectId ? "set" : "MISSING",
      clientEmail: clientEmail ? "set" : "MISSING",
      privateKey: privateKey ? "set" : "MISSING",
    });
  }

  if (!projectId || !clientEmail || !privateKey) return null;

  const apps = getApps();
  if (apps.length > 0) return getApp() as App;

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (err) {
    if (DEBUG) console.error("[firestore] initializeApp failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function getPromptsFromFirestore(): Promise<DenialPromptsSchema | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const db = getFirestore(app);
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();
    return doc.exists ? (doc.data() as DenialPromptsSchema) : null;
  } catch {
    return null;
  }
}

export async function setPromptsInFirestore(
  data: DenialPromptsSchema
): Promise<{ ok: true } | { ok: false; error: string }> {
  const app = getFirebaseApp();
  if (!app) return { ok: false, error: "Firebase not configured. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY or FIREBASE_PRIVATE_KEY_BASE64." };

  try {
    const db = getFirestore(app);
    await db.collection(COLLECTION).doc(DOC_ID).set(data);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Firestore save error:", err);
    return { ok: false, error: `Firestore: ${msg}` };
  }
}

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_BASE64)
  );
}
