import { NextRequest } from "next/server";
import { callAI, FLASH } from "@/lib/ai";
import { buildActionPrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { UserProfile, SchemeData, ActionData } from "@/lib/types";
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
    const limit = checkRateLimit(`action:${ip}`, { max: 10, windowMs: 60_000 });
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
    const prompt = buildActionPrompt(body.schemeIds, body.profile, schemes);
    const aiResponse = await callAI(FLASH, prompt, 2048);
    const parsed = parseAIResponse(aiResponse) as {
      actions: Record<string, ActionData>;
    };
    const normalizedActions = Object.fromEntries(
      Object.entries(parsed.actions).map(([id, action]) => [
        id,
        {
          ...action,
          steps: Array.isArray(action.steps) ? action.steps.slice(0, 3) : [],
          portal_url: action.portal_url ?? action.apply_url,
        },
      ])
    );

    const processingTime = Date.now() - startTime;
    return successResponse({ actions: normalizedActions }, processingTime);
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
