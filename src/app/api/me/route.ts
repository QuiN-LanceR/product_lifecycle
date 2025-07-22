import { verifyToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ authenticated: false }, { status: 401 });
  
  return NextResponse.json({ authenticated: true, user: decoded });
}