import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const nama_produk = formData.get("nama_produk") as string;
    const deskripsi = formData.get('deskripsi') as string;
    const id_kategori = parseInt(formData.get('id_kategori') as string);
    const id_segmen = parseInt(formData.get('id_segmen') as string);
    const id_stage = parseInt(formData.get('id_stage') as string);
    const harga = parseFloat(formData.get('harga') as string);
    const tanggal_launch = formData.get('tanggal_launch') as string;
    const customer = formData.get('customer') as string;
    const files = formData.getAll("files") as File[];

    if (!id || !nama_produk || !id_kategori || !id_segmen || !id_stage || !harga || !tanggal_launch || !customer) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
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
          id_kategori = $3,
          id_segmen = $4,
          id_stage = $5,
          harga = $6,
          tanggal_launch = $7,
          pelanggan = $8,
          updated_at = NOW()
        WHERE id = $9`,
        [nama_produk, deskripsi || '', id_kategori, id_segmen, id_stage, harga, tanggal_launch, customer, id]
      );

      // Upload files jika ada
      if (files && files.length > 0) {
        for (const file of files) {
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
                file.name,
                `/pdf/${fileName}`,
                file.size,
                file.type
              ]);
            } catch (err) {
              console.error("Error writing file:", err);
              // Continue with other files, don't break the transaction
            }
          }
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
  } catch (error) {
    console.error('Gagal mengupdate produk:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}