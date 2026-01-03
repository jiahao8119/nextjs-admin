import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'blinkcode-erp-secret-key-123';

export interface AuthContext {
    userId: string;
    allowedOutletIds: string[];
    role: string;
}

/**
 * Sign a token with user context
 */
export function signToken(context: AuthContext): string {
    return jwt.sign(context, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): AuthContext {
    try {
        return jwt.verify(token, JWT_SECRET) as AuthContext;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
}

/**
 * Check if user has access to a specific outlet
 */
export function hasOutletAccess(context: AuthContext, outletId: string): boolean {
    return context.allowedOutletIds.includes(outletId);
}
