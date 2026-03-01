import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let app = null;

function loadCredential() {
  const value = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!value) return null;
  try {
    if (value.trim().endsWith(".json")) {
      const filename = value.trim().replace(/^\.\//, "");
      const candidates = [
        resolve(process.cwd(), value.trim()),
        resolve(__dirname, "..", filename),
        resolve(__dirname, "..", "..", filename),
      ];
      const path = candidates.find((p) => existsSync(p));
      if (!path) return null;
      const json = readFileSync(path, "utf8");
      return admin.credential.cert(JSON.parse(json));
    }
    return admin.credential.cert(JSON.parse(value));
  } catch (err) {
    console.error("[prompt-service] Firebase Admin init error:", err.message);
    return null;
  }
}

export function getFirebaseAdmin() {
  if (app) return app;
  const credential = loadCredential();
  if (!credential) return null;
  try {
    app = admin.initializeApp({ credential });
    return app;
  } catch (err) {
    console.error("[prompt-service] Firebase Admin init error:", err.message);
    return null;
  }
}

export async function verifyIdToken(idToken) {
  const firebase = getFirebaseAdmin();
  if (!firebase) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch (err) {
    return null;
  }
}
