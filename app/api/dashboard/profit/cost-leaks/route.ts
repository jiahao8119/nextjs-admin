// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET() {
    const totalCost = 15000; // Mock total cost for percentage calculation

    const leaks = [
        { label: "Overtime", amount: 450, percent: (450 / totalCost) * 100, hint: "Check shift scheduling" },
        { label: "Refunds", amount: 210, percent: (210 / totalCost) * 100, hint: "Review kitchen QC process" },
        { label: "Stock Shrinkage", amount: 180, percent: (180 / totalCost) * 100, hint: "Weekly audit due" },
        { label: "Platform Fees", amount: 890, percent: (890 / totalCost) * 100, hint: "Promo ROI is low" },
    ];

    return NextResponse.json(leaks);
}
