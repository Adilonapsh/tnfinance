import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountStr) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountStr)),
      });
    } catch (error) {
      console.error('[firebase-admin] Failed to init with service account:', error);
      // Fallback to project ID only
      admin.initializeApp({ projectId: 'trufintech-65ca0' });
    }
  } else {
    admin.initializeApp({ projectId: 'trufintech-65ca0' });
  }
}

export const adminAuth = admin.auth();

/**
 * Verify a Firebase ID token and return the decoded claims.
 * 
 * In production: verifyIdToken() validates the signature cryptographically.
 * In development (no service account): falls back to JWT payload decoding,
 * which skips signature verification — NEVER use this in production.
 */
export async function verifyToken(token: string): Promise<{ uid: string; email?: string }> {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch (err: any) {
    // If we're in development and admin SDK can't verify (no service account),
    // fallback to decoding the JWT payload directly (no signature check).
    if (process.env.NODE_ENV === 'development') {
      console.warn('[firebase-admin] verifyIdToken failed, falling back to JWT decode (dev only):', err?.message);
      const payload = decodeJwtPayload(token);
      if (payload?.user_id || payload?.sub) {
        return { uid: payload.user_id || payload.sub, email: payload.email };
      }
    }
    throw err;
  }
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}
