// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET() {
    const insights = [
        {
            type: "warning",
            text: "Profit is down today mainly because staff cost went up +RM120 and stock wastage increased.",
        },
        {
            type: "info",
            text: "RM 450 savings identified if you reduce delivery commission by 2%.",
        },
        {
            type: "success",
            text: "Biggest Revenue Change: Walk-in orders are up 15% today compared to last Saturday.",
        },
        {
            type: "warning",
            text: "Platform fees for Shopee have increased by 3% this week, affecting net margin.",
        }
    ];

    return NextResponse.json(insights);
}
