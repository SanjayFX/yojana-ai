export interface UserProfile {
  age: number;
  state: string;
  annual_income_inr: number;
  caste_category: "General" | "OBC" | "SC" | "ST" | "EWS";
  occupation: "farmer" | "student" | "unemployed" | "govt_employee" | "private_job" | "business";
  gender: "Male" | "Female" | "Other";
  is_farmer: boolean;
  has_bpl_card: boolean;
  is_student: boolean;
  is_disabled: boolean;
  is_widow: boolean;
  preferred_language: string;
}

export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: string;
  benefit: string;
  eligibility: {
    min_age: number | null;
    max_age: number | null;
    gender: string;
    caste_categories: string[];
    occupations: string[];
    max_annual_income_inr: number | null;
    requires_bpl_card: boolean;
    requires_land: boolean;
    eligible_states: string[];
    special_conditions: string | null;
  };
  documents_required: string[];
  apply_url: string;
  apply_modes: string[];
  helpline: string | null;
}

export interface SchemeMatch {
  id: string;
  confidence: "high" | "medium";
  reason: string;
  estimated_benefit: string;
}

export interface AgentResult {
  profile: UserProfile;
  matched_schemes: SchemeMatch[];
  total_annual_benefit: string;
  documents: Record<string, string[]>;
  actions: Record<string, ActionData>;
  processing_time_ms: number;
}

export interface ActionData {
  steps: string[];
  easiest_mode: string;
  portal_url: string;
  helpline: string | null;
  time_to_apply: string;
}

export interface SearchLog {
  state: string;
  age: number;
  income_range: string;
  caste_category: string;
  occupation: string;
  schemes_matched: number;
  total_benefit: string;
  language: string;
}
