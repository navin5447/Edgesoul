"""
Vector Store Service
Local vector database using ChromaDB for semantic search and memory
Enables offline knowledge retrieval and contextual responses
"""

from typing import List, Dict, Optional, Any, Tuple
from loguru import logger
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from pathlib import Path
import json
from datetime import datetime

# Try to import sentence transformers, fallback if not available
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logger.warning("sentence-transformers not installed. Using default embeddings.")
    SENTENCE_TRANSFORMERS_AVAILABLE = False


class VectorStore:
    """
    Local vector database for semantic search and memory storage.
    Uses ChromaDB for efficient similarity search.
    """
    
    def __init__(
        self,
        persist_directory: str = "./data/chroma",
        collection_name: str = "edgesoul_memory",
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize vector store.
        
        Args:
            persist_directory: Directory to persist the database
            collection_name: Name of the collection
            embedding_model: Sentence transformer model name
        """
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        self.collection_name = collection_name
        self.embedding_model_name = embedding_model
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Setup embedding function
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name=embedding_model
            )
            logger.info(f"Using SentenceTransformer: {embedding_model}")
        else:
            # Use default ChromaDB embeddings
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
            logger.info("Using default ChromaDB embeddings")
        
        # Get or create collection
        try:
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                embedding_function=self.embedding_function,
                metadata={"description": "EdgeSoul conversation memory and knowledge"}
            )
            logger.info(f"✅ Vector store initialized: {collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    # ==================== Memory Storage ====================
    
    def add_memory(
        self,
        text: str,
        memory_type: str,
        user_id: str = "default",
        metadata: Optional[Dict[str, Any]] = None,
        memory_id: Optional[str] = None
    ) -> str:
        """
        Add a memory to the vector store.
        
        Args:
            text: The text content to store
            memory_type: Type of memory (conversation, fact, preference, etc.)
            user_id: User identifier
            metadata: Additional metadata
            memory_id: Optional custom ID
            
        Returns:
            The ID of the stored memory
        """
        # Generate ID if not provided
        if memory_id is None:
            memory_id = f"{user_id}_{memory_type}_{datetime.now().timestamp()}"
        
        # Prepare metadata
        meta = {
            "user_id": user_id,
            "type": memory_type,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {})
        }
        
        try:
            self.collection.add(
                documents=[text],
                metadatas=[meta],
                ids=[memory_id]
            )
            logger.debug(f"Added memory: {memory_id}")
            return memory_id
        except Exception as e:
            logger.error(f"Failed to add memory: {e}")
            raise
    
    def add_conversation(
        self,
        user_message: str,
        assistant_response: str,
        user_id: str = "default",
        emotion: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Store a conversation exchange.
        
        Args:
            user_message: The user's message
            assistant_response: The assistant's response
            user_id: User identifier
            emotion: Detected emotion (if any)
            metadata: Additional metadata
            
        Returns:
            The ID of the stored conversation
        """
        # Combine messages for better context
        combined_text = f"User: {user_message}\nAssistant: {assistant_response}"
        
        meta = {
            "user_message": user_message,
            "assistant_response": assistant_response,
            "emotion": emotion,
            **(metadata or {})
        }
        
        return self.add_memory(
            text=combined_text,
            memory_type="conversation",
            user_id=user_id,
            metadata=meta
        )
    
    # ==================== Semantic Search ====================
    
    def search(
        self,
        query: str,
        user_id: Optional[str] = None,
        memory_type: Optional[str] = None,
        limit: int = 5,
        score_threshold: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Search for similar memories using semantic similarity.
        
        Args:
            query: The search query
            user_id: Filter by user ID
            memory_type: Filter by memory type
            limit: Maximum number of results
            score_threshold: Minimum similarity score (0-1)
            
        Returns:
            List of matching memories with metadata and scores
        """
        try:
            # Build where filter
            where_filter = {}
            if user_id:
                where_filter["user_id"] = user_id
            if memory_type:
                where_filter["type"] = memory_type
            
            # Perform search
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where=where_filter if where_filter else None,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            memories = []
            if results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    # Convert distance to similarity score (0-1)
                    distance = results['distances'][0][i]
                    similarity = 1 / (1 + distance)  # Convert distance to similarity
                    
                    if similarity >= score_threshold:
                        memories.append({
                            "text": results['documents'][0][i],
                            "metadata": results['metadatas'][0][i],
                            "score": similarity,
                            "id": results['ids'][0][i] if 'ids' in results else None
                        })
            
            logger.debug(f"Search found {len(memories)} results for: {query[:50]}...")
            return memories
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def search_conversations(
        self,
        query: str,
        user_id: str = "default",
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant past conversations.
        
        Args:
            query: The search query
            user_id: User identifier
            limit: Maximum number of results
            
        Returns:
            List of relevant conversations
        """
        return self.search(
            query=query,
            user_id=user_id,
            memory_type="conversation",
            limit=limit
        )
    
    # ==================== Knowledge Base ====================
    
    def add_knowledge(
        self,
        text: str,
        topic: str,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Add knowledge to the database.
        
        Args:
            text: The knowledge content
            topic: Topic/category
            source: Source of knowledge (URL, book, etc.)
            metadata: Additional metadata
            
        Returns:
            The ID of the stored knowledge
        """
        meta = {
            "topic": topic,
            "source": source,
            **(metadata or {})
        }
        
        return self.add_memory(
            text=text,
            memory_type="knowledge",
            user_id="system",
            metadata=meta
        )
    
    def search_knowledge(
        self,
        query: str,
        topic: Optional[str] = None,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Search the knowledge base.
        
        Args:
            query: The search query
            topic: Filter by topic
            limit: Maximum number of results
            
        Returns:
            List of relevant knowledge
        """
        where_filter = {"type": "knowledge"}
        if topic:
            where_filter["topic"] = topic
        
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
            
            knowledge = []
            if results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    knowledge.append({
                        "text": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i],
                        "score": 1 / (1 + results['distances'][0][i])
                    })
            
            return knowledge
            
        except Exception as e:
            logger.error(f"Knowledge search failed: {e}")
            return []
    
    # ==================== User Preferences ====================
    
    def store_preference(
        self,
        user_id: str,
        preference_type: str,
        value: str,
        context: Optional[str] = None
    ) -> str:
        """
        Store a user preference.
        
        Args:
            user_id: User identifier
            preference_type: Type of preference (communication_style, topics, etc.)
            value: The preference value
            context: Context in which this was learned
            
        Returns:
            The ID of the stored preference
        """
        text = f"{preference_type}: {value}"
        if context:
            text += f"\nContext: {context}"
        
        return self.add_memory(
            text=text,
            memory_type="preference",
            user_id=user_id,
            metadata={
                "preference_type": preference_type,
                "value": value,
                "context": context
            }
        )
    
    def get_user_preferences(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all preferences for a user."""
        try:
            results = self.collection.get(
                where={
                    "user_id": user_id,
                    "type": "preference"
                },
                include=["documents", "metadatas"]
            )
            
            preferences = []
            if results['documents']:
                for i in range(len(results['documents'])):
                    preferences.append({
                        "text": results['documents'][i],
                        "metadata": results['metadatas'][i]
                    })
            
            return preferences
            
        except Exception as e:
            logger.error(f"Failed to get preferences: {e}")
            return []
    
    # ==================== Utilities ====================
    
    def delete_memory(self, memory_id: str) -> bool:
        """Delete a specific memory."""
        try:
            self.collection.delete(ids=[memory_id])
            logger.debug(f"Deleted memory: {memory_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete memory: {e}")
            return False
    
    def delete_user_data(self, user_id: str) -> int:
        """Delete all data for a user."""
        try:
            # Get count before deletion
            count = self.collection.count()
            
            self.collection.delete(
                where={"user_id": user_id}
            )
            
            new_count = self.collection.count()
            deleted = count - new_count
            
            logger.info(f"Deleted {deleted} memories for user: {user_id}")
            return deleted
            
        except Exception as e:
            logger.error(f"Failed to delete user data: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        try:
            count = self.collection.count()
            
            # Get type distribution
            results = self.collection.get(include=["metadatas"])
            type_counts = {}
            
            if results['metadatas']:
                for meta in results['metadatas']:
                    memory_type = meta.get('type', 'unknown')
                    type_counts[memory_type] = type_counts.get(memory_type, 0) + 1
            
            return {
                "total_memories": count,
                "by_type": type_counts,
                "collection_name": self.collection_name,
                "persist_directory": str(self.persist_directory)
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {}
    
    def reset(self) -> bool:
        """Reset the entire database. Use with caution!"""
        try:
            self.client.delete_collection(self.collection_name)
            self.collection = self.client.create_collection(
                name=self.collection_name,
                embedding_function=self.embedding_function
            )
            logger.warning("⚠️  Vector store reset complete")
            return True
        except Exception as e:
            logger.error(f"Failed to reset: {e}")
            return False


# Global instance
vector_store = VectorStore()
