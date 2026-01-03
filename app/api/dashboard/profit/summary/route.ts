// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "Today";
    const channel = searchParams.get("channel") || "All";
    const outlet = searchParams.get("outlet") || "All outlets";

    // Mock revenue logic based on dateRange
    let baseRevenue = 4560;
    if (dateRange === "7 days") baseRevenue = 32500;
    if (dateRange === "30 days") baseRevenue = 145000;

    // Realistic mock data calculations
    const revenue = baseRevenue;
    const cogs = revenue * 0.35; // 35% COGS
    const staff = revenue * 0.18; // 18% Staff cost
    const platformFees = channel === "Shopee" || channel === "Lazada" ? revenue * 0.15 : revenue * 0.05;
    const wastage = revenue * 0.02; // 2% wastage

    const cost = cogs + staff + platformFees + wastage;
    const profit = revenue - cost;
    const margin = (profit / revenue) * 100;

    // Mock trends (vs previous period)
    const trends = {
        profit: 5.2,
        revenue: 8.1,
        cost: 2.4,
        margin: 1.2,
    };

    return NextResponse.json({
        profit,
        revenue,
        cost,
        margin,
        trends,
        filters: {
            dateRange,
            channel,
            outlet,
        }
    });
}
