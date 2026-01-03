import jwt from 'jsonwebtoken';

const JWT_SECRET =
    process.env.JWT_SECRET || 'blinkcode-erp-secret-key-123';

/**
 * Auth context stored inside JWT
 * Matches DB design: 1 user -> 1 outlet
 */
export interface AuthContext {
    userId: string;
    outletId: string;
    role: string;
}

/**
 * Sign a JWT token
 */
export function signToken(context: AuthContext): string {
    return jwt.sign(context, JWT_SECRET, {
        expiresIn: '7d',
    });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AuthContext {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthContext;
    } catch {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    if (!authHeader.startsWith('Bearer ')) return null;
    return authHeader.replace('Bearer ', '');
}

/**
 * Check if user has access to an outlet
 * (single-outlet system)
 */
export function hasOutletAccess(
    context: AuthContext,
    outletId: string
): boolean {
    return context.outletId === outletId;
}

/**
 * Helper: Require auth (throws if invalid)
 */
export function requireAuth(
    authHeader?: string
): AuthContext {
    const token = extractToken(authHeader);
    if (!token) {
        throw new Error('Unauthorized');
    }
    return verifyToken(token);
}
