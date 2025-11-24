from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Model Paths
    EMOTION_MODEL_PATH: str = "../models/emotion/weights"
    KNOWLEDGE_MODEL_PATH: str = "../models/knowledge/weights"
    
    # LLM API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "../database/firebase/config.json"
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Feature Flags
    ENABLE_EMOTION_DETECTION: bool = True
    ENABLE_KNOWLEDGE_REASONING: bool = True  # Enabled with comprehensive fallback knowledge base
    USE_LOCAL_LLM: bool = False  # Disabled GPT-2, using fallback knowledge base
    
    # Ollama Optimization Settings
    OLLAMA_NUM_PREDICT: int = 512      # Token limit (increased from 256 for longer responses)
    OLLAMA_NUM_CTX: int = 4096         # Context window size
    OLLAMA_NUM_BATCH: int = 512        # Batch size for faster processing
    OLLAMA_NUM_GPU: int = 1            # Number of GPUs to use (0 for CPU only)
    OLLAMA_NUM_THREAD: int = 8         # CPU threads for processing
    OLLAMA_TEMPERATURE: float = 0.7    # Response creativity (0.0-1.0)
    OLLAMA_TOP_K: int = 40             # Top-K sampling
    OLLAMA_TOP_P: float = 0.9          # Top-P (nucleus) sampling
    OLLAMA_REPEAT_PENALTY: float = 1.1 # Penalty for repetition
    
    # Performance Settings
    ENABLE_PARALLEL_PROCESSING: bool = True   # Process emotion + context in parallel
    ENABLE_RESPONSE_STREAMING: bool = True    # Stream responses for faster perception
    STREAM_CHUNK_SIZE: int = 5                # Words per chunk when streaming
    STREAM_DELAY_MS: int = 50                 # Delay between chunks (milliseconds)
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def redis_url(self) -> str:
        """Build Redis URL."""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
