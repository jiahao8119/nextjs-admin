import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/staff?outlet_id=
 * POST /api/staff
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const outlet_id = searchParams.get('outlet_id');

    if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });

    const res = await query('SELECT * FROM staff WHERE outlet_id = $1', [outlet_id]);
    return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
    try {
        const { outlet_id, name, role, base_salary } = await request.json();
        const res = await query(
            'INSERT INTO staff (outlet_id, name, role, base_salary) VALUES ($1, $2, $3, $4) RETURNING *',
            [outlet_id, name, role, base_salary]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
