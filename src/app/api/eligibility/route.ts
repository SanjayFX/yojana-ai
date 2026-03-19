import { NextRequest } from "next/server";
import { callAI, PRO } from "@/lib/ai";
import { buildEligibilityPrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { UserProfile, SchemeData, SchemeMatch } from "@/lib/types";
import { getSchemes, incrementSchemeHit } from "@/lib/supabase";
import {
  methodNotAllowed,
  badRequest,
  agentFailed,
  successResponse,
  parseAIResponse,
} from "@/lib/api-utils";

function meetsBaseEligibility(profile: UserProfile, scheme: SchemeData) {
  const eligibility = scheme.eligibility;

  if (eligibility.min_age && profile.age < eligibility.min_age) return false;
  if (eligibility.max_age && profile.age > eligibility.max_age) return false;

  if (
    eligibility.gender &&
    eligibility.gender !== "Any" &&
    profile.gender !== eligibility.gender
  ) {
    return false;
  }

  const eligibleStates = eligibility.eligible_states ?? [];
  if (
    eligibleStates.length > 0 &&
    !eligibleStates.includes("All") &&
    !eligibleStates.includes(profile.state)
  ) {
    return false;
  }

  return true;
}

function mergeAutomaticMatches(
  profile: UserProfile,
  schemes: SchemeData[],
  matchedSchemes: SchemeMatch[]
) {
  const alreadyMatched = new Set(matchedSchemes.map((scheme) => scheme.id));
  const autoMatched: SchemeMatch[] = [];

  const autoIncludeIds = new Set<string>();
  const preferredLanguage = (profile.preferred_language || "en").toLowerCase();
  const isEnglish = preferredLanguage === "en" || preferredLanguage === "english";

  if (profile.occupation === "farmer" || profile.is_farmer) {
    [
      "pm_kisan",
      "pm_fasal_bima",
      "kisan_credit_card",
      "soil_health_card",
      "pm_krishi_sinchai",
    ].forEach((id) => autoIncludeIds.add(id));
  }

  if (profile.occupation === "student" || profile.is_student) {
    for (const scheme of schemes) {
      const occupations = (scheme.eligibility.occupations ?? []).map((value) =>
        value.toLowerCase()
      );
      const isStudentScheme =
        scheme.category === "education" ||
        occupations.some((value) =>
          ["student", "youth", "job seeker", "school or college dropout"].includes(value)
        ) ||
        /scholarship|skill|naan_mudhalvan|student/i.test(
          `${scheme.id} ${scheme.name}`
        );

      if (isStudentScheme) {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  if (profile.gender === "Female") {
    for (const scheme of schemes) {
      if (scheme.category === "women") {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  if (profile.caste_category === "SC" || profile.caste_category === "ST") {
    for (const scheme of schemes) {
      if ((scheme.eligibility.caste_categories ?? []).includes(profile.caste_category)) {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  for (const scheme of schemes) {
    if (!autoIncludeIds.has(scheme.id)) continue;
    if (alreadyMatched.has(scheme.id)) continue;
    if (!meetsBaseEligibility(profile, scheme)) continue;

    autoMatched.push({
      id: scheme.id,
      confidence: 0.6,
      reason: isEnglish
        ? profile.occupation === "student" || profile.is_student
          ? "This scheme is also relevant for the student profile based on the requested education and skill-support matching rules."
          : profile.gender === "Female" && scheme.category === "women"
            ? "This women-focused scheme is being included because the profile is female and passes the base age, state, and gender checks."
            : "This scheme is also relevant for the profile under the requested automatic matching rules."
        : profile.occupation === "student" || profile.is_student
          ? "Student profile ke basis par yeh scheme bhi relevant hai, especially education ya skill support ke liye."
          : profile.gender === "Female" && scheme.category === "women"
            ? "Female profile ke basis par yeh women-focused scheme bhi include ki gayi hai, kyunki basic age aur state checks fit ho rahe hain."
            : "Profile ke basis par yeh scheme bhi requested automatic matching rules ke hisaab se relevant hai.",
      estimated_benefit: scheme.benefit,
    });
  }

  return [...matchedSchemes, ...autoMatched].sort(
    (a, b) => b.confidence - a.confidence
  );
}

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
