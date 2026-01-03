import * as handlers from './api-handlers';

export type ApiHandler = (request: Request) => Promise<Response>;

export interface Route {
    path: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    handler: ApiHandler;
}

export const apiRoutes: Route[] = [
    // Authentication
    { path: 'auth/login', method: 'POST', handler: handlers.handleLogin },
    { path: 'auth/me', method: 'GET', handler: handlers.handleMe },

    // Outlets
    { path: 'outlets', method: 'GET', handler: handlers.handleGetOutlets },
    { path: 'outlets', method: 'POST', handler: handlers.handleCreateOutlet },

    // Products
    { path: 'products', method: 'GET', handler: handlers.handleGetProducts },
    { path: 'products', method: 'POST', handler: handlers.handleCreateProduct },

    // Inventory
    { path: 'inventory/move', method: 'POST', handler: handlers.handleMoveInventory },

    // Orders
    { path: 'orders', method: 'POST', handler: handlers.handleCreateOrder },

    // Staff
    { path: 'staff', method: 'GET', handler: handlers.handleGetStaff },
    { path: 'staff', method: 'POST', handler: handlers.handleCreateStaff },
    { path: 'staff/attendance', method: 'POST', handler: handlers.handleRecordAttendance },
    { path: 'staff/payroll/generate', method: 'POST', handler: handlers.handleGeneratePayroll },

    // Finance
    { path: 'expenses', method: 'GET', handler: handlers.handleGetExpenses },
    { path: 'expenses', method: 'POST', handler: handlers.handleCreateExpense },
    { path: 'tax/calculate', method: 'POST', handler: handlers.handleCalculateTax },

    // Dashboard & Analytics
    { path: 'dashboard/overview', method: 'GET', handler: handlers.handleGetDashboardOverview },

    // Profit Dashboard (Mock)
    { path: 'dashboard/profit/summary', method: 'GET', handler: handlers.handleProfitSummary },
    { path: 'dashboard/profit/insights', method: 'GET', handler: handlers.handleProfitInsights },
    { path: 'dashboard/profit/top-products', method: 'GET', handler: handlers.handleProfitTopProducts },
    { path: 'dashboard/profit/cost-leaks', method: 'GET', handler: handlers.handleProfitCostLeaks },
    { path: 'dashboard/profit/staff-cost', method: 'GET', handler: handlers.handleProfitStaffCost },
    { path: 'dashboard/profit/stock-alerts', method: 'GET', handler: handlers.handleProfitStockAlerts },

    // Automation / Cron
    { path: 'cron/daily-profit-snapshot', method: 'POST', handler: handlers.handleDailyProfitSnapshot },
];
