// This endpoint currently uses mock data. Replace with DB queries later.
import { NextResponse } from "next/server";

export async function GET() {
    const products = [
        {
            id: "p1",
            name: "Classic Pepperoni Pizza",
            sold: 145,
            revenue: 5510,
            cost: 1820,
            profit: 3690,
            margin: 67,
            tags: ["Fast Seller", "High Margin"],
        },
        {
            id: "p2",
            name: "Cheesy Garlic Bread",
            sold: 89,
            revenue: 1240,
            cost: 310,
            profit: 930,
            margin: 75,
            tags: ["High Margin"],
        },
        {
            id: "p3",
            name: "BBQ Chicken Feast",
            sold: 72,
            revenue: 3240,
            cost: 1450,
            profit: 1790,
            margin: 55,
            tags: ["Popular"],
        },
        {
            id: "p4",
            name: "Mushroom Soup",
            sold: 65,
            revenue: 975,
            cost: 260,
            profit: 715,
            margin: 73,
            tags: ["Steady"],
        },
        {
            id: "p5",
            name: "Hawaiian Blast",
            sold: 48,
            revenue: 2160,
            cost: 980,
            profit: 1180,
            margin: 54,
            tags: ["Growing"],
        }
    ];

    // Sorting by profit DESC as per requirements
    const sortedProducts = products.sort((a, b) => b.profit - a.profit);

    return NextResponse.json(sortedProducts);
}
