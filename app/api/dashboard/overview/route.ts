import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/dashboard/overview?outlet_id=
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const outlet_id = searchParams.get('outlet_id');

        if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });

        // 1. Today's Revenue
        const revenueRes = await query(
            `SELECT COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE outlet_id = $1 AND order_date >= CURRENT_DATE`,
            [outlet_id]
        );

        // 2. Today's COGS
        const costRes = await query(
            `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as cogs
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.outlet_id = $1 AND o.order_date >= CURRENT_DATE`,
            [outlet_id]
        );

        // 3. Today's Expenses
        const expenseRes = await query(
            `SELECT COALESCE(SUM(amount), 0) as expenses
       FROM expenses
       WHERE outlet_id = $1 AND expense_date = CURRENT_DATE`,
            [outlet_id]
        );

        const revenue = parseFloat(revenueRes.rows[0].revenue);
        const cost = parseFloat(costRes.rows[0].cogs) + parseFloat(expenseRes.rows[0].expenses);
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        // 4. Low stock alerts
        const stockRes = await query(
            `SELECT p.name, i.quantity
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       WHERE i.outlet_id = $1 AND i.quantity < 10`,
            [outlet_id]
        );

        return NextResponse.json({
            summary: {
                revenue,
                cost,
                profit,
                margin
            },
            alerts: stockRes.rows.map(r => `Low stock: ${r.name} (${r.quantity} left)`)
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
