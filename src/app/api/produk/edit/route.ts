import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const id = formData.get("id") as string;
  const produk = formData.get("produk") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const kategori = formData.get("kategori") as string;
  const segmen = formData.get("segmen") as string;
  const stage = formData.get("stage") as string;
  const harga = formData.get("harga") as string;
  const tanggal_launch = formData.get("tanggal_launch") as string;
  const pelanggan = formData.get("pelanggan") as string;
  const file = formData.get("attachment") as File | null;

  if (!id || !produk || !kategori || !segmen || !stage) {
    return NextResponse.json(
      { success: false, message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update produk
    await client.query(
      `UPDATE tbl_produk SET 
        produk = $1, 
        deskripsi = $2, 
        kategori = $3,
        segmen = $4,
        stage = $5,
        harga = $6,
        tanggal_launch = $7,
        pelanggan = $8,
        updated_at = NOW()
      WHERE id = $9`,
      [produk, deskripsi, kategori, segmen, stage, harga, tanggal_launch, pelanggan, id]
    );

    // Upload file jika ada
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
    
        const uploadDir = path.join(process.cwd(), "public/pdf");
        if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    
        const fileName = `${Date.now()}_${file.name}`;
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
      } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error writing file:", err);
        return NextResponse.json({ success: false, message: "Gagal menyimpan file" }, { status: 500 });
      }
    }
    
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true,
      message: "Data produk berhasil diperbarui"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Update product error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}