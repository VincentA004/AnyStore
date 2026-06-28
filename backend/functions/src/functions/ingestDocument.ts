import { app } from '@azure/functions';
import type { DocumentIngestRequest } from '../../../shared/contracts';
import { ingestDocument } from '../lib/agentClient';
import { jsonResponse, readJson } from '../lib/http';

app.http('ingestDocument', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'documents/ingest',
  handler: async (request) => {
    try {
      const body = await readJson<DocumentIngestRequest>(request);
      if (!body.workspaceId || !body.documentId || !body.blobUrl || !body.filename) {
        return jsonResponse({ error: 'workspaceId, documentId, blobUrl, and filename are required.' }, 400);
      }

      const result = await ingestDocument(body);
      return jsonResponse(result);
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
    }
  },
});
