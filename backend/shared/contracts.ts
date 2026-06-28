export interface AgentQueryRequest {
  workspaceId: string;
  question: string;
  userId?: string;
  documentIds?: string[];
  conversationId?: string;
}

export interface AgentSource {
  documentId?: string;
  filename?: string;
  quote?: string;
  score?: number;
}

export interface AgentQueryResponse {
  answer: string;
  sources: AgentSource[];
  conversationId?: string;
}

export interface DocumentIngestRequest {
  workspaceId: string;
  documentId: string;
  blobUrl: string;
  filename: string;
  contentType?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
}
