import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const nama_produk = formData.get("nama_produk") as string;
    const deskripsi = formData.get('deskripsi') as string;
    const id_kategori = parseInt(formData.get('id_kategori') as string);
    const id_segmen = parseInt(formData.get('id_segmen') as string);
    const id_stage = parseInt(formData.get('id_stage') as string);
    const harga = parseFloat(formData.get('harga') as string);
    const tanggal_launch = formData.get('tanggal_launch') as string;
    const customer = formData.get('customer') as string;
    const files = formData.getAll("files") as File[];

    if (!nama_produk || !id_kategori || !id_segmen || !id_stage || !harga || !tanggal_launch || !customer) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    // Cek apakah produk sudah ada
    const existing = await getPool().query(
      'SELECT id FROM tbl_produk WHERE produk = $1',
      [nama_produk]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Nama produk sudah digunakan.' },
        { status: 409 }
      );
    }
    
    const client = await getPool().connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert produk
      const createdAt = new Date();
      const insertProductQuery = `
        INSERT INTO tbl_produk (produk, deskripsi, id_kategori, id_segmen, id_stage, harga, tanggal_launch, pelanggan, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;
      
      const productResult = await client.query(insertProductQuery, [
        nama_produk, deskripsi || '', id_kategori, id_segmen, id_stage, harga, tanggal_launch, customer, createdAt
      ]);
      
      const productId = productResult.rows[0].id;

      // Upload files jika ada
      if (files && files.length > 0) {
        for (const file of files) {
          if (file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const uploadDir = path.join(process.cwd(), "public/uploads/products");
            if (!existsSync(uploadDir)) {
              mkdirSync(uploadDir, { recursive: true });
            }
            
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            
            // Insert attachment
            await client.query(
              `INSERT INTO tbl_attachment_produk (produk_id, nama_attachment, url_attachment, size, type, created_at)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [productId, file.name, `/uploads/products/${fileName}`, file.size, file.type, createdAt]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        data: { id: productId }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan produk' },
      { status: 500 }
    );
  }
}