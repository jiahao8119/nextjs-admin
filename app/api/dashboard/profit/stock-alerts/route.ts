// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET() {
    const alerts = [
        {
            severity: "danger",
            title: "Low stock: Mozzarella Cheese (2kg left) - Immediate reorder required.",
        },
        {
            severity: "warning",
            title: "High shrinkage: Pepperoni (missing 5 units this week). Investigate wastage records.",
        },
        {
            severity: "info",
            title: "Stock verification needed: RM 120 stock wastage record requires manager approval.",
        }
    ];

    return NextResponse.json(alerts);
}
