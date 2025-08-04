import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getPool } from '@/lib/database';
import bcrypt from 'bcrypt';
import { logActivity } from '@/utils/activityLogger';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Token tidak ditemukan" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token tidak valid" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    // Validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Semua field harus diisi" 
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Password baru dan konfirmasi password tidak cocok" 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: "Password baru minimal 6 karakter" 
      }, { status: 400 });
    }

    const client = await getPool().connect();
    
    try {
      // Ambil data user
      const userResult = await client.query(
        'SELECT id, username, password FROM public.tbl_user WHERE username = $1',
        [decoded.username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: "User tidak ditemukan" 
        }, { status: 404 });
      }

      const user = userResult.rows[0];

      // Verifikasi password lama
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ 
          success: false, 
          message: "Password lama tidak benar" 
        }, { status: 400 });
      }

      // Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await client.query(
        'UPDATE public.tbl_user SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedNewPassword, user.id]
      );

      // Log activity
      await logActivity({
        userId: user.id,
        username: user.username,
        activityType: 'password_change',
        activityDescription: 'Password berhasil diubah',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });

      return NextResponse.json({ 
        success: true, 
        message: "Password berhasil diubah" 
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Terjadi kesalahan server" 
    }, { status: 500 });
  }
}