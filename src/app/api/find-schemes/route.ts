import { NextRequest } from "next/server";
import type {
  UserProfile,
  SchemeMatch,
  ActionData,
  AgentResult,
} from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { getSchemes, logSearch } from "@/lib/supabase";
import {
  methodNotAllowed,
  badRequest,
  agentFailed,
  successResponse,
} from "@/lib/api-utils";

function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("host") ?? "localhost:3000";
  return `${protocol}://${host}`;
}

function getIncomeRange(income: number): string {
  if (income <= 100000) return "0-1L";
  if (income <= 250000) return "1L-2.5L";
  if (income <= 500000) return "2.5L-5L";
  if (income <= 1000000) return "5L-10L";
  return "10L+";
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const baseUrl = getBaseUrl(request);

  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`find-schemes:${ip}`, {
      max: 8,
      windowMs: 60_000,
    });
    if (!limit.ok) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await request.json()) as {
      answers?: Record<string, string>;
    };

    if (!body.answers || typeof body.answers !== "object") {
      return badRequest(
        "Missing required field: answers (Record<string, string>)"
      );
    }

    // Step 1 — Profile Agent
    const profileRes = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: body.answers }),
    });

    if (!profileRes.ok) {
      return agentFailed();
    }

    const { profile } = (await profileRes.json()) as {
      profile: UserProfile;
    };

    profile.preferred_language =
      body.answers.language ?? profile.preferred_language ?? "hi";

    // Fire background scheme update — no await
    // This runs silently while user gets their results
    const autoUpdateBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.NODE_ENV === "development" ? "http://localhost:3000" : baseUrl);
    fetch(`${autoUpdateBaseUrl}/api/schemes/auto-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: profile.state }),
    }).catch(() => {})

    // Intentionally fire-and-forget
    // User never waits for this

    // Step 2 — Eligibility Agent
    const eligRes = await fetch(`${baseUrl}/api/eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        answers: { language: body.answers.language },
      }),
    });

    if (!eligRes.ok) {
      return agentFailed();
    }

    const { matched_schemes, total_annual_benefit } =
      (await eligRes.json()) as {
        matched_schemes: SchemeMatch[];
        total_annual_benefit: string;
      };
    const schemes = await getSchemes();
    const schemeLookup = new Map(
      schemes.map((scheme) => [scheme.id, scheme] as const)
    );
    const matchedSchemes = matched_schemes.map((scheme) => ({
      ...scheme,
      name: schemeLookup.get(scheme.id)?.name ?? scheme.name,
      apply_url: schemeLookup.get(scheme.id)?.apply_url ?? scheme.apply_url,
    }));

    // Step 3 — Documents + Actions in PARALLEL
    const ids = matchedSchemes.map((s) => s.id);

    let documents: Record<string, string[]> = {};
    let actions: Record<string, ActionData> = {};

    if (ids.length > 0) {
      const [docsRes, actionsRes] = await Promise.all([
        fetch(`${baseUrl}/api/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeIds: ids, profile }),
        }),
        fetch(`${baseUrl}/api/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schemeIds: ids, profile }),
        }),
      ]);

      if (docsRes.ok) {
        const docsData = (await docsRes.json()) as {
          documents: Record<string, string[]>;
        };
        documents = docsData.documents;
      }

      if (actionsRes.ok) {
        const actionsData = (await actionsRes.json()) as {
          actions: Record<string, ActionData>;
        };
        actions = actionsData.actions;
      }
    }

    const processingTime = Date.now() - startTime;

    const result: AgentResult = {
      profile,
      matched_schemes: matchedSchemes,
      total_annual_benefit,
      documents,
      actions,
      processing_time_ms: processingTime,
    };

    // Log search to Supabase (non-blocking, never throws)
    logSearch({
      state: profile.state,
      age: profile.age,
      income_range: getIncomeRange(profile.annual_income_inr),
      caste_category: profile.caste_category,
      occupation: profile.occupation,
      schemes_matched: matchedSchemes.length,
      total_benefit: total_annual_benefit,
      language: profile.preferred_language,
    });

    return successResponse(result as unknown as Record<string, unknown>, processingTime);
  } catch {
    return agentFailed();
  }
}

export function GET() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}
