import admin from "firebase-admin";

let app = null;

export function getFirebaseAdmin() {
  if (app) return app;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  try {
    const credential = admin.credential.cert(JSON.parse(json));
    app = admin.initializeApp({ credential });
    return app;
  } catch (err) {
    console.error("[auth-service] Firebase Admin init error:", err.message);
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
