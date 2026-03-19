import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { SchemeData, SearchLog } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

let supabase: SupabaseClient | null = null;

if (isValidUrl(supabaseUrl) && supabaseAnonKey.length > 0) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

async function loadLocalSchemes(): Promise<SchemeData[]> {
  const local = await import("@/data/schemes.json");
  return local.default as SchemeData[];
}

function parseBenefitAmount(value: string): number {
  const match = value.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export async function logSearch(data: SearchLog): Promise<void> {
  if (!supabase) return;

  try {
    await supabase.from("searches").insert({
      state: data.state,
      age: data.age,
      income_range: data.income_range,
      caste_category: data.caste_category,
      occupation: data.occupation,
      schemes_matched: data.schemes_matched,
      total_benefit: data.total_benefit,
      language: data.language,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Never throw — silently log failures
    console.error("Failed to log search to Supabase");
  }
}

export async function getStats(): Promise<{
  total_searches: number;
  total_benefit_found: number;
}> {
  if (!supabase) {
    return { total_searches: 0, total_benefit_found: 0 };
  }

  try {
    const { count } = await supabase
      .from("searches")
      .select("*", { count: "exact", head: true });

    const { data } = await supabase
      .from("searches")
      .select("total_benefit");

    const totalBenefit =
      data?.reduce(
        (sum: number, row: { total_benefit: string }) =>
          sum + parseBenefitAmount(row.total_benefit || ""),
        0
      ) ?? 0;

    return {
      total_searches: count ?? 0,
      total_benefit_found: totalBenefit,
    };
  } catch {
    return { total_searches: 0, total_benefit_found: 0 };
  }
}

export async function getSchemes(): Promise<SchemeData[]> {
  if (!supabase) {
    return loadLocalSchemes();
  }

  try {
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("is_active", true)
      .order("hit_count", { ascending: false });

    if (error || !data || data.length === 0) {
      return loadLocalSchemes();
    }

    return data as unknown as SchemeData[];
  } catch {
    return loadLocalSchemes();
  }
}

export async function incrementSchemeHit(schemeIds: string[]): Promise<void> {
  const client = supabase;
  if (!client || schemeIds.length === 0) return;

  await Promise.all(
    schemeIds.map(async (id) => {
      try {
        await client.rpc("increment_hit", { scheme_id: id });
      } catch {
        // Ignore missing RPC or transient failures
      }
    })
  );
}
