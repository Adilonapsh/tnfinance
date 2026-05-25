export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get("source") || "USD";
        
        const res = await fetch(
            `https://wise.com/rates/history+live?source=${source}&target=IDR&length=30&resolution=daily&unit=day`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            },
        );
        if (!res.ok) {
            console.error("Wise history fetch failed:", res.status, res.statusText);
            return Response.json({ error: "Failed to fetch Wise history" }, { status: 500 });
        }
        const data = await res.json();
        return Response.json(data);
    } catch (e) {
        console.error("Wise history error:", e);
        return Response.json({ error: "Error fetching Wise history" }, { status: 500 });
    }
}
