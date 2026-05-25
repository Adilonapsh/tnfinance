export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "USD";
    
    const res = await fetch(
      `https://wise.com/gateway/v4/comparisons?sourceCurrency=${source}&targetCurrency=IDR&sendAmount=1000&sourceCountry=ID&filter=POPULAR&includeWise=true&numberOfProviders=3`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );
    if (!res.ok) {
      console.error("Wise current fetch failed:", res.status, res.statusText);
      return Response.json({ error: "Failed to fetch Wise current rate" }, { status: 500 });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    console.error("Wise current error:", e);
    return Response.json({ error: "Error fetching Wise current rate" }, { status: 500 });
  }
}
