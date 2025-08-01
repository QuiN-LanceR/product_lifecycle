import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { success: false, message: 'File harus berformat Excel (.xlsx atau .xls)' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    
    // Cari sheet template (sesuaikan dengan nama sheet yang dibuat)
    const sheetName = 'Template Dev History';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Sheet "${sheetName}" tidak ditemukan. Pastikan menggunakan template yang benar.`,
          availableSheets: Object.keys(workbook.Sheets)
        },
        { status: 400 }
      );
    }

    // Konversi sheet ke JSON dengan header
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length < 2) {
      return NextResponse.json(
        { success: false, message: 'File tidak memiliki data untuk diimport' },
        { status: 400 }
      );
    }

    const headers = data[0] as string[];
    const rows = data.slice(1); // Skip header row

    // Validasi header kolom
    const expectedHeaders = ['ID Produk', 'Tipe Pekerjaan', 'Tanggal Mulai', 'Tanggal Akhir', 'Version', 'Deskripsi', 'Status'];
    const headerMismatch = expectedHeaders.some((expected, index) => headers[index] !== expected);
    
    if (headerMismatch) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Format header tidak sesuai template',
          expected: expectedHeaders,
          found: headers
        },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const validStatuses = ['Development', 'Testing', 'Released', 'Deprecated'];

    for (let i = 0; i < rows.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = rows[i] as any[];
      
      // Skip empty rows
      if (row.length === 0 || !row[0]) continue;

      try {
        const id_produk = row[0];
        const tipe_pekerjaan = row[1];
        const tanggal_mulai = row[2];
        const tanggal_akhir = row[3];
        const version = row[4];
        const deskripsi = row[5];
        const status = row[6] || 'Development';

        // Validasi data wajib
        if (!id_produk) {
          errors.push(`Baris ${i + 2}: ID Produk tidak boleh kosong`);
          errorCount++;
          continue;
        }

        if (!tipe_pekerjaan) {
          errors.push(`Baris ${i + 2}: Tipe Pekerjaan tidak boleh kosong`);
          errorCount++;
          continue;
        }

        // Validasi status
        if (!validStatuses.includes(status)) {
          errors.push(`Baris ${i + 2}: Status \"${status}\" tidak valid. Gunakan: ${validStatuses.join(', ')}`);
          errorCount++;
          continue;
        }

        // Validasi produk exists
        const productQuery = 'SELECT id FROM tbl_produk WHERE id = $1';
        const productResult = await getPool().query(productQuery, [id_produk]);
        
        if (productResult.rows.length === 0) {
          errors.push(`Baris ${i + 2}: Produk dengan ID \"${id_produk}\" tidak ditemukan`);
          errorCount++;
          continue;
        }

        // Validasi dan format tanggal
        let formattedTanggalMulai = null;
        let formattedTanggalAkhir = null;

        if (tanggal_mulai) {
          try {
            const date = new Date(tanggal_mulai);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }
            formattedTanggalMulai = date.toISOString().split('T')[0];
          } catch {
            errors.push(`Baris ${i + 2}: Format tanggal mulai tidak valid. Gunakan format YYYY-MM-DD`);
            errorCount++;
            continue;
          }
        }

        if (tanggal_akhir) {
          try {
            const date = new Date(tanggal_akhir);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid date');
            }
            formattedTanggalAkhir = date.toISOString().split('T')[0];
          } catch {
            errors.push(`Baris ${i + 2}: Format tanggal akhir tidak valid. Gunakan format YYYY-MM-DD`);
            errorCount++;
            continue;
          }
        }

        // Validasi tanggal akhir >= tanggal mulai
        if (formattedTanggalMulai && formattedTanggalAkhir && formattedTanggalAkhir < formattedTanggalMulai) {
          errors.push(`Baris ${i + 2}: Tanggal akhir tidak boleh lebih kecil dari tanggal mulai`);
          errorCount++;
          continue;
        }

        // Insert ke database (sesuaikan nama tabel dengan database Anda)
        const insertQuery = `
          INSERT INTO tbl_produk_dev_histori 
          (id_produk, tipe_pekerjaan, tanggal_mulai, tanggal_akhir, version, deskripsi, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `;

        await getPool().query(insertQuery, [
          id_produk, 
          tipe_pekerjaan, 
          formattedTanggalMulai, 
          formattedTanggalAkhir, 
          version, 
          deskripsi, 
          status
        ]);

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`Baris ${i + 2}: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`);
        errorCount++;
      }
    }

    if (successCount === 0 && errorCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Import gagal. Tidak ada data yang berhasil diimport.',
          details: {
            successCount,
            errorCount,
            errors: errors.slice(0, 20)
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Import selesai. ${successCount} data berhasil diimport${errorCount > 0 ? `, ${errorCount} error` : ''}.`,
      details: {
        successCount,
        errorCount,
        errors: errors.slice(0, 10) // Batasi 10 error pertama
      }
    });

  } catch (error) {
    console.error('Error importing dev history:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal mengimport development history',
        error: error instanceof Error ? error.message : 'Error tidak diketahui'
      },
      { status: 500 }
    );
  }
}