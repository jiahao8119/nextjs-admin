import { NextResponse } from 'next/server';
import { withTransaction, query } from '@/lib/db';

/**
 * POST /api/staff/payroll/generate
 * Body: { outlet_id, payroll_month }
 */
export async function POST(request: Request) {
    try {
        const { outlet_id, payroll_month } = await request.json();

        const result = await withTransaction(async (client) => {
            // 1. Get all active staff in outlet
            const staffRes = await client.query(
                'SELECT id, base_salary FROM staff WHERE outlet_id = $1 AND is_active = true',
                [outlet_id]
            );

            const generated = [];

            for (const person of staffRes.rows) {
                // 2. Aggregate attendance for the month
                // Assume payroll_month is 'YYYY-MM'
                const attRes = await client.query(
                    `SELECT SUM(hours_worked) as total_hours, SUM(overtime_hours) as total_ot
           FROM staff_attendance
           WHERE staff_id = $1 AND TO_CHAR(work_date, 'YYYY-MM') = $2`,
                    [person.id, payroll_month]
                );

                const { total_hours = 0, total_ot = 0 } = attRes.rows[0];

                // 3. Simple logic: OT is RM 1.5x base hourly (derived from 160h base)
                const hourlyBase = person.base_salary / 160;
                const overtime_amount = total_ot * hourlyBase * 1.5;

                // Mock commission for now (e.g. 1% of sales handled by them if tracked, but we use fixed 0 here)
                const commission_amount = 0;
                const total_amount = parseFloat(person.base_salary) + overtime_amount + commission_amount;

                // 4. Create locked snapshot
                const payRes = await client.query(
                    `INSERT INTO staff_payroll (staff_id, outlet_id, payroll_month, base_amount, overtime_amount, commission_amount, total_amount)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (staff_id, payroll_month) DO NOTHING
           RETURNING id`,
                    [person.id, outlet_id, payroll_month, person.base_salary, overtime_amount, commission_amount, total_amount]
                );

                if (payRes.rowCount > 0) {
                    generated.push({ staff_id: person.id, amount: total_amount });
                }
            }

            return { count: generated.length, generated };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
