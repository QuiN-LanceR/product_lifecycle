import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const file = formData.get("attachment") as File | null;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID produk tidak ditemukan" },
      { status: 400 }
    );
  }

  if (!file || file.size === 0) {
    return NextResponse.json(
      { success: false, message: "File attachment tidak ditemukan" },
      { status: 400 }
    );
  }
 
  const client = await getPool().connect();
  
  try {
    // Upload file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/pdf");
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    
    const fileName = `${Date.now()}_${id}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    
    // Insert attachment
    const insertAttachmentQuery = `
      INSERT INTO tbl_attachment_produk (produk_id, nama_attachment, url_attachment, size, type, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    await client.query(insertAttachmentQuery, [
      id,
      `${id}_${file.name}`,
      `/pdf/${fileName}`,
      file.size,
      file.type
    ]);

    return NextResponse.json({ 
      success: true,
      message: "Attachment berhasil ditambahkan"
    });
  } catch (err) {
    console.error("Add attachment error:", err);
    return NextResponse.json({ success: false, message: "Gagal menambahkan attachment" }, { status: 500 });
  } finally {
    client.release();
  }
}