import { createClient } from "@supabase/supabase-js";
import { callAI, FLASH } from "@/lib/ai";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offset = 0, limit = 20 } = await req
    .json()
    .catch(() => ({}));

  const supabase = getAdmin();

  const { data: schemes } = await supabase
    .from("schemes")
    .select("id, name, ministry, eligible_states, scheme_type")
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: true });

  if (!schemes || schemes.length === 0) {
    return Response.json({ done: true, classified: 0 });
  }

  const prompt = `Classify each Indian government scheme
    as "central", "state", or "both".
    
    Rules:
    - "central" = run by Government of India,
      available nationwide, ministry-level
    - "state" = run by specific state government,
      only for residents of that state
    - "both" = has central component AND
      state component
    
    Schemes to classify:
    ${JSON.stringify(
      schemes.map((s) => ({
        id: s.id,
        name: s.name,
        ministry: s.ministry,
        states: s.eligible_states,
      }))
    )}
    
    Return ONLY JSON:
    { "schemeId": "central"|"state"|"both" }
    No markdown. No explanation.`;

  let classified = 0;
  try {
    const raw = await callAI(FLASH, prompt);
    const cleaned = raw
      .replace(/\`\`\`json|\`\`\`/g, "")
      .trim();
    const result = JSON.parse(cleaned) as Record<string, string>;

    for (const [id, type] of Object.entries(result)) {
      if (["central", "state", "both"].includes(type)) {
        await supabase
          .from("schemes")
          .update({
            scheme_type: type,
          })
          .eq("id", id);

        classified += 1;
      }
    }
  } catch {
    // silent
  }

  return Response.json({
    done: false,
    offset,
    classified,
    next_offset: offset + limit,
  });
}

export function GET() {
  return Response.json({ error: "Use POST" }, { status: 405 });
}
