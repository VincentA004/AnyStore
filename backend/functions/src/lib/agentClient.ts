import type { AgentQueryRequest, AgentQueryResponse, DocumentIngestRequest } from '../../../shared/contracts';

const getAgenticBackendUrl = () => {
  const value = process.env.AGENTIC_BACKEND_URL;
  if (!value) throw new Error('AGENTIC_BACKEND_URL is not configured.');
  return value.replace(/\/+$/, '');
};

const serviceHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.AGENT_PROXY_SHARED_SECRET) {
    headers['x-agent-proxy-secret'] = process.env.AGENT_PROXY_SHARED_SECRET;
  }
  return headers;
};

async function forward<TResponse>(routePath: string, body?: unknown): Promise<TResponse> {
  const response = await fetch(getAgenticBackendUrl() + routePath, {
    method: body ? 'POST' : 'GET',
    headers: serviceHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText;
    throw new Error(message);
  }

  return payload as TResponse;
}

export function queryAgent(request: AgentQueryRequest) {
  return forward<AgentQueryResponse>('/query', request);
}

export function ingestDocument(request: DocumentIngestRequest) {
  return forward('/documents/ingest', request);
}

export function getAgentHealth() {
  return forward('/health');
}
