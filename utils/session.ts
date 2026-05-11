import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'default_session_secret';

export interface SessionPayload {
  username: string;
  role: string;
  exp: number;
}

function sign(value: string) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function timingSafeEquals(a: string, b: string) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

export function encodeSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function decodeSession(token?: string): SessionPayload | null {
  if (!token) return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expectedSignature = sign(encoded);
  if (!timingSafeEquals(signature, expectedSignature)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload?.username || !payload?.role || typeof payload.exp !== 'number') {
    return null;
  }

  if (Date.now() > payload.exp) {
    return null;
  }

  return payload;
}

export function createSessionToken(username: string, role: string): string {
  return encodeSession({
    username,
    role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}
