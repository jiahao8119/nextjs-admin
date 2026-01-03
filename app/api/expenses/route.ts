import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/expenses?outlet_id=
 * POST /api/expenses
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const outlet_id = searchParams.get('outlet_id');
    if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });

    const res = await query('SELECT * FROM expenses WHERE outlet_id = $1 ORDER BY expense_date DESC', [outlet_id]);
    return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
    try {
        const { outlet_id, category, amount, expense_date, note } = await request.json();
        const res = await query(
            `INSERT INTO expenses (outlet_id, category, amount, expense_date, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [outlet_id, category, amount, expense_date, note]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
