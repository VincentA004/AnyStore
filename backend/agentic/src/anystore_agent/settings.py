from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

    google_cloud_project: str = ''
    google_cloud_location: str = 'us-central1'
    google_genai_use_vertexai: bool = True
    anystore_agent_model: str = 'gemini-2.5-pro'
    anystore_storage_bucket: str = ''
    anystore_firestore_database: str = '(default)'

    @property
    def is_configured(self) -> bool:
        return bool(self.google_cloud_project)
