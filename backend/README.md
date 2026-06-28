# AnyStore Backend Scaffold

This folder lays out the planned managed backend for the group project. It is intentionally separate from the Next.js frontend so the frontend can deploy on Vercel while backend services deploy on Azure.

## Shape

- `agentic/`: Microsoft Agent Framework service that owns AI Foundry interaction, tool orchestration, retrieval, and agent behavior.
- `functions/`: Azure Functions HTTP proxy layer that the frontend calls. It validates requests, handles auth boundaries, and forwards normalized requests to the agentic service.
- `shared/`: shared TypeScript contracts and environment examples so frontend, functions, and agent code agree on payload names.

## Request Flow

`Next.js frontend -> Azure Function proxy -> Agentic backend -> Azure AI Foundry`

The frontend should not call Azure AI Foundry directly. Keep provider credentials and agent runtime details behind Azure-managed services.
