from .settings import AgentSettings


class AnyStoreAgent:
    """Boundary for the Google ADK-backed AnyStore agent runtime."""

    def __init__(self, settings: AgentSettings):
        self.settings = settings

    async def query(self, workspace_id: str, question: str) -> dict:
        # TODO: wire Google ADK agent, tools, retrieval, and citations.
        return {
            "answer": "Google ADK backend is scaffolded but not implemented yet.",
            "sources": [],
            "workspaceId": workspace_id,
            "question": question,
            "model": self.settings.anystore_agent_model,
        }
