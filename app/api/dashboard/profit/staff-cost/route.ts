// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET() {
    // Realistic mock data for a small outlet
    const breakdown = [
        { name: "Base Salary", value: 4500 },
        { name: "OT", value: 1200 },
        { name: "Commission", value: 800 },
    ];

    const total = breakdown.reduce((acc, curr) => acc + curr.value, 0);
    const mockRevenue = 35000;
    const ratio = (total / mockRevenue) * 100;

    return NextResponse.json({
        total,
        ratio,
        breakdown,
        note: "Healthy range for many SMEs: 10–20%"
    });
}
