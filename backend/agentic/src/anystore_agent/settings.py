from dataclasses import dataclass
import os


@dataclass(frozen=True)
class AgentSettings:
    foundry_endpoint: str
    foundry_project: str
    foundry_agent_id: str

    @classmethod
    def from_env(cls) -> "AgentSettings":
        return cls(
            foundry_endpoint=os.environ.get("AZURE_AI_FOUNDRY_ENDPOINT", ""),
            foundry_project=os.environ.get("AZURE_AI_FOUNDRY_PROJECT", ""),
            foundry_agent_id=os.environ.get("AZURE_AI_FOUNDRY_AGENT_ID", ""),
        )
