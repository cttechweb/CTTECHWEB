/**
 * Native Web Crypto Firebase ID Token (JWT RS256) Verifier for Cloudflare Workers
 * Uses Google Public JWKS without requiring bulky external Node.js dependencies.
 */

interface FirebaseTokenPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    identities: Record<string, any>;
    sign_in_provider: string;
  };
  [key: string]: any;
}

interface JWKKey {
  kty: string;
  alg: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

interface JWKSResponse {
  keys: JWKKey[];
}

let cachedJWKS: JWKSResponse | null = null;
let jwksCacheExpires = 0;

async function getGooglePublicKeys(forceRefresh = false): Promise<JWKSResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedJWKS && now < jwksCacheExpires) {
    return cachedJWKS;
  }

  const res = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
  if (!res.ok) {
    throw new Error(`Failed to fetch Google public keys: ${res.statusText}`);
  }

  // Parse max-age from Cache-Control header if available
  const cacheControl = res.headers.get("cache-control") || "";
  const match = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = match ? parseInt(match[1], 10) : 3600;

  cachedJWKS = await res.json();
  jwksCacheExpires = now + maxAgeSeconds * 1000;
  return cachedJWKS!;
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string
): Promise<{ uid: string; email: string; name?: string; claims: FirebaseTokenPayload }> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid token format");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT token format (expected 3 parts)");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1. Decode Header & Payload
  let header: { alg: string; kid: string; typ?: string };
  let payload: FirebaseTokenPayload;
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(payloadB64)));
  } catch {
    throw new Error("Failed to decode token JSON structure");
  }

  if (header.alg !== "RS256") {
    throw new Error(`Unsupported token algorithm: ${header.alg}. Expected RS256.`);
  }

  if (!header.kid) {
    throw new Error("Missing 'kid' in token header");
  }

  // 2. Validate Standard Firebase Claims
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    throw new Error("Firebase ID token has expired");
  }

  if (payload.iat > now + 300) {
    throw new Error("Token issued in the future");
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Invalid token issuer: ${payload.iss}. Expected: ${expectedIssuer}`);
  }

  if (payload.aud !== projectId) {
    throw new Error(`Invalid token audience: ${payload.aud}. Expected: ${projectId}`);
  }

  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.trim() === "") {
    throw new Error("Token subject (UID) is empty or invalid");
  }

  // 3. Match Google Public Key (with automatic refresh fallback on key miss)
  let jwks = await getGooglePublicKeys();
  let jwk = jwks.keys.find((k) => k.kid === header.kid);

  if (!jwk) {
    // Force refresh cache in case Google recently rotated keys
    jwks = await getGooglePublicKeys(true);
    jwk = jwks.keys.find((k) => k.kid === header.kid);
  }

  if (!jwk) {
    throw new Error(`No matching public key found for kid: ${header.kid}`);
  }

  // 4. Verify Cryptographic Signature
  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToUint8Array(signatureB64);

  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    signature,
    signedData
  );

  if (!isValid) {
    throw new Error("Invalid token cryptographic signature");
  }

  return {
    uid: payload.sub,
    email: payload.email || "",
    name: payload.name || payload.email?.split("@")[0] || "",
    claims: payload,
  };
}
