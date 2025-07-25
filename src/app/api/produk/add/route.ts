import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const produk = formData.get("produk") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const kategori = formData.get("kategori") as string;
    const segmen = formData.get("segmen") as string;
    const stage = formData.get("stage") as string;
    const harga = formData.get("harga") as string;
    const tanggal_launch = formData.get("tanggal_launch") as string;
    const pelanggan = formData.get("pelanggan") as string;
    const file = formData.get("attachment") as File | null;

    if (!produk || !kategori || !segmen || !stage) {
      return NextResponse.json(
        { success: false, message: 'Produk, kategori, segmen, dan stage wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah produk sudah ada
    const existing = await pool.query(
      'SELECT id FROM tbl_produk WHERE produk = $1',
      [produk]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Nama produk sudah digunakan.' },
        { status: 409 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert produk
      const createdAt = new Date();
      const insertProductQuery = `
        INSERT INTO tbl_produk (produk, deskripsi, kategori, segmen, stage, harga, tanggal_launch, pelanggan, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      
      const productResult = await client.query(insertProductQuery, [
        produk, 
        deskripsi, 
        kategori, 
        segmen, 
        stage, 
        harga, 
        tanggal_launch, 
        pelanggan, 
        createdAt
      ]);
      
      const productId = productResult.rows[0].id;
      
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
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          
          
          
          await client.query(insertAttachmentQuery, [
            productId,
            `${productId}_${file.name}`,
            `/pdf/${fileName}`,
            file.size,
            file.type,
            createdAt
          ]);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error("Error writing file:", err);
          return NextResponse.json({ success: false, message: "Gagal menyimpan file" }, { status: 500 });
        }
      }
      
      await client.query('COMMIT');

      return NextResponse.json(
        { success: true, message: 'Produk berhasil dibuat.' },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Gagal membuat produk:', error);
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan server.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Gagal membuat produk:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}