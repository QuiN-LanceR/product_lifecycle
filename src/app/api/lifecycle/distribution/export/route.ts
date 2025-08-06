import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const query = `
      SELECT 
        p.id,
        p.produk as nama_produk,
        p.deskripsi,
        k.kategori as nama_kategori,
        s.stage as nama_stage,
        seg.segmen as nama_segmen,
        p.harga,
        p.created_at as tanggal_dibuat,
        p.updated_at as tanggal_diperbarui
      FROM tbl_produk p
      LEFT JOIN tbl_kategori k ON p.id_kategori = k.id
      LEFT JOIN tbl_stage s ON p.id_stage = s.id
      LEFT JOIN tbl_segmen seg ON p.id_segmen = seg.id
      ORDER BY p.created_at DESC
    `;

    const result = await getPool().query(query);
    const products = result.rows;

    // Format data untuk Excel
    const excelData = products.map((product, index) => ({
      'No': index + 1,
      'Nama Produk': product.nama_produk,
      'Deskripsi': product.deskripsi || '-',
      'Kategori': product.nama_kategori || '-',
      'Stage': product.nama_stage || '-',
      'Segmen': product.nama_segmen || '-',
      'Harga': product.harga ? `Rp ${product.harga.toLocaleString('id-ID')}` : '-',
      'Tanggal Dibuat': product.tanggal_dibuat ? new Date(product.tanggal_dibuat).toLocaleDateString('id-ID') : '-',
      'Tanggal Diperbarui': product.tanggal_diperbarui ? new Date(product.tanggal_diperbarui).toLocaleDateString('id-ID') : '-'
    }));

    // Buat workbook
    const workbook = XLSX.utils.book_new();
    
    // Buat worksheet dari data
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set lebar kolom
    const columnWidths = [
      { wch: 5 },   // No
      { wch: 25 },  // Nama Produk
      { wch: 30 },  // Deskripsi
      { wch: 15 },  // Kategori
      { wch: 12 },  // Stage
      { wch: 12 },  // Segmen
      { wch: 15 },  // Harga
      { wch: 15 },  // Tanggal Dibuat
      { wch: 15 }   // Tanggal Diperbarui
    ];
    worksheet['!cols'] = columnWidths;
    
    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Produk');
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers untuk download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="Data_Produk_${new Date().toISOString().split('T')[0]}.xlsx"`);
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return new NextResponse(buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}