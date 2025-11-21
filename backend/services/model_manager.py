from loguru import logger
from services.emotion_service import emotion_service
from services.knowledge_service import knowledge_service
from core.config import settings


class ModelManager:
    """Manager for loading and unloading all AI models."""
    
    def __init__(self):
        self.models_loaded = False
    
    async def load_models(self):
        """Load all AI models."""
        try:
            logger.info("Loading all models...")
            
            # Load emotion detection model
            await emotion_service.load_model()
            
            # Load knowledge reasoning model if enabled
            if settings.ENABLE_KNOWLEDGE_REASONING:
                try:
                    logger.info("Loading knowledge reasoning model...")
                    await knowledge_service.load_model()
                except Exception as e:
                    logger.warning(f"Knowledge model loading failed, will use fallback: {str(e)}")
            else:
                logger.info("Knowledge reasoning disabled in settings")
            
            self.models_loaded = True
            logger.info("All models loaded successfully")
        
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            self.models_loaded = False
            raise
    
    async def unload_models(self):
        """Unload all models."""
        try:
            logger.info("Unloading all models...")
            
            await emotion_service.unload_model()
            await knowledge_service.unload_model()
            
            self.models_loaded = False
            logger.info("All models unloaded")
        
        except Exception as e:
            logger.error(f"Error unloading models: {str(e)}")
    
    def are_models_loaded(self) -> bool:
        """Check if models are loaded."""
        return self.models_loaded


# Global instance
model_manager = ModelManager()
