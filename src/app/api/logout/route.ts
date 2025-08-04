import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getPool } from '@/lib/database';
import { logActivity } from '@/utils/activityLogger';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (token) {
      const decoded = await verifyToken(token);
      
      if (decoded) {
        const client = await getPool().connect();
        
        try {
          // Ambil user ID
          const userResult = await client.query(
            'SELECT id FROM public.tbl_user WHERE username = $1',
            [decoded.username]
          );

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            
            // Log logout activity
            await logActivity({
              userId: userId,
              username: decoded.username as string,
              activityType: 'logout',
              activityDescription: 'User berhasil logout',
              ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
              userAgent: req.headers.get('user-agent') || 'unknown'
            });
          }
        } finally {
          client.release();
        }
      }
    }

    const response = NextResponse.json({ 
      success: true, 
      message: "Logout berhasil" 
    });

    // Clear cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Terjadi kesalahan server" 
    }, { status: 500 });
  }
}