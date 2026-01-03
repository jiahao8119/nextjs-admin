import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/auth/me
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractToken(authHeader);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const context = verifyToken(token);

        // Fetch user details
        const userResult = await query(
            'SELECT id, username, full_name FROM users WHERE id = $1',
            [context.userId]
        );

        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch outlet details
        const outletsResult = await query(
            'SELECT id, name FROM outlets WHERE id = ANY($1)',
            [context.allowedOutletIds]
        );

        return NextResponse.json({
            user: userResult.rows[0],
            outlets: outletsResult.rows,
            context
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
