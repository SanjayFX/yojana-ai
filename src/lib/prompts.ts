import type { UserProfile, SchemeData } from "./types";

export function buildProfilePrompt(
  answers: Record<string, string>
): string {
  return `You are an expert at extracting structured user profile data from conversational answers.

Given the following answers from a user seeking Indian government welfare schemes, extract a structured profile.

User Answers:
${JSON.stringify(answers, null, 2)}

You MUST respond with ONLY a valid JSON object (no markdown, no explanation) matching this exact structure:
{
  "age": <number>,
  "state": "<string - Indian state name>",
  "annual_income_inr": <number>,
  "caste_category": "<General|OBC|SC|ST|EWS>",
  "occupation": "<string>",
  "gender": "<Male|Female|Other>",
  "is_farmer": <boolean>,
  "has_bpl_card": <boolean>,
  "is_student": <boolean>,
  "is_disabled": <boolean>,
  "is_widow": <boolean>,
  "preferred_language": "<string - default to English if not specified>"
}

Rules:
- Infer values from context when possible (e.g., if occupation is "farming", set is_farmer to true)
- If income is mentioned in monthly terms, multiply by 12 for annual
- Default boolean fields to false if not mentioned
- Use "English" as default preferred_language if not specified
- State names should be full official names (e.g., "Tamil Nadu", not "TN")`;
}

export function buildEligibilityPrompt(
  profile: UserProfile,
  schemes: SchemeData[]
): string {
  const normalize = (value?: string | null) => value?.toLowerCase().trim() || "";

  const preFiltered = schemes
    .filter((s) => {
      const e = s.eligibility;
      if (e.min_age && e.max_age) {
        if (profile.age < e.min_age || profile.age > e.max_age) return false;
      }

      if (
        e.gender &&
        e.gender !== "Any" &&
        profile.gender !== "Any" &&
        e.gender !== profile.gender
      ) {
        return false;
      }

      if (
        e.max_annual_income_inr &&
        profile.annual_income_inr > e.max_annual_income_inr * 2
      ) {
        return false;
      }

      return true;
    })
    .map((scheme) => {
      const eligibility = scheme.eligibility;
      const eligibleStates = eligibility.eligible_states ?? [];
      const occupations = (eligibility.occupations ?? []).map(normalize);
      const casteCategories = eligibility.caste_categories ?? [];

      let score = 0;
      if (eligibleStates.includes(profile.state)) score += 10;
      if (eligibleStates.includes("All")) score += 2;

      if (occupations.includes(normalize(profile.occupation))) score += 6;
      if (occupations.includes("any")) score += 2;

      if (profile.is_student && scheme.category === "education") score += 5;
      if (profile.is_farmer && scheme.category === "agriculture") score += 5;
      if (profile.gender === "Female" && scheme.category === "women") score += 4;
      if (profile.has_bpl_card && scheme.category === "housing") score += 2;

      if (eligibility.gender === profile.gender) score += 3;
      if (eligibility.gender === "Any") score += 1;

      if (casteCategories.includes(profile.caste_category)) score += 2;
      if (casteCategories.includes("Any") || casteCategories.length === 0) score += 1;

      return { scheme, score };
    })
    .sort((a, b) => b.score - a.score || a.scheme.name.localeCompare(b.scheme.name));

  const schemesToSend = preFiltered.slice(0, 25).map(({ scheme }) => ({
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    benefit: scheme.benefit,
    eligibility: scheme.eligibility,
  }));

  return `You are a senior advisor on Indian government welfare policy.
Your analysis must be accurate - wrong advice harms real families.

CITIZEN PROFILE:
${JSON.stringify(profile, null, 2)}

CANDIDATE SCHEMES (pre-filtered, ${schemesToSend.length} schemes):
${JSON.stringify(schemesToSend)}

MATCHING RULES:
1. Check every eligibility field carefully.
2. confidence 0.9 = citizen meets ALL criteria clearly.
3. confidence 0.6 = likely qualifies but one field is ambiguous.
4. EXCLUDE schemes where citizen clearly does not qualify.
5. Prefer schemes specific to ${profile.state} when they clearly fit.
6. Prefer direct welfare schemes (agriculture, health, education, women, employment, housing) over generic banking or insurance add-ons when both fit.
7. For student profiles, prefer scholarships, girls education, youth support, and state education schemes.
8. For female profiles, include women-focused schemes when they fit.
9. Return only the 6 strongest matches.

REASON: Write in Hinglish (casual Hindi + English mix).
Example: "Aap qualify karte hain kyunki income Rs 2L hai jo limit se kam hai."

Return ONLY valid JSON. No markdown.

{
  "matched_schemes": [
    {
      "id": string,
      "confidence": number,
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
  schemes: SchemeData[]
): string {
  const relevantSchemes = schemes
    .filter((s) => schemeIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      documents_required: s.documents_required,
    }));

  return `You are an expert on Indian government documentation requirements.

Given these government welfare schemes, provide the EXACT documents needed for each:

SCHEMES:
${JSON.stringify(relevantSchemes)}

You MUST respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "documents": {
    "<scheme_id>": [
      "<document 1 - be specific, e.g., 'Aadhaar Card'>",
      "<document 2>"
    ]
  }
}

