export type VerificationStatus = "unverified" | "unadjudicated" | "partially_verified" | "verified" | "verified_single_primary" | "verified_multi_source" | "conflicting" | "unsupported";
export type OutputDecision = "project_update_only" | "standalone_article" | "new_project_candidate" | "human_review" | "duplicate" | "additional_source" | "reject";
export type SourceType = "government" | "developer" | "project" | "filing" | "court" | "journalism" | "trade" | "aggregator" | "social" | "other";

export type VerificationSource = {
  source_ref_id?: string;
  url: string;
  source_name: string;
  source_tier: 1 | 2 | 3 | 4 | 5;
  published_date?: string;
  accessed_at?: string;
  source_type: SourceType;
  source_revision?: string;
  content_hash?: string;
  retrieval_status?: "fetched" | "unavailable";
  retrieval_attested?: boolean;
  body_bytes?: number;
  reachable?: boolean | null;
  http_status?: number | null;
  content_type?: string | null;
  final_url?: string;
  redirect_chain?: string[];
  verification_status?: VerificationStatus;
  claims_supported: string[];
};

export type ClaimEvidence = {
  claim_id: string;
  legacy_claim_id?: string;
  field?: string;
  claim_text_normalized: string;
  text?: string;
  claim_value?: unknown;
  value?: unknown;
  claim_type: string;
  type?: string;
  risk_level: "low" | "medium" | "high";
  risk_flags?: string[];
  source_ref_ids: string[];
  sources?: Array<Pick<VerificationSource, "source_ref_id" | "url" | "source_tier" | "source_type" | "source_revision" | "content_hash">>;
  source_tiers?: Array<1 | 2 | 3 | 4 | 5>;
  source_types?: SourceType[];
  supporting_source_ref_ids?: string[];
  conflicting_source_ref_ids?: string[];
  support?: "supported" | "unsupported" | "conflicted";
  support_status?: "supported" | "conflicted" | "unsupported" | "unadjudicated";
  verification_status: VerificationStatus | "attributed";
  conflict?: boolean;
  evidence?: Array<{
    review_id: string;
    decision: "supported" | "conflicted" | "unsupported";
    source_ref_ids: string[];
    content_hash: string;
    source_revision?: string;
    reviewed_at?: string;
    reviewer?: string;
    excerpt?: string;
  }>;
  material?: boolean;
  review_required?: boolean;
  notes?: string;
};

export type CanonicalProjectFactProposal = {
  proposal_id: string;
  project_id: string;
  field: string;
  old_value?: unknown;
  new_value: unknown;
  proposed_value: unknown;
  effective_date?: string;
  event_key?: string;
  supporting_claim_ids: string[];
  verification_source_ref_ids: string[];
  risk: "low" | "medium" | "high";
  review_requirement: "allowlisted_low_risk" | "human_review" | "blocked";
  apply: false;
  reason?: string;
  review?: { required: true; status: "pending" | "blocked"; requirement: "allowlisted_low_risk" | "human_review" | "blocked" };
  evidence?: { claim_ids: string[]; source_ref_ids: string[] };
  supersedes_proposal_id?: string;
  rollback: { previous_value: unknown; source_revision: string };
  canonical_index_revision?: string;
};

export type ProjectFactProposal = CanonicalProjectFactProposal;

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
  project_fact_proposals: CanonicalProjectFactProposal[];
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
  repository_index_sha256?: string;
  evidence_bundle_sha256?: string;
  processor_identity_sha256?: string;
  supplied_event_key?: string;
  derived_event_key?: string;
  dedupe_classification: "new_event" | "duplicate" | "additional_source" | "existing_known_fact" | "conflicting_event" | "material_update";
  recommendation: OutputDecision;
  warnings: { code: string; message: string }[];
  errors: { code: string; message: string }[];
  review?: {
    provided: boolean;
    accepted_records: number;
    rejected_records: number;
    held_claim_ids: string[];
    held_fact_proposals: number;
  };
  mutation_count: 0;
};

export type TrustedClaimReview = {
  review_id: string;
  intake_snapshot_sha256: string;
  claim_id: string;
  field: string;
  claim_type: string;
  claim_value: unknown;
  decision: "supported" | "conflicted" | "unsupported";
  verification_source_ref_ids: string[];
  content_hash: string;
  source_revision?: string;
  evidence_excerpt?: string;
  reviewed_at: string;
  reviewer: string;
};
