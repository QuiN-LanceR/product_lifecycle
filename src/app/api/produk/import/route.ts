import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getPool } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets['Data Produk'];
    
    if (!worksheet) {
      return NextResponse.json(
        { success: false, message: 'Sheet "Data Produk" tidak ditemukan' },
        { status: 400 }
      );
    }

    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada data untuk diimport' },
        { status: 400 }
      );
    }

    const client = await getPool().connect();
    let imported = 0;
    const errors: string[] = [];

    try {
      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data[i] as any;
        
        // Skip empty rows
        if (!row['Nama Produk'] || row['Nama Produk'].toString().trim() === '') {
          continue;
        }

        try {
          // Validate required fields
          const nama_produk = row['Nama Produk']?.toString().trim();
          const deskripsi = row['Deskripsi']?.toString().trim() || '';
          const id_kategori = parseInt(row['ID Kategori']);
          const id_segmen = parseInt(row['ID Segmen']);
          const id_stage = parseInt(row['ID Stage']);
          const harga = parseInt(row['Harga']) || 0;
          const pelanggan = row['Pelanggan']?.toString().trim() || '';
          
          // Parse dates
          let tanggal_launch = null;
          let tanggal_stage_start = null;
          let tanggal_stage_end = null;
          
          if (row['Tanggal Launch (YYYY-MM-DD)']) {
            tanggal_launch = new Date(row['Tanggal Launch (YYYY-MM-DD)']);
          }
          
          if (row['Tanggal Stage Start (YYYY-MM-DD)']) {
            tanggal_stage_start = new Date(row['Tanggal Stage Start (YYYY-MM-DD)']);
          }
          
          if (row['Tanggal Stage End (YYYY-MM-DD)']) {
            tanggal_stage_end = new Date(row['Tanggal Stage End (YYYY-MM-DD)']);
          }

          if (!nama_produk || isNaN(id_kategori) || isNaN(id_segmen) || isNaN(id_stage)) {
            errors.push(`Baris ${i + 2}: Data tidak lengkap atau format salah`);
            continue;
          }

          // Insert product
          const insertQuery = `
            INSERT INTO tbl_produk (
              produk, deskripsi, id_kategori, id_segmen, id_stage, 
              harga, tanggal_launch, pelanggan, tanggal_stage_start, tanggal_stage_end, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
          `;
          
          await client.query(insertQuery, [
            nama_produk,
            deskripsi,
            id_kategori,
            id_segmen,
            id_stage,
            harga,
            tanggal_launch,
            pelanggan,
            tanggal_stage_start,
            tanggal_stage_end
          ]);
          
          imported++;
        } catch (error) {
          errors.push(`Baris ${i + 2}: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`);
        }
      }

      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        imported,
        errors: errors.length > 0 ? errors : undefined,
        message: `Berhasil import ${imported} produk${errors.length > 0 ? ` dengan ${errors.length} error` : ''}`
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing Excel:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal import data Excel' },
      { status: 500 }
    );
  }
}