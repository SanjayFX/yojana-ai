import type { SchemeData, SchemeMatch, UserProfile } from "./types";

export function meetsBaseEligibility(profile: UserProfile, scheme: SchemeData) {
  const eligibility = scheme.eligibility;

  if (eligibility.min_age && profile.age < eligibility.min_age) return false;
  if (eligibility.max_age && profile.age > eligibility.max_age) return false;

  if (
    eligibility.gender &&
    eligibility.gender !== "Any" &&
    profile.gender !== eligibility.gender
  ) {
    return false;
  }

  const eligibleStates = eligibility.eligible_states ?? [];
  if (
    eligibleStates.length > 0 &&
    !eligibleStates.includes("All") &&
    !eligibleStates.includes(profile.state)
  ) {
    return false;
  }

  return true;
}

export function mergeAutomaticMatches(
  profile: UserProfile,
  schemes: SchemeData[],
  matchedSchemes: SchemeMatch[]
) {
  const alreadyMatched = new Set(matchedSchemes.map((scheme) => scheme.id));
  const autoMatched: SchemeMatch[] = [];

  const autoIncludeIds = new Set<string>();
  const preferredLanguage = (profile.preferred_language || "en").toLowerCase();
  const isEnglish = preferredLanguage === "en" || preferredLanguage === "english";

  if (profile.occupation === "farmer" || profile.is_farmer) {
    [
      "pm_kisan",
      "pm_fasal_bima",
      "kisan_credit_card",
      "soil_health_card",
      "pm_krishi_sinchai",
    ].forEach((id) => autoIncludeIds.add(id));
  }

  if (profile.occupation === "student" || profile.is_student) {
    for (const scheme of schemes) {
      const occupations = (scheme.eligibility.occupations ?? []).map((value) =>
        value.toLowerCase()
      );
      const isStudentScheme =
        scheme.category === "education" ||
        occupations.some((value) =>
          ["student", "youth", "job seeker", "school or college dropout"].includes(value)
        ) ||
        /scholarship|skill|naan_mudhalvan|student/i.test(
          `${scheme.id} ${scheme.name}`
        );

      if (isStudentScheme) {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  if (profile.gender === "Female") {
    for (const scheme of schemes) {
      if (scheme.category === "women") {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  if (profile.caste_category === "SC" || profile.caste_category === "ST") {
    for (const scheme of schemes) {
      if ((scheme.eligibility.caste_categories ?? []).includes(profile.caste_category)) {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  if (profile.age >= 60) {
    for (const scheme of schemes) {
      const text = `${scheme.id} ${scheme.name} ${scheme.category}`.toLowerCase();
      const isElderlyScheme =
        scheme.category === "elderly" ||
        /pension|old age|vridha|vriddha|sandhya|suraksha/.test(text);
      const isAyushmanScheme = /ayushman|pmjay|jan arogya/.test(text);
      const isRelevantWidowOrDisabilityScheme =
        (profile.is_widow && /widow/.test(text)) ||
        (profile.is_disabled && /disability|divyang/.test(text));

      if (isElderlyScheme || isAyushmanScheme || isRelevantWidowOrDisabilityScheme) {
        autoIncludeIds.add(scheme.id);
      }
    }
  }

  for (const scheme of schemes) {
    if (!autoIncludeIds.has(scheme.id)) continue;
    if (alreadyMatched.has(scheme.id)) continue;
    if (!meetsBaseEligibility(profile, scheme)) continue;

    let reason: string
    if (isEnglish) {
      if (profile.age >= 60 && scheme.category === "elderly") {
        reason =
          "This elderly-support scheme is being included because the profile is age 60+ and passes the base age, state, and gender checks."
      } else if (profile.age >= 60 && /ayushman|pmjay|jan arogya/i.test(`${scheme.id} ${scheme.name}`)) {
        reason =
          "This health-coverage scheme is being included for the age 60+ profile under the elderly matching rules."
      } else if (profile.occupation === "student" || profile.is_student) {
        reason =
          "This scheme is also relevant for the student profile based on the requested education and skill-support matching rules."
      } else if (profile.gender === "Female" && scheme.category === "women") {
        reason =
          "This women-focused scheme is being included because the profile is female and passes the base age, state, and gender checks."
      } else {
        reason =
          "This scheme is also relevant for the profile under the requested automatic matching rules."
      }
    } else {
      if (profile.age >= 60 && scheme.category === "elderly") {
        reason =
          "Age 60+ profile ke basis par yeh elderly support scheme bhi include ki gayi hai, kyunki basic age aur state checks fit ho rahe hain."
      } else if (profile.age >= 60 && /ayushman|pmjay|jan arogya/i.test(`${scheme.id} ${scheme.name}`)) {
        reason =
          "Age 60+ profile ke liye yeh health coverage scheme bhi elderly matching rules ke basis par include ki gayi hai."
      } else if (profile.occupation === "student" || profile.is_student) {
        reason =
          "Student profile ke basis par yeh scheme bhi relevant hai, especially education ya skill support ke liye."
      } else if (profile.gender === "Female" && scheme.category === "women") {
        reason =
          "Female profile ke basis par yeh women-focused scheme bhi include ki gayi hai, kyunki basic age aur state checks fit ho rahe hain."
      } else {
        reason =
          "Profile ke basis par yeh scheme bhi requested automatic matching rules ke hisaab se relevant hai."
      }
    }

    autoMatched.push({
      id: scheme.id,
      confidence: 0.6,
      reason,
      estimated_benefit: scheme.benefit,
    });
  }

  return [...matchedSchemes, ...autoMatched].sort(
    (a, b) => b.confidence - a.confidence
  );
}
