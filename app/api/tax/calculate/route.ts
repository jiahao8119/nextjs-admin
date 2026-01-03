import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * POST /api/tax/calculate
 * Body: { outlet_id, period_start, period_end }
 */
export async function POST(request: Request) {
    try {
        const { outlet_id, period_start, period_end } = await request.json();

        // 1. Calculate taxable amount (Revenue - COGS)
        const statsRes = await query(
            `SELECT 
        COALESCE(SUM(total_amount), 0) as revenue,
        (SELECT COALESCE(SUM(quantity * cost_price), 0) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE outlet_id = $1 AND order_date BETWEEN $2 AND $3)) as cogs
       FROM orders 
       WHERE outlet_id = $1 AND order_date BETWEEN $2 AND $3`,
            [outlet_id, period_start, period_end]
        );

        const { revenue, cogs } = statsRes.rows[0];
        const taxable_amount = parseFloat(revenue) - parseFloat(cogs);

        // 2. Simple tax estimation (e.g. 24% for business)
        const estimated_tax = taxable_amount > 0 ? taxable_amount * 0.24 : 0;

        // 3. Save Record
        const res = await query(
            `INSERT INTO tax_records (outlet_id, period_start, period_end, taxable_amount, estimated_tax)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [outlet_id, period_start, period_end, taxable_amount, estimated_tax]
        );

        return NextResponse.json(res.rows[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
