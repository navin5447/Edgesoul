"""
Database Service for EdgeSoul
Handles SQLite database operations with SQLAlchemy
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from pathlib import Path
from loguru import logger
import os

from database.models import Base


class DatabaseService:
    """
    Manages SQLite database connection and sessions.
    Provides connection pooling and session management.
    """
    
    def __init__(self, database_url: str = None):
        """
        Initialize database service.
        
        Args:
            database_url: SQLite database URL. Defaults to ./data/edgesoul.db
        """
        if database_url is None:
            # Create data directory if it doesn't exist
            data_dir = Path(__file__).parent.parent / "data"
            data_dir.mkdir(exist_ok=True)
            database_path = data_dir / "edgesoul.db"
            database_url = f"sqlite:///{database_path}"
        
        logger.info(f"Initializing database: {database_url}")
        
        # Create engine with connection pooling
        self.engine = create_engine(
            database_url,
            connect_args={
                "check_same_thread": False,  # Allow multi-threading
                "timeout": 30  # 30 second timeout for locks
            },
            poolclass=StaticPool,  # Use static pool for SQLite
            echo=False  # Set to True for SQL query logging
        )
        
        # Enable foreign key constraints for SQLite
        @event.listens_for(self.engine, "connect")
        def set_sqlite_pragma(dbapi_conn, connection_record):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging for better concurrency
            cursor.close()
        
        # Create session factory
        self.SessionLocal = scoped_session(
            sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        )
        
        # Create all tables
        self.create_tables()
        
        logger.info("Database initialized successfully")
    
    def create_tables(self):
        """Create all database tables"""
        try:
            Base.metadata.create_all(bind=self.engine)
            logger.info("Database tables created/verified")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            raise
    
    def drop_tables(self):
        """Drop all database tables (use with caution!)"""
        try:
            Base.metadata.drop_all(bind=self.engine)
            logger.warning("All database tables dropped")
        except Exception as e:
            logger.error(f"Error dropping tables: {e}")
            raise
    
    @contextmanager
    def get_session(self):
        """
        Context manager for database sessions.
        Automatically commits on success, rolls back on error.
        
        Usage:
            with db_service.get_session() as session:
                session.query(...)
        """
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()
    
    def get_db(self):
        """
        Dependency for FastAPI endpoints.
        
        Usage:
            @app.get("/endpoint")
            def endpoint(db: Session = Depends(db_service.get_db)):
                ...
        """
        session = self.SessionLocal()
        try:
            yield session
        finally:
            session.close()
    
    def close(self):
        """Close all database connections"""
        self.SessionLocal.remove()
        self.engine.dispose()
        logger.info("Database connections closed")
    
    def backup_database(self, backup_path: str = None):
        """
        Create a backup of the database.
        
        Args:
            backup_path: Path for backup file. Defaults to ./backups/edgesoul_backup_TIMESTAMP.db
        """
        try:
            if backup_path is None:
                from datetime import datetime
                backup_dir = Path(__file__).parent.parent / "backups"
                backup_dir.mkdir(exist_ok=True)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_path = backup_dir / f"edgesoul_backup_{timestamp}.db"
            
            # Get source database path
            source_path = self.engine.url.database
            
            # SQLite backup using Python's shutil
            import shutil
            shutil.copy2(source_path, backup_path)
            
            logger.info(f"Database backed up to: {backup_path}")
            return str(backup_path)
        except Exception as e:
            logger.error(f"Error backing up database: {e}")
            raise
    
    def get_stats(self):
        """Get database statistics"""
        try:
            with self.get_session() as session:
                from database.models import DBUserProfile, DBMemory, DBEmotionalPattern, DBConversationContext
                
                stats = {
                    "total_users": session.query(DBUserProfile).count(),
                    "total_memories": session.query(DBMemory).count(),
                    "total_emotional_patterns": session.query(DBEmotionalPattern).count(),
                    "active_conversations": session.query(DBConversationContext).count(),
                }
                
                return stats
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {}


# Global instance
db_service = DatabaseService()
