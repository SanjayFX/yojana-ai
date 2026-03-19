import { NextResponse } from "next/server";

export function methodNotAllowed() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function agentFailed() {
  return NextResponse.json({ error: "Agent failed", fallback: true }, { status: 500 });
}

export function successResponse(data: Record<string, unknown>, processingTime: number) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Processing-Time": `${processingTime}ms`,
    },
  });
}

export function parseAIResponse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  }
}
