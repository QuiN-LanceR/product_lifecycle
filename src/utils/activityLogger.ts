import { getPool } from '@/lib/database';

export interface ActivityLogData {
  userId: number;
  username: string;
  activityType: string;
  activityDescription: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(data: ActivityLogData): Promise<void> {
  const client = await getPool().connect();
  
  try {
    await client.query(
      `INSERT INTO public.tbl_activity_log 
       (user_id, username, activity_type, activity_description, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.userId,
        data.username,
        data.activityType,
        data.activityDescription,
        data.ipAddress || null,
        data.userAgent || null
      ]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  } finally {
    client.release();
  }
}

export async function getUserActivityLog(
  userId: number, 
  limit: number = 50, 
  offset: number = 0
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const client = await getPool().connect();
  
  try {
    const result = await client.query(
      `SELECT 
        id,
        activity_type,
        activity_description,
        ip_address,
        user_agent,
        created_at
       FROM public.tbl_activity_log 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return [];
  } finally {
    client.release();
  }
}