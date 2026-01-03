import { NextResponse } from 'next/server';
import { withTransaction, query } from '@/lib/db';

/**
 * POST /api/cron/daily-profit-snapshot
 * Designed to be called by a scheduler (e.g. Vercel Cron)
 */
export async function POST() {
    try {
        const outletsRes = await query('SELECT id FROM outlets WHERE is_active = true');

        const results = [];

        for (const outlet of outletsRes.rows) {
            const outlet_id = outlet.id;

            // Logic: Aggregate for YESTERDAY
            const res = await withTransaction(async (client) => {
                const statsRes = await client.query(
                    `SELECT 
            COALESCE(SUM(total_amount), 0) as revenue,
            (SELECT COALESCE(SUM(quantity * cost_price), 0) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE outlet_id = $1 AND order_date::date = CURRENT_DATE - 1)) as cogs,
            (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE outlet_id = $1 AND expense_date = CURRENT_DATE - 1) as expenses
           FROM orders 
           WHERE outlet_id = $1 AND order_date::date = CURRENT_DATE - 1`,
                    [outlet_id]
                );

                const { revenue, cogs, expenses } = statsRes.rows[0];
                const total_cost = parseFloat(cogs) + parseFloat(expenses);
                const profit = parseFloat(revenue) - total_cost;
                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                await client.query(
                    `INSERT INTO daily_profit_snapshot (outlet_id, snapshot_date, revenue, cost, profit, margin)
           VALUES ($1, CURRENT_DATE - 1, $2, $3, $4, $5)
           ON CONFLICT (outlet_id, snapshot_date) DO UPDATE 
           SET revenue = EXCLUDED.revenue, cost = EXCLUDED.cost, profit = EXCLUDED.profit, margin = EXCLUDED.margin`,
                    [outlet_id, revenue, total_cost, profit, margin]
                );

                return { outlet_id, profit };
            });
            results.push(res);
        }

        return NextResponse.json({ success: true, processed: results.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
