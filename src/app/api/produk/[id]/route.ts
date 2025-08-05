import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
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

    if (!id || !nama_produk || !id_kategori || !id_segmen || !id_stage || !harga || !tanggal_launch || !customer) {
      return NextResponse.json(
        { success: false, message: 'Semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
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
               VALUES ($1, $2, $3, $4, $5, NOW())`,
              [id, file.name, `/uploads/products/${fileName}`, file.size, file.type]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'Produk berhasil diperbarui'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, message: "Produk tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    
    // Hapus attachment terlebih dahulu
    await client.query(`DELETE FROM tbl_attachment_produk WHERE produk_id = $1`, [id]);
    
    // Kemudian hapus produk
    await client.query(`DELETE FROM tbl_produk WHERE id = $1`, [id]);
    
    await client.query('COMMIT');
    
    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Delete product error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus produk" }, { status: 500 });
  } finally {
    client.release();
  }
}