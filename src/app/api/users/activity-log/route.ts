import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getPool } from '@/lib/database';
import { getUserActivityLog } from '@/utils/activityLogger';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, message: "Token tidak ditemukan" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Token tidak valid" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = await getPool().connect();
    
    try {
      // Ambil user ID
      const userResult = await client.query(
        'SELECT id FROM public.tbl_user WHERE username = $1',
        [decoded.username]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: "User tidak ditemukan" 
        }, { status: 404 });
      }

      const userId = userResult.rows[0].id;

      // Ambil activity log
      const activities = await getUserActivityLog(userId, limit, offset);

      // Ambil total count untuk pagination
      const countResult = await client.query(
        'SELECT COUNT(*) as total FROM public.tbl_activity_log WHERE user_id = $1',
        [userId]
      );

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({ 
        success: true, 
        data: activities,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Terjadi kesalahan server" 
    }, { status: 500 });
  }
}