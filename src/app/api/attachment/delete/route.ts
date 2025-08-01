import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, message: "Attachment tidak ditemukan" }, { status: 400 });
  }

  const client = await getPool().connect(); 

  try {
    await client.query(`DELETE FROM tbl_attachment_produk WHERE id = $1`, [id]);
    return NextResponse.json({ success: true, message: "Attachment berhasil dihapus" });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json({ success: false, message: "Gagal menghapus attachment" }, { status: 500 });
  } finally {
    client.release();
  }
}