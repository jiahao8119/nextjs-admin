import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { signToken, verifyToken, extractToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * AUTH HANDLERS
 */
export async function handleLogin(request: Request) {
    const { username, password } = await request.json();
    const userResult = await query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
    if (userResult.rowCount === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const outletResult = await query('SELECT outlet_id FROM user_outlets WHERE user_id = $1', [user.id]);
    const allowedOutletIds = outletResult.rows.map(r => r.outlet_id);
    const token = signToken({ userId: user.id, allowedOutletIds });
    const response = NextResponse.json({ success: true, user: { id: user.id, username } });
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`);
    return response;
}

export async function handleMe(request: Request) {
    const token = extractToken(request.headers.get('Authorization') || '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const context = verifyToken(token);
    const userResult = await query('SELECT id, username, full_name FROM users WHERE id = $1', [context.userId]);
    if (userResult.rowCount === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const outletsResult = await query('SELECT id, name FROM outlets WHERE id = ANY($1)', [context.allowedOutletIds]);
    return NextResponse.json({ user: userResult.rows[0], outlets: outletsResult.rows, context });
}

/**
 * OUTLET HANDLERS
 */
export async function handleGetOutlets() {
    const res = await query('SELECT * FROM outlets ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
}

export async function handleCreateOutlet(request: Request) {
    const { name, location } = await request.json();
    const res = await query('INSERT INTO outlets (name, location) VALUES ($1, $2) RETURNING *', [name, location]);
    return NextResponse.json(res.rows[0]);
}

/**
 * PRODUCT HANDLERS
 */
export async function handleGetProducts() {
    const res = await query('SELECT * FROM products ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
}

export async function handleCreateProduct(request: Request) {
    const { name, sku, cost_price, sell_price } = await request.json();
    const res = await query('INSERT INTO products (name, sku, cost_price, sell_price) VALUES ($1, $2, $3, $4) RETURNING *', [name, sku, cost_price, sell_price]);
    return NextResponse.json(res.rows[0]);
}

/**
 * INVENTORY HANDLERS
 */
export async function handleMoveInventory(request: Request) {
    const { outlet_id, product_id, type, quantity, note } = await request.json();
    const result = await withTransaction(async (client) => {
        const productRes = await client.query('SELECT cost_price FROM products WHERE id = $1', [product_id]);
        if (productRes.rowCount === 0) throw new Error('Product not found');
        const movementQuantity = type === 'OUT' ? -quantity : quantity;
        const invRes = await client.query(
            `INSERT INTO inventory (outlet_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (outlet_id, product_id) DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity RETURNING quantity`,
            [outlet_id, product_id, movementQuantity]
        );
        if (invRes.rows[0].quantity < 0) throw new Error('Insufficient stock');
        await client.query('INSERT INTO inventory_movements (outlet_id, product_id, type, quantity, cost_value, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [outlet_id, product_id, type, movementQuantity, productRes.rows[0].cost_price, note]);
        return { newQuantity: invRes.rows[0].quantity };
    });
    return NextResponse.json({ success: true, ...result });
}

/**
 * ORDER HANDLERS
 */
export async function handleCreateOrder(request: Request) {
    const { outlet_id, channel_id, items } = await request.json();
    const result = await withTransaction(async (client) => {
        let totalAmount = 0;
        const orderRes = await client.query('INSERT INTO orders (outlet_id, channel_id, total_amount) VALUES ($1, $2, 0) RETURNING id', [outlet_id, channel_id]);
        const orderId = orderRes.rows[0].id;
        for (const item of items) {
            const prodRes = await client.query('SELECT sell_price, cost_price FROM products WHERE id = $1', [item.product_id]);
            const { sell_price, cost_price } = prodRes.rows[0];
            const invRes = await client.query('UPDATE inventory SET quantity = quantity - $1 WHERE outlet_id = $2 AND product_id = $3 RETURNING quantity', [item.quantity, outlet_id, item.product_id]);
            if (invRes.rowCount === 0 || invRes.rows[0].quantity < 0) throw new Error(`Insufficient stock for product ${item.product_id}`);
            await client.query('INSERT INTO order_items (order_id, product_id, quantity, sell_price, cost_price) VALUES ($1, $2, $3, $4, $5)', [orderId, item.product_id, item.quantity, sell_price, cost_price]);
            await client.query('INSERT INTO inventory_movements (outlet_id, product_id, type, quantity, cost_value, note) VALUES ($1, $2, \'OUT\', $3, $4, $5)', [outlet_id, item.product_id, -item.quantity, cost_price, `Order ${orderId}`]);
            totalAmount += sell_price * item.quantity;
        }
        await client.query('UPDATE orders SET total_amount = $1 WHERE id = $2', [totalAmount, orderId]);
        return { orderId, totalAmount };
    });
    return NextResponse.json({ success: true, ...result });
}

/**
 * STAFF HANDLERS
 */
export async function handleGetStaff(request: Request) {
    const { searchParams } = new URL(request.url);
    const outlet_id = searchParams.get('outlet_id');
    if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });
    const res = await query('SELECT * FROM staff WHERE outlet_id = $1', [outlet_id]);
    return NextResponse.json(res.rows);
}

export async function handleCreateStaff(request: Request) {
    const { outlet_id, name, role, base_salary } = await request.json();
    const res = await query('INSERT INTO staff (outlet_id, name, role, base_salary) VALUES ($1, $2, $3, $4) RETURNING *', [outlet_id, name, role, base_salary]);
    return NextResponse.json(res.rows[0]);
}

/**
 * ATTENDANCE HANDLERS
 */
export async function handleRecordAttendance(request: Request) {
    const { staff_id, work_date, hours_worked, overtime_hours } = await request.json();
    const res = await query(
        `INSERT INTO staff_attendance (staff_id, work_date, hours_worked, overtime_hours) VALUES ($1, $2, $3, $4)
     ON CONFLICT (staff_id, work_date) DO UPDATE SET hours_worked = EXCLUDED.hours_worked, overtime_hours = EXCLUDED.overtime_hours RETURNING *`,
        [staff_id, work_date, hours_worked, overtime_hours || 0]
    );
    return NextResponse.json(res.rows[0]);
}

/**
 * PAYROLL HANDLERS
 */
export async function handleGeneratePayroll(request: Request) {
    const { outlet_id, payroll_month } = await request.json();
    const result = await withTransaction(async (client) => {
        const staffRes = await client.query('SELECT id, base_salary FROM staff WHERE outlet_id = $1 AND is_active = true', [outlet_id]);
        const generated = [];
        for (const person of staffRes.rows) {
            const attRes = await client.query(`SELECT SUM(hours_worked) as total_hours, SUM(overtime_hours) as total_ot FROM staff_attendance WHERE staff_id = $1 AND TO_CHAR(work_date, 'YYYY-MM') = $2`, [person.id, payroll_month]);
            const { total_hours = 0, total_ot = 0 } = attRes.rows[0];
            const hourlyBase = person.base_salary / 160;
            const overtime_amount = (total_ot || 0) * hourlyBase * 1.5;
            const total_amount = parseFloat(person.base_salary) + overtime_amount;
            const payRes = await client.query(
                `INSERT INTO staff_payroll (staff_id, outlet_id, payroll_month, base_amount, overtime_amount, commission_amount, total_amount)
         VALUES ($1, $2, $3, $4, $5, 0, $6) ON CONFLICT (staff_id, payroll_month) DO NOTHING RETURNING id`,
                [person.id, outlet_id, payroll_month, person.base_salary, overtime_amount, total_amount]
            );
            if (payRes.rowCount > 0) generated.push({ staff_id: person.id, amount: total_amount });
        }
        return { count: generated.length, generated };
    });
    return NextResponse.json({ success: true, ...result });
}

/**
 * EXPENSE HANDLERS
 */
export async function handleGetExpenses(request: Request) {
    const { searchParams } = new URL(request.url);
    const outlet_id = searchParams.get('outlet_id');
    if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });
    const res = await query('SELECT * FROM expenses WHERE outlet_id = $1 ORDER BY expense_date DESC', [outlet_id]);
    return NextResponse.json(res.rows);
}

export async function handleCreateExpense(request: Request) {
    const { outlet_id, category, amount, expense_date, note } = await request.json();
    const res = await query('INSERT INTO expenses (outlet_id, category, amount, expense_date, note) VALUES ($1, $2, $3, $4, $5) RETURNING *', [outlet_id, category, amount, expense_date, note]);
    return NextResponse.json(res.rows[0]);
}

/**
 * TAX HANDLERS
 */
export async function handleCalculateTax(request: Request) {
    const { outlet_id, period_start, period_end } = await request.json();
    const statsRes = await query(
        `SELECT COALESCE(SUM(total_amount), 0) as revenue,
      (SELECT COALESCE(SUM(quantity * cost_price), 0) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE outlet_id = $1 AND order_date BETWEEN $2 AND $3)) as cogs
     FROM orders WHERE outlet_id = $1 AND order_date BETWEEN $2 AND $3`,
        [outlet_id, period_start, period_end]
    );
    const { revenue, cogs } = statsRes.rows[0];
    const taxable_amount = parseFloat(revenue) - parseFloat(cogs);
    const estimated_tax = taxable_amount > 0 ? taxable_amount * 0.24 : 0;
    const res = await query('INSERT INTO tax_records (outlet_id, period_start, period_end, taxable_amount, estimated_tax) VALUES ($1, $2, $3, $4, $5) RETURNING *', [outlet_id, period_start, period_end, taxable_amount, estimated_tax]);
    return NextResponse.json(res.rows[0]);
}

/**
 * DASHBOARD OVERVIEW HANDLERS
 */
export async function handleGetDashboardOverview(request: Request) {
    const { searchParams } = new URL(request.url);
    const outlet_id = searchParams.get('outlet_id');
    if (!outlet_id) return NextResponse.json({ error: 'outlet_id required' }, { status: 400 });
    const revenueRes = await query('SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE outlet_id = $1 AND order_date >= CURRENT_DATE', [outlet_id]);
    const costRes = await query('SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as cogs FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.outlet_id = $1 AND o.order_date >= CURRENT_DATE', [outlet_id]);
    const expenseRes = await query('SELECT COALESCE(SUM(amount), 0) as expenses FROM expenses WHERE outlet_id = $1 AND expense_date = CURRENT_DATE', [outlet_id]);
    const revenue = parseFloat(revenueRes.rows[0].revenue);
    const cost = parseFloat(costRes.rows[0].cogs) + parseFloat(expenseRes.rows[0].expenses);
    const stockRes = await query('SELECT p.name, i.quantity FROM inventory i JOIN products p ON p.id = i.product_id WHERE i.outlet_id = $1 AND i.quantity < 10', [outlet_id]);
    return NextResponse.json({
        summary: { revenue, cost, profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0 },
        alerts: stockRes.rows.map(r => `Low stock: ${r.name} (${r.quantity} left)`)
    });
}

/**
 * CRON HANDLERS
 */
export async function handleDailyProfitSnapshot() {
    const outletsRes = await query('SELECT id FROM outlets WHERE is_active = true');
    for (const outlet of outletsRes.rows) {
        await withTransaction(async (client) => {
            const statsRes = await client.query(
                `SELECT COALESCE(SUM(total_amount), 0) as revenue,
          (SELECT COALESCE(SUM(quantity * cost_price), 0) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE outlet_id = $1 AND order_date::date = CURRENT_DATE - 1)) as cogs,
          (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE outlet_id = $1 AND expense_date = CURRENT_DATE - 1) as expenses
         FROM orders WHERE outlet_id = $1 AND order_date::date = CURRENT_DATE - 1`,
                [outlet.id]
            );
            const { revenue, cogs, expenses } = statsRes.rows[0];
            const total_cost = parseFloat(cogs) + parseFloat(expenses);
            const profit = parseFloat(revenue) - total_cost;
            await client.query('INSERT INTO daily_profit_snapshot (outlet_id, snapshot_date, revenue, cost, profit, margin) VALUES ($1, CURRENT_DATE - 1, $2, $3, $4, $5) ON CONFLICT (outlet_id, snapshot_date) DO UPDATE SET revenue = EXCLUDED.revenue, cost = EXCLUDED.cost, profit = EXCLUDED.profit, margin = EXCLUDED.margin',
                [outlet.id, revenue, total_cost, profit, revenue > 0 ? (profit / revenue) * 100 : 0]);
        });
    }
    return NextResponse.json({ success: true, processed: outletsRes.length });
}

/**
 * PROFIT DASHBOARD (MOCK) HANDLERS
 */
export async function handleProfitSummary(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "Today";
    const channel = searchParams.get("channel") || "All";
    let baseRevenue = 4560;
    if (dateRange === "7 days") baseRevenue = 32500;
    if (dateRange === "30 days") baseRevenue = 145000;
    const cogs = baseRevenue * 0.35;
    const staff = baseRevenue * 0.18;
    const platformFees = channel === "Shopee" || channel === "Lazada" ? baseRevenue * 0.15 : baseRevenue * 0.05;
    const cost = cogs + staff + platformFees + (baseRevenue * 0.02);
    const profit = baseRevenue - cost;
    return NextResponse.json({
        profit, revenue: baseRevenue, cost, margin: (profit / baseRevenue) * 100,
        trends: { profit: 5.2, revenue: 8.1, cost: 2.4, margin: 1.2 }
    });
}

export async function handleProfitInsights() {
    return NextResponse.json([
        { type: "warning", text: "Profit is down today mainly because staff cost went up +RM120 and stock wastage increased." },
        { type: "info", text: "RM 450 savings identified if you reduce delivery commission by 2%." },
        { type: "success", text: "Walk-in orders are up 15% today compared to last Saturday." }
    ]);
}

export async function handleProfitTopProducts() {
    const products = [
        { id: "p1", name: "Classic Pepperoni Pizza", sold: 145, revenue: 5510, cost: 1820, profit: 3690, margin: 67, tags: ["Fast Seller"] },
        { id: "p2", name: "Cheesy Garlic Bread", sold: 89, revenue: 1240, cost: 310, profit: 930, margin: 75, tags: ["High Margin"] },
        { id: "p4", name: "Mushroom Soup", sold: 65, revenue: 975, cost: 260, profit: 715, margin: 73, tags: ["Steady"] }
    ];
    return NextResponse.json(products.sort((a, b) => b.profit - a.profit));
}

export async function handleProfitCostLeaks() {
    const totalCost = 15000;
    return NextResponse.json([
        { label: "Overtime", amount: 450, percent: (450 / totalCost) * 100, hint: "Check shift scheduling" },
        { label: "Refunds", amount: 210, percent: (210 / totalCost) * 100, hint: "Review kitchen QC process" },
        { label: "Stock Shrinkage", amount: 180, percent: (180 / totalCost) * 100, hint: "Weekly audit due" },
        { label: "Platform Fees", amount: 890, percent: (890 / totalCost) * 100, hint: "Promo ROI is low" }
    ]);
}

export async function handleProfitStaffCost() {
    const breakdown = [{ name: "Base Salary", value: 4500 }, { name: "OT", value: 1200 }, { name: "Commission", value: 800 }];
    const total = 6500;
    return NextResponse.json({ total, ratio: (total / 35000) * 100, breakdown, note: "Healthy range: 10–20%" });
}

export async function handleProfitStockAlerts() {
    return NextResponse.json([
        { severity: "danger", title: "Low stock: Mozzarella Cheese (2kg left)" },
        { severity: "warning", title: "High shrinkage: Pepperoni (missing 5 units)" }
    ]);
}
