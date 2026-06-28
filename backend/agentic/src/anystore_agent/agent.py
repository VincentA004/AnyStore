from .settings import AgentSettings


class AnyStoreAgent:
    """Placeholder boundary for the Microsoft Agent Framework runtime."""

    def __init__(self, settings: AgentSettings):
        self.settings = settings

    async def query(self, workspace_id: str, question: str) -> dict:
        # TODO: initialize Microsoft Agent Framework and call Azure AI Foundry.
        return {
            "answer": "Agentic backend is scaffolded but not implemented yet.",
            "sources": [],
            "workspaceId": workspace_id,
            "question": question,
        }
