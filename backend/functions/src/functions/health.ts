import { app } from '@azure/functions';
import { getAgentHealth } from '../lib/agentClient';
import { jsonResponse } from '../lib/http';

app.http('health', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'health',
  handler: async () => {
    try {
      const agent = await getAgentHealth();
      return jsonResponse({ status: 'ok', service: 'anystore-functions-proxy', agent });
    } catch (error) {
      return jsonResponse({
        status: 'degraded',
        service: 'anystore-functions-proxy',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 503);
    }
  },
});
