import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'light' or 'dark'
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipe file tidak didukung. Gunakan SVG, PNG, atau JPG' },
        { status: 400 }
      );
    }

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran file terlalu besar. Maksimal 2MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `kategori_${type}_${timestamp}${fileExtension}`;
    
    // Path direktori
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'product', 'kategori');
    
    // Buat direktori jika belum ada
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Path file lengkap
    const filePath = path.join(uploadDir, fileName);
    
    // Simpan file
    await writeFile(filePath, buffer);
    
    return NextResponse.json({
      success: true,
      fileName: fileName,
      filePath: `/images/product/kategori/${fileName}`,
      message: 'File berhasil diupload'
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengupload file' },
      { status: 500 }
    );
  }
}