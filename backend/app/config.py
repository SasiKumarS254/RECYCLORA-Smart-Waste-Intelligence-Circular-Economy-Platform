import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RECYCLORA"
    ENV: str = os.getenv("ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "recyclora_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for easy testing
    
    # SQLite fallback out of the box so local dev works without installing Postgres,
    # Postgres URL can be passed via environment variable (e.g. Docker Compose)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./recyclora.db"
    )
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
