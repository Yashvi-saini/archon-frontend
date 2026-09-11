
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | string;
  time_limit_minutes: number;
  expected_topics: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateInterviewRequest {
  difficulty: "easy" | "medium" | "hard" | "senior" | "staff" | string;
  question_id?: string;
}

export interface UserInterviewSummary {
  id: string;
  user_id: number;
  question_id: string;
  score: number | null;
  feedback: unknown;
  started_at: string;
  ended_at: string | null;
  deleted_at: string | null;
}

export interface StartInterviewResponse {
  session_id: string;
  question: Question;
}

export interface InterviewReport {
  id: string;
  user_id: number;
  question_id: string;
  score: number | null;
  feedback: string | Record<string, any> | null;
  started_at: string;
  ended_at: string | null;
  deleted_at: string | null;
}

export type InterviewReportStatus = "done" | "evaluating";

export interface InterviewReportResult {
  status: InterviewReportStatus;
  report?: InterviewReport;
}


export type WsOutgoingType =
  | "chat"
  | "node_added"
  | "node_updated"
  | "node_deleted"
  | "edge_added"
  | "edge_updated"
  | "edge_deleted";

export interface WsEnvelope<T = unknown> {
  type: WsOutgoingType;
  data: T;
}


export type WsChatPayload = string | { content: string };


export interface WsNodeData {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

export interface WsNodeDeletedData {
  id: string;
}


export interface WsEdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface WsEdgeDeletedData {
  id: string;
}

export interface WsIncomingMessage {
  role: "ai" | "user";
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}


export interface ExcalidrawElementSnapshot {
  id: string;
  type: string;
  isDeleted: boolean;
  text?: string;          
  x: number;
  y: number;
  width: number;
  height: number;
  // For arrows/lines
  startBinding?: { elementId: string } | null;
  endBinding?: { elementId: string } | null;
  // For text bound to shapes
  containerId?: string | null;
}

export interface DiagramNode {
  id: string;
  interview_id?: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

export interface DiagramEdge {
  id: string;
  interview_id?: string;
  source: string;
  target: string;
  type: string;
}

export interface DiagramResponse {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface CanvasPreferences {
  gridType: "dots" | "grid" | "blank";
  snapToGrid: boolean;
  syncDebounceMs: number;
}
