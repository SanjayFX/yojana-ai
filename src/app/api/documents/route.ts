import { NextRequest } from "next/server";
import { callAI, FLASH } from "@/lib/ai";
import { buildDocumentsPrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { UserProfile, SchemeData } from "@/lib/types";
import { getSchemes } from "@/lib/supabase";
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
    const limit = checkRateLimit(`documents:${ip}`, { max: 10, windowMs: 60_000 });
    if (!limit.ok) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await request.json()) as {
      schemeIds?: string[];
      profile?: UserProfile;
    };

    if (
      !body.schemeIds ||
      !Array.isArray(body.schemeIds) ||
      body.schemeIds.length === 0
    ) {
      return badRequest("Missing required field: schemeIds (string[])");
    }

    if (!body.profile || typeof body.profile !== "object") {
      return badRequest("Missing required field: profile (UserProfile)");
    }

    const schemes = (await getSchemes()) as SchemeData[];
    const prompt = buildDocumentsPrompt(body.schemeIds, schemes);
    const aiResponse = await callAI(FLASH, prompt, 2048);
    const parsed = parseAIResponse(aiResponse) as {
      documents: Record<string, string[]>;
    };

    const processingTime = Date.now() - startTime;
    return successResponse({ documents: parsed.documents }, processingTime);
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
