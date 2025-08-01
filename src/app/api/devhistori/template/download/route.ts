import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getPool } from '@/lib/database';

export async function GET() {
  try {
    // Ambil data master produk untuk dropdown
    const produkQuery = `
      SELECT id, produk as nama_produk 
      FROM tbl_produk 
      ORDER BY nama_produk ASC
    `;
    const produkResult = await getPool().query(produkQuery);
    const produkData = produkResult.rows;

    // Buat workbook baru
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Template Data Development History
    const templateData = [
      {
        'ID Produk': 1,
        'Tipe Pekerjaan': 'Bug Fix',
        'Tanggal Mulai': '2024-01-15',
        'Tanggal Akhir': '2024-01-20',
        'Version': 'v1.2.1',
        'Deskripsi': 'Perbaikan bug pada fitur login dan validasi form',
        'Status': 'Released'
      },
      {
        'ID Produk': 2,
        'Tipe Pekerjaan': 'Feature',
        'Tanggal Mulai': '2024-01-22',
        'Tanggal Akhir': '2024-02-05',
        'Version': 'v2.0.0',
        'Deskripsi': 'Penambahan fitur dashboard analytics dan reporting',
        'Status': 'Testing'
      },
      {
        'ID Produk': '',
        'Tipe Pekerjaan': '',
        'Tanggal Mulai': '',
        'Tanggal Akhir': '',
        'Version': '',
        'Deskripsi': '',
        'Status': ''
      }
    ];

    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    templateSheet['!cols'] = [
      { width: 12 },  // ID Produk
      { width: 20 },  // Tipe Pekerjaan
      { width: 15 },  // Tanggal Mulai
      { width: 15 },  // Tanggal Akhir
      { width: 12 },  // Version
      { width: 40 },  // Deskripsi
      { width: 15 }   // Status
    ];

    XLSX.utils.book_append_sheet(workbook, templateSheet, 'Template Dev History');

    // Sheet 2: Master Produk
    const produkSheet = XLSX.utils.json_to_sheet(
      produkData.map(produk => ({
        'ID': produk.id,
        'Nama Produk': produk.nama_produk
      }))
    );
    
    produkSheet['!cols'] = [
      { width: 10 },  // ID
      { width: 30 }   // Nama Produk
    ];
    
    XLSX.utils.book_append_sheet(workbook, produkSheet, 'Master Produk');

    // Sheet 3: Master Status
    const statusData = [
      { 'Status': 'Development', 'Deskripsi': 'Tahap pengembangan' },
      { 'Status': 'Testing', 'Deskripsi': 'Tahap pengujian' },
      { 'Status': 'Released', 'Deskripsi': 'Sudah dirilis' },
      { 'Status': 'Deprecated', 'Deskripsi': 'Tidak digunakan lagi' }
    ];
    
    const statusSheet = XLSX.utils.json_to_sheet(statusData);
    statusSheet['!cols'] = [
      { width: 15 },  // Status
      { width: 25 }   // Deskripsi
    ];
    
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Master Status');

    // Sheet 4: Petunjuk Penggunaan
    const instructionData = [
      { 'Kolom': 'ID Produk', 'Format': 'Angka', 'Contoh': '1', 'Keterangan': 'ID produk dari master produk (wajib)' },
      { 'Kolom': 'Tipe Pekerjaan', 'Format': 'Teks', 'Contoh': 'Bug Fix', 'Keterangan': 'Jenis pekerjaan: Bug Fix, Feature, Enhancement, dll (wajib)' },
      { 'Kolom': 'Tanggal Mulai', 'Format': 'YYYY-MM-DD', 'Contoh': '2024-01-15', 'Keterangan': 'Tanggal mulai pengembangan (opsional)' },
      { 'Kolom': 'Tanggal Akhir', 'Format': 'YYYY-MM-DD', 'Contoh': '2024-01-20', 'Keterangan': 'Tanggal selesai pengembangan (opsional)' },
      { 'Kolom': 'Version', 'Format': 'Teks', 'Contoh': 'v1.2.0', 'Keterangan': 'Versi hasil pengembangan (opsional)' },
      { 'Kolom': 'Deskripsi', 'Format': 'Teks', 'Contoh': 'Perbaikan bug login', 'Keterangan': 'Deskripsi detail pekerjaan (opsional)' },
      { 'Kolom': 'Status', 'Format': 'Pilihan', 'Contoh': 'Released', 'Keterangan': 'Development/Testing/Released/Deprecated (opsional, default: Development)' },
      { 'Catatan': '', 'Format': '', 'Contoh': '', 'Keterangan': 'Baris 1-2 adalah contoh data, hapus sebelum import data asli' }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { width: 15 },  // Kolom
      { width: 15 },  // Format
      { width: 15 },  // Contoh
      { width: 40 }   // Keterangan
    ];
    
    XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Petunjuk');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return response dengan file Excel
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="template_development_history.xlsx"',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat template', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}