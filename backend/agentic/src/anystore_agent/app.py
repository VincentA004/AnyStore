from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .agent import AnyStoreAgent
from .settings import AgentSettings


class QueryRequest(BaseModel):
    workspace_id: str = Field(alias='workspaceId')
    question: str
    user_id: str | None = Field(default=None, alias='userId')
    document_ids: list[str] | None = Field(default=None, alias='documentIds')
    conversation_id: str | None = Field(default=None, alias='conversationId')

    model_config = {'populate_by_name': True}


class IngestRequest(BaseModel):
    workspace_id: str = Field(alias='workspaceId')
    document_id: str = Field(alias='documentId')
    blob_url: str = Field(alias='blobUrl')
    filename: str
    content_type: str | None = Field(default=None, alias='contentType')

    model_config = {'populate_by_name': True}


settings = AgentSettings()
agent = AnyStoreAgent(settings)
app = FastAPI(title='AnyStore Agentic Backend', version='0.1.0')


@app.get('/health')
def health() -> dict:
    return {
        'status': 'ok' if settings.is_configured else 'degraded',
        'service': 'anystore-agentic-backend',
        'provider': 'gcp-google-adk',
        'projectConfigured': settings.is_configured,
    }


@app.post('/query')
async def query(request: QueryRequest) -> dict:
    if not request.workspace_id or not request.question:
        raise HTTPException(status_code=400, detail='workspaceId and question are required.')
    return await agent.query(request.workspace_id, request.question)


@app.post('/documents/ingest')
async def ingest_document(request: IngestRequest) -> dict:
    if not request.workspace_id or not request.document_id or not request.blob_url:
        raise HTTPException(status_code=400, detail='workspaceId, documentId, and blobUrl are required.')
    return {
        'status': 'queued',
        'workspaceId': request.workspace_id,
        'documentId': request.document_id,
        'filename': request.filename,
    }
