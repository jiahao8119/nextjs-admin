import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Find user
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];

    // 2. Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Get allowed outlets
    const outletResult = await query(
      'SELECT outlet_id FROM user_outlets WHERE user_id = $1',
      [user.id]
    );
    const allowedOutletIds = outletResult.rows.map(r => r.outlet_id);

    // 4. Sign JWT
    const token = signToken({
      userId: user.id,
      allowedOutletIds
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, username } });

    // Set cookie for browser-based session if needed, or just return token
    response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`);

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
