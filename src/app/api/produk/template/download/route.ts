import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    const client = await getPool().connect();
    
    // Ambil data master
    const [kategoriResult, segmenResult, stageResult] = await Promise.all([
      client.query('SELECT id, kategori FROM tbl_kategori ORDER BY kategori ASC'),
      client.query('SELECT id, segmen FROM tbl_segmen ORDER BY segmen ASC'),
      client.query('SELECT id, stage FROM tbl_stage ORDER BY stage ASC')
    ]);
    
    client.release();

    // Buat workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Template Data Produk
    const productTemplate = [
      {
        'Nama Produk': 'Contoh Produk 1',
        'Deskripsi': 'Deskripsi produk contoh',
        'ID Kategori': 1,
        'ID Segmen': 1,
        'ID Stage': 1,
        'Harga': 100000,
        'Tanggal Launch (YYYY-MM-DD)': '2024-01-15',
        'Pelanggan': 'PT. Contoh',
        'Tanggal Stage Start (YYYY-MM-DD)': '2024-01-01',
        'Tanggal Stage End (YYYY-MM-DD)': '2024-12-31'
      },
      {
        'Nama Produk': '',
        'Deskripsi': '',
        'ID Kategori': '',
        'ID Segmen': '',
        'ID Stage': '',
        'Harga': '',
        'Tanggal Launch (YYYY-MM-DD)': '',
        'Pelanggan': '',
        'Tanggal Stage Start (YYYY-MM-DD)': '',
        'Tanggal Stage End (YYYY-MM-DD)': ''
      }
    ];
    
    const productSheet = XLSX.utils.json_to_sheet(productTemplate);
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Data Produk');

    // Sheet 2: Master Kategori
    const kategoriData = kategoriResult.rows.map(row => ({
      'ID': row.id,
      'Nama Kategori': row.kategori
    }));
    const kategoriSheet = XLSX.utils.json_to_sheet(kategoriData);
    XLSX.utils.book_append_sheet(workbook, kategoriSheet, 'Master Kategori');

    // Sheet 3: Master Segmen
    const segmenData = segmenResult.rows.map(row => ({
      'ID': row.id,
      'Nama Segmen': row.segmen
    }));
    const segmenSheet = XLSX.utils.json_to_sheet(segmenData);
    XLSX.utils.book_append_sheet(workbook, segmenSheet, 'Master Segmen');

    // Sheet 4: Master Stage
    const stageData = stageResult.rows.map(row => ({
      'ID': row.id,
      'Nama Stage': row.stage
    }));
    const stageSheet = XLSX.utils.json_to_sheet(stageData);
    XLSX.utils.book_append_sheet(workbook, stageSheet, 'Master Stage');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Template_Import_Produk.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal generate template' },
      { status: 500 }
    );
  }
}