import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/staff/attendance
 * Body: { staff_id, work_date, hours_worked, overtime_hours }
 */
export async function POST(request: Request) {
    try {
        const { staff_id, work_date, hours_worked, overtime_hours } = await request.json();

        const res = await query(
            `INSERT INTO staff_attendance (staff_id, work_date, hours_worked, overtime_hours)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (staff_id, work_date) DO UPDATE
       SET hours_worked = EXCLUDED.hours_worked, overtime_hours = EXCLUDED.overtime_hours
       RETURNING *`,
            [staff_id, work_date, hours_worked, overtime_hours || 0]
        );

        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
