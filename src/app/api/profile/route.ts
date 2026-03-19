import { NextRequest } from "next/server";
import { callAI, FLASH } from "@/lib/ai";
import { buildProfilePrompt } from "@/lib/prompts";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import type { UserProfile } from "@/lib/types";
import {
  methodNotAllowed,
  badRequest,
  agentFailed,
  successResponse,
  parseAIResponse,
} from "@/lib/api-utils";

const validStates = [
  "Bihar",
  "Karnataka",
  "Maharashtra",
  "Uttar Pradesh",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Kerala",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`profile:${ip}`, { max: 10, windowMs: 60_000 });
    if (!limit.ok) {
      return Response.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    const body = (await request.json()) as { answers?: Record<string, string> };

    if (!body.answers || typeof body.answers !== "object") {
      return badRequest("Missing required field: answers (Record<string, string>)");
    }

    const { answers } = body;
    const age = parseInt(answers.age);
    if (Number.isNaN(age) || age < 1 || age > 120) {
      return Response.json({ error: "Invalid age" }, { status: 400 });
    }

    if (!validStates.includes(answers.state)) {
      return Response.json({ error: "Invalid state" }, { status: 400 });
    }

    const prompt = buildProfilePrompt(body.answers);
    const aiResponse = await callAI(FLASH, prompt);
    const profile = parseAIResponse(aiResponse) as UserProfile;

    const processingTime = Date.now() - startTime;
    return successResponse({ profile }, processingTime);
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
