import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/outlets
 * POST /api/outlets
 */
export async function GET() {
    const res = await query('SELECT * FROM outlets ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
    try {
        const { name, location } = await request.json();
        const res = await query(
            'INSERT INTO outlets (name, location) VALUES ($1, $2) RETURNING *',
            [name, location]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
