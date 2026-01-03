import { NextResponse } from 'next/server';
import { apiRoutes } from '@/lib/api-routes';

/**
 * Catch-all route handler for all API requests
 */
async function dispatch(request: Request, { params }: { params: { slug?: string[] } }) {
    const slug = params.slug?.join('/') || '';
    const method = request.method;

    // Find matching route in central registry
    const route = apiRoutes.find(r => r.path === slug && r.method === method);

    if (!route) {
        return NextResponse.json(
            { error: `Route ${method} /api/${slug} not found` },
            { status: 404 }
        );
    }

    try {
        return await route.handler(request);
    } catch (error: any) {
        console.error(`API Error [${method} /api/${slug}]:`, error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: error.status || 500 }
        );
    }
}

export const GET = dispatch;
export const POST = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
export const PUT = dispatch;
