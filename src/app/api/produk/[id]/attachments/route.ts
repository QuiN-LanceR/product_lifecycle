import { NextRequest, NextResponse } from "next/server";
import { getPool } from '@/lib/database';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
    
    try {
      const attachmentQuery = `
        SELECT 
          id, 
          nama_attachment as nama_file, 
          url_attachment as path_file, 
          size as ukuran_file, 
          type, 
          created_at, 
          updated_at
        FROM public.tbl_attachment_produk
        WHERE produk_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await client.query(attachmentQuery, [id]);
      
      return NextResponse.json({
        success: true,
        attachments: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}