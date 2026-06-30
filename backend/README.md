# AnyStore Backend Scaffold

This folder lays out the planned managed backend for the group project. It is intentionally separate from the Next.js frontend so the frontend can deploy on Vercel while backend services deploy on GCP.

## Shape

- `agentic/`: Python `uv` project for the Google ADK service. It owns agent orchestration, retrieval, tools, and Google Cloud AI integration.
- `functions/`: legacy Azure Functions proxy scaffold kept as a request/response reference while we decide whether the GCP proxy should deploy on Cloud Run, Cloud Functions, or another managed gateway.
- `shared/`: shared TypeScript contracts and environment examples so frontend, proxy, and agent code agree on payload names.

## Request Flow

`Next.js frontend -> managed HTTP proxy -> Google ADK agentic backend -> GCP AI services`

The frontend should not call model providers, Vertex AI, or Google ADK runtime internals directly. Keep credentials and agent runtime details behind managed backend services.
