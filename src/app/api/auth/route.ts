import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "APP_PASSWORDが設定されていません" },
      { status: 500 }
    );
  }

  if (password === appPassword) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("dh_session", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      // No maxAge/expires → session cookie (deleted when browser closes)
    });
    return res;
  }

  return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("dh_session");
  return res;
}
