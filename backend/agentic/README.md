# Agentic Backend

This service hosts the AnyStore Google ADK runtime and owns interaction with GCP AI services.

## Responsibilities

- Create and run the AnyStore document assistant agent.
- Connect to Google ADK, Vertex AI/Gemini, vector search, storage, and tool integrations.
- Execute retrieval, citations, document analysis, and longer-running workflows.
- Keep model/provider credentials out of the frontend and proxy layer.

## Local Development

Install/sync dependencies with uv:

```bash
uv sync
uv run uvicorn anystore_agent.app:app --reload --port 8080
```

## Planned API Surface

- `POST /query`: answer a workspace-scoped user question.
- `POST /documents/ingest`: ingest or register a document for retrieval.
- `GET /health`: service health check.

## Implementation Notes

The files in `src/anystore_agent` are placeholders for the real Google ADK implementation. Use Google Application Default Credentials for local development and service accounts/workload identity in deployed GCP environments.
