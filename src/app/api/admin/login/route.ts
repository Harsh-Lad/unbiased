import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/auth/admin";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(password || "")) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
