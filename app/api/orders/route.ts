import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';

/**
 * POST /api/orders
 * Body: { outlet_id, channel_id, items: [{ product_id, quantity }] }
 */
export async function POST(request: Request) {
    try {
        const { outlet_id, channel_id, items } = await request.json();

        const result = await withTransaction(async (client) => {
            let totalAmount = 0;

            // 1. Create Order
            const orderRes = await client.query(
                'INSERT INTO orders (outlet_id, channel_id, total_amount) VALUES ($1, $2, 0) RETURNING id',
                [outlet_id, channel_id]
            );
            const orderId = orderRes.rows[0].id;

            // 2. Process Items
            for (const item of items) {
                // Find product price and current cost
                const prodRes = await client.query(
                    'SELECT sell_price, cost_price FROM products WHERE id = $1',
                    [item.product_id]
                );
                if (prodRes.rowCount === 0) throw new Error(`Product ${item.product_id} not found`);
                const { sell_price, cost_price } = prodRes.rows[0];

                // Deduct Inventory (reuse move logic or inline it for speed)
                const invRes = await client.query(
                    'UPDATE inventory SET quantity = quantity - $1 WHERE outlet_id = $2 AND product_id = $3 RETURNING quantity',
                    [item.quantity, outlet_id, item.product_id]
                );

                if (invRes.rowCount === 0 || invRes.rows[0].quantity < 0) {
                    throw new Error(`Insufficient stock for product ${item.product_id}`);
                }

                // Record Item
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, sell_price, cost_price)
           VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, item.product_id, item.quantity, sell_price, cost_price]
                );

                // Record Movement for audit
                await client.query(
                    `INSERT INTO inventory_movements (outlet_id, product_id, type, quantity, cost_value, note)
           VALUES ($1, $2, 'OUT', $3, $4, $5)`,
                    [outlet_id, item.product_id, -item.quantity, cost_price, `Order ${orderId}`]
                );

                totalAmount += sell_price * item.quantity;
            }

            // 3. Finalize Order Amount
            await client.query(
                'UPDATE orders SET total_amount = $1 WHERE id = $2',
                [totalAmount, orderId]
            );

            return { orderId, totalAmount };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
