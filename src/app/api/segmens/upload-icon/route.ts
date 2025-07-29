import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'light' or 'dark'

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi tipe file
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
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
    const fileName = `segmen_${type}_${timestamp}${fileExtension}`;

    // Path direktori upload
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'product', 'segmen');
    
    // Buat direktori jika belum ada
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.log(error);
    }

    // Path file lengkap
    const filePath = path.join(uploadDir, fileName);
    
    // Simpan file
    await writeFile(filePath, buffer);

    // Return path relatif untuk disimpan di database
    const relativePath = `/images/product/segmen/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'File berhasil diupload',
      fileName: fileName,
      filePath: relativePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengupload file' },
      { status: 500 }
    );
  }
}