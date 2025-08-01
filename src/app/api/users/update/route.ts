import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const fullname = formData.get("fullname") as string;
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const file = formData.get("photo") as File | null;

  let photoName: string | null = null;

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/images/user");
      if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

      const fileExt = file.name.split(".").pop();
      photoName = `${Date.now()}_${username}.${fileExt}`;
      const filePath = path.join(uploadDir, photoName);

      await writeFile(filePath, buffer);
    } catch (err) {
      console.error("Error writing file:", err);
      return NextResponse.json({ success: false, message: "Gagal menyimpan file" }, { status: 500 });
    }
  }

  const client = await getPool().connect();
  try {
    await client.query(
      `UPDATE tbl_user SET fullname = $1, email = $2, photo = COALESCE($3, photo) WHERE username = $4`,
      [fullname, email, photoName, username]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