Rules:
- Be specific about document types (e.g., "Income Certificate from Tehsildar" not just "Income Certificate")
- Return only the 3-4 most important documents per scheme
- Skip repetitive boilerplate like "original + photocopy" unless legally essential
- Mention digital alternatives only when they materially help`;
}

export function buildActionPrompt(
  schemeIds: string[],
  profile: UserProfile,
  schemes: SchemeData[]
): string {
  const relevantSchemes = schemes
    .filter((s) => schemeIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      benefit: s.benefit,
      apply_url: s.apply_url,
      apply_modes: s.apply_modes,
    }));

  return `You are an expert guide for Indian government scheme applications.

Given the citizen's profile and matched schemes, provide step-by-step application guidance.

CITIZEN PROFILE:
${JSON.stringify(profile)}

MATCHED SCHEMES:
${JSON.stringify(relevantSchemes)}

You MUST respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "actions": {
    "<scheme_id>": {
      "steps": [
        "Step 1: <specific action>",
        "Step 2: <specific action>",
        "Step 3: <specific action>"
      ],
      "apply_url": "<official application URL>",
      "apply_modes": ["<Online|Offline|CSC Center|Bank Branch>"],
      "timeline": "<expected processing time>",
      "helpline": "<helpline number if available>"
    }
  }
}

OFFICIAL PORTAL URLS — use these exact URLs:
pm_kisan → https://pmkisan.gov.in
ab_pmjay → https://pmjay.gov.in
pmay_urban → https://pmaymis.gov.in
pmay_rural → https://pmayg.nic.in
mgnrega → https://nrega.nic.in
kisan_credit_card → https://www.nabard.org
pm_mudra → https://www.mudra.org.in
pm_fasal_bima → https://pmfby.gov.in
pm_ujjwala → https://pmuy.gov.in
pm_jan_dhan → https://pmjdy.gov.in
atal_pension → https://npscra.nsdl.co.in
pm_jeevan_jyoti → https://jansuraksha.gov.in
pm_suraksha_bima → https://jansuraksha.gov.in
stand_up_india → https://www.standupmitra.in
pm_vishwakarma → https://pmvishwakarma.gov.in
national_scholarship → https://scholarships.gov.in
pm_scholarship_capf → https://scholarships.gov.in
pmkvy → https://www.pmkvyofficial.org
pm_surya_ghar → https://pmsuryaghar.gov.in
sukanya_samriddhi → https://www.indiapost.gov.in
pudhumai_penn → https://pudumaipenn.tn.gov.in
pudhumai-penn-scheme → https://pudumaipenn.tn.gov.in
cm_breakfast → https://www.tnschools.gov.in
cm-breakfast-scheme → https://www.tnschools.gov.in
up_kanya_sumangala → https://mksy.up.gov.in
up-kanya-sumangala-yojana → https://mksy.up.gov.in
karnataka_yuvanidhi → https://sevasindhu.karnataka.gov.in
karnataka-yuvanidhi-scheme → https://sevasindhu.karnataka.gov.in
bihar_student_credit_card → https://www.7nishchay-yuvaupmission.bihar.gov.in
bihar-student-credit-card-scheme → https://www.7nishchay-yuvaupmission.bihar.gov.in
For any other scheme use:
  https://www.myscheme.gov.in/search

Rules:
- Steps should be clear, actionable, and in order
- Return exactly 3 concise steps per scheme
- Include both online and offline options where available
- Mention nearest CSC (Common Service Center) as an option
- Include state-specific portals where applicable for ${profile.state}
- Keep timeline to one short sentence`;
}
