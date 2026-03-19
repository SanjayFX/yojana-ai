import { callAI, FLASH } from "@/lib/ai";
import { parseAIResponse } from "@/lib/api-utils";
import { createClient } from "@supabase/supabase-js";

const seedSecret = process.env.SEED_SECRET?.trim() || "";
type NewScheme = Record<string, unknown> & { id: string; name: string };

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!seedSecret || authHeader !== `Bearer ${seedSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { state } = (await req.json().catch(() => ({}))) as {
    state?: string;
  };

  const prompt = `You are a researcher on Indian government schemes.
Search your knowledge for government welfare schemes
${
  state
    ? `specifically for the state of ${state}`
    : "at the central government level"
}
that were announced or updated in 2024-2026.

Focus on schemes that:
- Directly benefit citizens (cash transfer, insurance, education, housing)
- Are currently active as of early 2026
- Have clear eligibility criteria

Return a JSON array of up to 10 schemes.
Each scheme MUST follow this exact schema:
{
  "id": "kebab-case-unique-id",
  "name": "Official scheme name",
  "ministry": "Ministry name",
  "category": "agriculture|health|education|housing|finance|women|disability|elderly|employment",
  "benefit": "Specific amount or service description",
  "eligibility": {
    "min_age": null or number,
    "max_age": null or number,
    "gender": "Male|Female|Any",
    "caste_categories": ["General","OBC","SC","ST","EWS"] or ["Any"],
    "occupations": ["farmer","student","unemployed","govt_employee","private_job","business"] or ["Any"],
    "max_annual_income_inr": null or number,
    "requires_bpl_card": false,
    "requires_land": false,
    "eligible_states": ["State Name"] or ["All"],
    "special_conditions": null or "string"
  },
  "documents_required": ["doc1","doc2"],
  "apply_url": "official gov url",
  "apply_modes": ["online","CSC_center","bank"],
  "helpline": null or "number"
}

Return ONLY the JSON array. No markdown. No explanation.`;

  let newSchemes: NewScheme[] = [];

  try {
    const raw = await callAI(FLASH, prompt, 4096);
    const parsed = parseAIResponse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("AI returned a non-array payload");
    }

    newSchemes = parsed as NewScheme[];
    const { error } = await supabaseAdmin
      .from("schemes")
      .upsert(newSchemes, { onConflict: "id" });

    if (error) throw error;

    return Response.json({
      added: newSchemes.length,
      schemes: newSchemes.map((s) => ({ id: s.id, name: s.name })),
    });
  } catch (err) {
    const details =
      err instanceof Error
        ? err.message
        : JSON.stringify(err, null, 2) || String(err);

    return Response.json(
      {
        error: "Update failed",
        details,
        schemes:
          newSchemes.length > 0
            ? newSchemes.map((s) => ({ id: s.id, name: s.name }))
            : [],
      },
      { status: 500 }
    );
  }
}
