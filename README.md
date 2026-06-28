# AnyStore

AnyStore is the consumer-facing Next.js frontend for document workspaces, uploads, search, and Q&A. The repo is set up for Vercel hosting with a managed backend such as Azure Functions or Azure Container Apps.

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend Configuration

Point the frontend at the managed AnyStore API with:

```bash
NEXT_PUBLIC_ANYSTORE_API_URL=https://your-backend-host
```

When this variable is set, the app uses the AnyStore backend client for workspaces, documents, uploads, and queries. The legacy Amplify paths are still present as fallback code while the product is migrated fully to the managed backend.

## Deployment

Deploy the frontend on Vercel. Do not commit local `.env` files or build output. Backend services should live outside this repo and expose HTTPS APIs consumed through `NEXT_PUBLIC_ANYSTORE_API_URL`.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Backend Scaffold

The planned Azure backend structure lives in `backend/`:

- `backend/agentic`: Microsoft Agent Framework service for Azure AI Foundry orchestration.
- `backend/functions`: Azure Functions proxy consumed by the Vercel frontend.
- `backend/shared`: request/response contracts and environment examples shared by both layers.
