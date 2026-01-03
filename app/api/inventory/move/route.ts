import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';

/**
 * POST /api/inventory/move
 * Body: { outlet_id, product_id, type, quantity, note }
 */
export async function POST(request: Request) {
    try {
        const { outlet_id, product_id, type, quantity, note } = await request.json();

        if (quantity <= 0) {
            return NextResponse.json({ error: 'Quantity must be positive' }, { status: 400 });
        }

        const result = await withTransaction(async (client) => {
            // 1. Get product current price for movement record
            const productRes = await client.query(
                'SELECT cost_price FROM products WHERE id = $1',
                [product_id]
            );
            if (productRes.rowCount === 0) throw new Error('Product not found');
            const cost_price = productRes.rows[0].cost_price;

            // 2. Update inventory quantity
            // Use UPSERT logic to handle first-time stock entry
            const movementQuantity = type === 'OUT' ? -quantity : quantity;

            const invRes = await client.query(
                `INSERT INTO inventory (outlet_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (outlet_id, product_id)
         DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity
         RETURNING quantity`,
                [outlet_id, product_id, movementQuantity]
            );

            const newQuantity = invRes.rows[0].quantity;

            // 3. Prevent negative stock
            if (newQuantity < 0) {
                throw new Error('Insufficient stock for this operation');
            }

            // 4. Record movement
            await client.query(
                `INSERT INTO inventory_movements (outlet_id, product_id, type, quantity, cost_value, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [outlet_id, product_id, type, movementQuantity, cost_price, note]
            );

            return { newQuantity };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
