import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/products
 * POST /api/products
 */
export async function GET() {
    const res = await query('SELECT * FROM products ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
}

export async function POST(request: Request) {
    try {
        const { name, sku, cost_price, sell_price } = await request.json();
        const res = await query(
            'INSERT INTO products (name, sku, cost_price, sell_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, sku, cost_price, sell_price]
        );
        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
