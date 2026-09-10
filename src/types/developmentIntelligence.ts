export type VerificationStatus = "unverified" | "partially_verified" | "verified" | "verified_single_primary" | "verified_multi_source" | "conflicting" | "unsupported";
export type OutputDecision = "project_update_only" | "standalone_article" | "new_project_candidate" | "human_review" | "duplicate" | "additional_source" | "reject";
export type SourceType = "government" | "developer" | "project" | "filing" | "court" | "journalism" | "trade" | "aggregator" | "social" | "other";

export type VerificationSource = {
  url: string;
  source_name: string;
  source_tier: 1 | 2 | 3 | 4 | 5;
  published_date?: string;
  accessed_at?: string;
  source_type: SourceType;
  claims_supported: string[];
};

export type ClaimEvidence = {
  claim_id: string;
  claim_text_normalized: string;
  claim_type: string;
  risk_level: "low" | "medium" | "high";
  source_ref_ids: string[];
  verification_status: "verified" | "attributed" | "conflicting" | "unsupported";
  notes?: string;
};

export type ProjectFactProposal = {
  project_id: string;
  field: string;
  current_value?: unknown;
  proposed_value: unknown;
  evidence_claim_ids: string[];
  apply: false;
};

export type DevelopmentUpdateCandidate = {
  update_id: string;
  event_key: string;
  headline: string;
  event_date?: string;
  related_project_ids: string[];
  related_corridor_ids: string[];
  category: string;
  output_type: "project_update" | "standalone_article" | "none";
  summary: string;
  material_updates: string[];
  buyer_context?: string;
  lead_source?: { url?: string; source_name?: string; sheet_intel_id: string };
  verification_sources: VerificationSource[];
  claim_evidence: ClaimEvidence[];
  source_quality: string;
  verification_summary: string;
  risk_flags: string[];
  review_status: "draft" | "needs_review";
  author_id?: string;
  reviewer_id?: string;
  article_candidate?: { slug: string; headline: string; summary: string; canonical_path: string };
  project_fact_proposals: ProjectFactProposal[];
  sheet_intel_ids: string[];
  supersedes_update_id?: string;
};

export type IntelValidationReport = {
  processor_version: string;
  intel_id: string;
  row_sha256: string;
  claim_ledger_sha256: string;
  event_identity_sha256: string;
  candidate_sha256: string;
  supplied_event_key?: string;
  derived_event_key?: string;
  dedupe_classification: "new_event" | "duplicate" | "additional_source" | "existing_known_fact" | "conflicting_event" | "material_update";
  recommendation: OutputDecision;
  warnings: { code: string; message: string }[];
  errors: { code: string; message: string }[];
  mutation_count: 0;
};
