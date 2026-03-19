import { createClient } from "@supabase/supabase-js";
import schemesData from "@/data/schemes.json";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== "Bearer " + process.env.SEED_SECRET) {
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

  const { data, error } = await supabaseAdmin
    .from("schemes")
    .upsert(schemesData as object[], { onConflict: "id" });

  if (error) {
    console.error("Seed error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    seeded: schemesData.length,
    message: "Schemes seeded to Supabase successfully",
  });
}

export function GET() {
  return Response.json({ error: "Use POST" }, { status: 405 });
}
