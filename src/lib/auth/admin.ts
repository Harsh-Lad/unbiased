import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function makeToken(): string {
  const exp = Date.now() + SESSION_TTL * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token || !getSecret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, expStr, sig] = parts;
  const payload = `${scope}.${expStr}`;
  const expected = sign(payload);
  if (sig !== expected) return false;
  const exp = parseInt(expStr, 10);
  if (!exp || exp < Date.now()) return false;
  return scope === "admin";
}

export function checkPassword(password: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  if (password.length !== secret.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(secret));
}

export async function createSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
