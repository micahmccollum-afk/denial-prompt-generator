import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { DenialPromptsSchema } from "./denialPrompts";

const COLLECTION = "config";
const DOC_ID = "denial-prompts";

function getFirebaseApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

  const apps = getApps();
  if (apps.length > 0) return getApp() as App;

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  } catch {
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

export async function setPromptsInFirestore(data: DenialPromptsSchema): Promise<boolean> {
  const app = getFirebaseApp();
  if (!app) return false;

  try {
    const db = getFirestore(app);
    await db.collection(COLLECTION).doc(DOC_ID).set(data);
    return true;
  } catch {
    return false;
  }
}

export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}
