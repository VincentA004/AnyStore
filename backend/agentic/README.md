# Agentic Backend

This service will host the Microsoft Agent Framework runtime and own all interaction with Azure AI Foundry.

## Responsibilities

- Create and run the AnyStore document assistant agent.
- Connect to Azure AI Foundry agents, models, vector stores, and tools.
- Execute retrieval, citations, document analysis, and longer-running workflows.
- Keep model/provider credentials out of the frontend and Azure Function proxy.

## Planned API Surface

- `POST /query`: answer a workspace-scoped user question.
- `POST /documents/ingest`: ingest or register a document for retrieval.
- `GET /health`: service health check.

## Implementation Notes

The files in `src/anystore_agent` are placeholders for the real Microsoft Agent Framework implementation. Use managed identity in Azure where possible, and keep local secrets in untracked environment files.
