# Managed HTTP Proxy

This folder currently contains the original Azure Functions HTTP proxy scaffold. The Next.js app should call the deployed proxy through `NEXT_PUBLIC_ANYSTORE_API_URL`; before production, replace or adapt this layer for the final GCP target.

## Responsibilities

- Expose stable HTTP endpoints for the frontend.
- Validate request shape and auth context.
- Forward agent requests to `backend/agentic`.
- Keep direct Google ADK, Vertex AI, and model-provider details outside the frontend.

## Planned Endpoints

- `GET /api/health`
- `POST /api/query`
- `POST /api/documents/ingest`

## Deployment Note

We should choose the final GCP proxy target next: Cloud Run gives us the most flexibility; Cloud Functions is lighter if the proxy stays thin. Until then, treat the TypeScript Azure Functions code here as a request/response shape reference, not the final hosting implementation.
