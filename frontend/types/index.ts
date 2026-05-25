export type UserRole = "buyer" | "freelancer" | "admin";
export type JobStatus = "OPEN" | "PAYMENT_PENDING" | "AWAITING_DISPATCH" | "IN_PROGRESS" | "DELIVERED" | "IN_REVISION" | "COMPLETE" | "DISPUTED";
export type BidStatus = "PENDING" | "WON" | "LOST";
export type AgentStatus = "ACTIVE" | "INACTIVE" | "DORMANT" | "PAUSED";

export interface User { id: string; email: string; role: UserRole; name?: string; verified: boolean; }
export interface Job { id: string; title: string; description: string; budget: number; deadline: string; status: JobStatus; created_at: string; bid_count?: number; }
export interface Bid { id: string; job_id: string; freelancer_id: string; amount: number; eta_hours: number; match_score?: number; status: BidStatus; source: "AUTO" | "MANUAL"; }
export interface Payment { id: string; job_id: string; amount: number; status: "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "FAILED"; paid_at?: string; released_at?: string; }
export interface WorkforceAgent { id: string; name: string; status: Extract<AgentStatus, "ACTIVE" | "INACTIVE">; categories: string[]; tags: string[]; connected_at: string; }
export interface BidderAgent { id: string; status: AgentStatus; config: { tone: string; price_strategy: string; category_filters: string[]; match_threshold: number; auto_bid_enabled: boolean; }; }
export interface Notification { id: string; type: string; payload: Record<string, unknown>; read: boolean; created_at: string; }
