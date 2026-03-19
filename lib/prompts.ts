import type { Scheme, UserProfile } from "./types";

export function buildProfilePrompt(answers: Record<string, string>): string {
  return `You are an expert data parser for Indian government welfare schemes.
Your only job is to convert raw form answers into a structured JSON profile.

RAW ANSWERS:
${JSON.stringify(answers, null, 2)}

OUTPUT RULES:
1. Return ONLY valid JSON. No explanation. No markdown. No extra text.
2. Infer boolean fields (is_farmer, is_student etc) from occupation.
3. Normalize income string to annual INR number (eg "1-3 lakh" = 200000).
4. Normalize state names to official spellings.

OUTPUT FORMAT:
{
  "age": number,
  "state": string,
  "annual_income_inr": number,
  "caste_category": "General" | "OBC" | "SC" | "ST" | "EWS",
  "occupation": "farmer" | "student" | "unemployed" | "govt_employee" | "private_job" | "business",
  "gender": "Male" | "Female" | "Other",
  "is_farmer": boolean,
  "has_bpl_card": boolean,
  "is_student": boolean,
  "is_disabled": boolean,
  "is_widow": boolean,
  "preferred_language": string
}`;
}

export function buildEligibilityPrompt(
  profile: UserProfile,
  schemes: Scheme[]
): string {
  return `You are a senior advisor on Indian government welfare policy with 20 years of experience.
Your analysis must be accurate -- wrong advice harms real families.

CITIZEN PROFILE:
${JSON.stringify(profile, null, 2)}

AVAILABLE SCHEMES:
${JSON.stringify(schemes, null, 2)}

MATCHING RULES (follow strictly):
1. Check EVERY eligibility field -- age, income, caste, occupation, state, special conditions.
2. Mark confidence "high" only if citizen meets ALL criteria clearly.
3. Mark confidence "medium" if they likely qualify but one field is ambiguous.
4. EXCLUDE any scheme where citizen clearly does not qualify.
5. It is better to return 5 accurate matches than 15 uncertain ones.
6. Be strict. Wrong eligibility = wrong life advice.

REASON FORMAT: Write in Hinglish (casual Hindi + English mix).
Example: "Aap qualify karte hain kyunki aapki income Rs 1.2 lakh hai jo limit se kam hai, aur aap registered farmer hain."

OUTPUT RULES:
Return ONLY valid JSON. No markdown. No explanation outside JSON.

{
  "matched_schemes": [
    {
      "id": string,
      "confidence": "high" | "medium",
      "reason": string,
      "estimated_benefit": string
    }
  ],
  "total_annual_benefit": string,
  "important_note": string | null
}`;
}

export function buildDocumentsPrompt(
  schemeIds: string[],
  schemes: Scheme[]
): string {
  const filtered = schemes.filter((s) => schemeIds.includes(s.id));
  return `For each scheme below, list the exact documents required to apply.

SCHEME IDs: ${JSON.stringify(schemeIds)}
SCHEMES DATA: ${JSON.stringify(filtered, null, 2)}

OUTPUT RULES:
1. Return ONLY valid JSON. No markdown. No explanation.
2. Be specific -- include document name and purpose.
3. Do not repeat the same document across all schemes unnecessarily.

OUTPUT FORMAT:
{
  "[schemeId]": ["document 1", "document 2", ...]
}`;
}

export function buildActionPrompt(
  schemeIds: string[],
  profile: UserProfile,
  schemes: Scheme[]
): string {
  const filtered = schemes.filter((s) => schemeIds.includes(s.id));
  return `Give step-by-step apply instructions for each scheme for a citizen in ${profile.state} working as ${profile.occupation}.

SCHEME IDs: ${JSON.stringify(schemeIds)}
SCHEMES DATA: ${JSON.stringify(filtered, null, 2)}

OUTPUT RULES:
1. Return ONLY valid JSON. No markdown. No explanation.
2. Steps must be in Hinglish (casual Hindi + English).
3. Recommend easiest apply mode based on state and occupation.

OUTPUT FORMAT:
{
  "[schemeId]": {
    "steps": ["step 1", "step 2", "step 3"],
    "easiest_mode": "online" | "CSC_center" | "bank" | "hospital",
    "portal_url": string,
    "helpline": string | null,
    "time_to_apply": string
  }
}`;
}
