const GADM_DISTRICTS_URL = "https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_LKA_2.json";

export async function GET() {
  try {
    const response = await fetch(GADM_DISTRICTS_URL, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return Response.json(
        { error: "District boundary data is temporarily unavailable." },
        { status: 502 },
      );
    }

    return new Response(await response.text(), {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Content-Type": "application/geo+json",
      },
    });
  } catch {
    return Response.json(
      { error: "District boundary data is temporarily unavailable." },
      { status: 502 },
    );
  }
}
