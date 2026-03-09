import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getCities, findOrCreateCity } from "@/lib/firestore/cities";
import { City as CscCity } from "country-state-city";

// Pre-build a set of all valid formatted city names: "City, StateCode, CountryCode"
const ALL_CITIES = CscCity.getAllCities().map(
  (c) => `${c.name}, ${c.stateCode}, ${c.countryCode}`
);
const ALL_CITIES_SET = new Set(ALL_CITIES);

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (q) {
    const lower = q.toLowerCase();
    const matches = ALL_CITIES.filter((name) =>
      name.toLowerCase().startsWith(lower)
    ).slice(0, 20);
    return NextResponse.json(matches);
  }

  const cities = await getCities();
  return NextResponse.json(cities);
}

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    if (!ALL_CITIES_SET.has(name)) {
      return NextResponse.json({ error: "Not a recognized city" }, { status: 400 });
    }

    const city = await findOrCreateCity(name);
    return NextResponse.json(city);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
