export interface UserProfile {
  age: number;
  state: string;
  annual_income_inr: number;
  caste_category: string;
  occupation: string;
  gender: string;
  is_farmer: boolean;
  has_bpl_card: boolean;
  is_student: boolean;
  is_disabled: boolean;
  is_widow: boolean;
  preferred_language: string;
}

export interface SchemeData {
  id: string;
  name: string;
  ministry: string;
  category: string;
  benefit: string;
  eligibility: EligibilityCriteria;
  documents_required: string[];
  apply_url: string;
  apply_modes: string[];
  helpline?: string | null;
}

export interface EligibilityCriteria {
  min_age?: number | null;
  max_age?: number | null;
  gender?: string;
  caste_categories?: string[];
  occupations?: string[];
  max_annual_income_inr?: number | null;
  requires_bpl_card?: boolean;
  requires_land?: boolean;
  eligible_states?: string[];
  special_conditions?: string | null;
}

export interface SchemeMatch {
  id: string;
  confidence: number;
  reason: string;
  estimated_benefit: string;
  name?: string;
  apply_url?: string;
}

export interface ActionData {
  steps: string[];
  apply_url: string;
  portal_url?: string;
  apply_modes: string[];
  timeline: string;
  helpline?: string;
}

export interface AgentResult {
  profile: UserProfile;
  matched_schemes: SchemeMatch[];
  total_annual_benefit: string;
  documents: Record<string, string[]>;
  actions: Record<string, ActionData>;
  processing_time_ms: number;
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
