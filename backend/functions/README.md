# Azure Function Proxy

This Azure Functions app is the frontend-facing backend boundary. The Next.js app should call this service through `NEXT_PUBLIC_ANYSTORE_API_URL`.

## Responsibilities

- Expose stable HTTP endpoints for the frontend.
- Validate request shape and auth context.
- Forward agent requests to `backend/agentic`.
- Keep direct Azure AI Foundry details outside the frontend.

## Planned Endpoints

- `GET /api/health`
- `POST /api/query`
- `POST /api/documents/ingest`

## Local Development

Copy `local.settings.example.json` to `local.settings.json` and fill in local values. Do not commit `local.settings.json`.
