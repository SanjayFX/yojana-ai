import { NextRequest } from "next/server";
import { callAI, PRO } from "@/lib/ai";
import { buildEligibilityPrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { UserProfile, SchemeData, SchemeMatch } from "@/lib/types";
import { getSchemes, incrementSchemeHit } from "@/lib/supabase";
import { mergeAutomaticMatches } from "@/lib/eligibility";
import {
  methodNotAllowed,
  badRequest,
  agentFailed,
  successResponse,
  parseAIResponse,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`eligibility:${ip}`, {
      max: 10,
      windowMs: 60_000,
    });
    if (!limit.ok) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await request.json()) as { profile?: UserProfile };

    if (!body.profile || typeof body.profile !== "object") {
      return badRequest("Missing required field: profile (UserProfile)");
    }

    const schemes = (await getSchemes()) as SchemeData[];
    const prompt = buildEligibilityPrompt(body.profile, schemes);
    const aiResponse = await callAI(PRO, prompt);
    const parsed = parseAIResponse(aiResponse) as {
      matched_schemes: Array<
        Omit<SchemeMatch, "confidence"> & {
          confidence: SchemeMatch["confidence"] | "high" | "medium";
        }
      >;
      total_annual_benefit: string;
      important_note: string | null;
    };
    const matchedSchemes = mergeAutomaticMatches(
      body.profile,
      schemes,
      parsed.matched_schemes
      .map((scheme) => ({
        ...scheme,
        confidence:
          typeof scheme.confidence === "number"
            ? scheme.confidence
            : scheme.confidence === "high"
            ? 0.9
            : 0.6,
      }))
      .sort((a, b) => b.confidence - a.confidence)
    );

    if (matchedSchemes.length > 0) {
      const ids = matchedSchemes.map((s) => s.id);
      void incrementSchemeHit(ids);
    }

    const processingTime = Date.now() - startTime;
    return successResponse(
      {
        matched_schemes: matchedSchemes,
        total_annual_benefit: parsed.total_annual_benefit,
        important_note: parsed.important_note,
      },
      processingTime
    );
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
