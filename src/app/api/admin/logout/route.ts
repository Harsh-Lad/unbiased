import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/admin";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
