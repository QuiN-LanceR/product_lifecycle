import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID produk tidak ditemukan" },
      { status: 400 }
    );
  }

  const client = await getPool().connect();
  try {
    // Ambil data produk
    const productQuery = `
      SELECT 
        id, produk, deskripsi, kategori, segmen, stage, harga, 
        tanggal_launch, pelanggan, created_at, updated_at
      FROM public.tbl_produk
      WHERE id = $1
    `;
    
    const productResult = await client.query(productQuery, [id]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }
    
    const product = productResult.rows[0];
    
    // Ambil attachment untuk produk
    const attachmentQuery = `
      SELECT id, nama_attachment, url_attachment, size, type, created_at, updated_at
      FROM public.tbl_attachment_produk
      WHERE produk_id = $1
    `;
    
    const attachmentResult = await client.query(attachmentQuery, [id]);
    product.attachments = attachmentResult.rows;
    
    return NextResponse.json({
      success: true,
      product: product
    });
  } catch (err) {
    console.error("Database Error:", err);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}