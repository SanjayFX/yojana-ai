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

type ActionAgentResponse = Record<
  string,
  ActionData & {
    easiest_mode?: string;
    time_to_apply?: string;
  }
>;

function chunkSchemeIds(ids: string[], size: number) {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

function normalizeActions(
  parsed: ActionAgentResponse | { actions?: ActionAgentResponse }
) {
  const rawActions =
    "actions" in parsed && parsed.actions ? parsed.actions : parsed;

  return Object.fromEntries(
    Object.entries(rawActions).map(([id, action]) => [
      id,
      {
        ...action,
        steps: Array.isArray(action.steps) ? action.steps.slice(0, 3) : [],
        portal_url: action.portal_url ?? action.apply_url,
        apply_modes:
          Array.isArray(action.apply_modes) && action.apply_modes.length > 0
            ? action.apply_modes
            : action.easiest_mode
              ? [action.easiest_mode]
              : [],
        timeline: action.timeline ?? action.time_to_apply ?? "",
      },
    ])
  ) as Record<string, ActionData>;
}

function attachSchemeHelplines(
  actions: Record<string, ActionData>,
  schemes: SchemeData[]
) {
  const helplineLookup = new Map(
    schemes.map((scheme) => [scheme.id, scheme.helpline ?? undefined] as const)
  );

  return Object.fromEntries(
    Object.entries(actions).map(([id, action]) => [
      id,
      {
        ...action,
        helpline: action.helpline ?? helplineLookup.get(id),
      },
    ])
  ) as Record<string, ActionData>;
}

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
    const actionChunks = chunkSchemeIds(body.schemeIds, 6);
    const actionResponses = await Promise.all(
      actionChunks.map(async (schemeIds) => {
        const prompt = buildActionPrompt(schemeIds, body.profile!, schemes);
        const aiResponse = await callAI(FLASH, prompt, 4096);
        const parsed = parseAIResponse(aiResponse) as
          | ActionAgentResponse
          | { actions?: ActionAgentResponse };

        if (!parsed || typeof parsed !== "object") {
          console.error("Action agent bad parse:", aiResponse.slice(0, 200));
          throw new Error("Action agent returned non-object payload");
        }

        return normalizeActions(parsed);
      })
    );

    const normalizedActions = attachSchemeHelplines(
      Object.assign({}, ...actionResponses),
      schemes
    );

    const processingTime = Date.now() - startTime;
    return successResponse({ actions: normalizedActions }, processingTime);
  } catch (err) {
    console.error("Action agent error:", err);
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
