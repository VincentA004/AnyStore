import { app } from '@azure/functions';
import type { AgentQueryRequest } from '../../../shared/contracts';
import { queryAgent } from '../lib/agentClient';
import { jsonResponse, readJson } from '../lib/http';

app.http('query', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'query',
  handler: async (request) => {
    try {
      const body = await readJson<AgentQueryRequest>(request);
      if (!body.workspaceId || !body.question) {
        return jsonResponse({ error: 'workspaceId and question are required.' }, 400);
      }

      const result = await queryAgent(body);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  },
});
