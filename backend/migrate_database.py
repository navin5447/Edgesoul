"""
Database Migrations Initialization
Simple script to initialize database tables without Alembic complexity
"""

from pathlib import Path
import sys

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from database.database_service import db_service
from loguru import logger


def init_database():
    """Initialize database tables"""
    print("\n" + "="*60)
    print("EdgeSoul Database Initialization")
    print("="*60 + "\n")
    
    try:
        # Create all tables
        print("📦 Creating database tables...")
        db_service.create_tables()
        print("✅ Database tables created successfully!")
        
        # Show stats
        stats = db_service.get_stats()
        print("\n📊 Database Statistics:")
        print(f"   - Total users: {stats.get('total_users', 0)}")
        print(f"   - Total memories: {stats.get('total_memories', 0)}")
        print(f"   - Total emotional patterns: {stats.get('total_emotional_patterns', 0)}")
        print(f"   - Active conversations: {stats.get('active_conversations', 0)}")
        
        # Show database location
        db_path = Path(__file__).parent / "data" / "edgesoul.db"
        print(f"\n📁 Database location: {db_path}")
        print(f"   Size: {db_path.stat().st_size if db_path.exists() else 0} bytes")
        
        print("\n✅ Database initialized successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)


def reset_database():
    """Reset database (WARNING: Deletes all data!)"""
    print("\n" + "="*60)
    print("⚠️  DATABASE RESET WARNING")
    print("="*60)
    print("\nThis will DELETE ALL DATA in the database!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() != "yes":
        print("❌ Reset cancelled.")
        return
    
    try:
        print("\n🗑️  Dropping all tables...")
        db_service.drop_tables()
        print("✅ Tables dropped")
        
        print("\n📦 Creating fresh tables...")
        db_service.create_tables()
        print("✅ Database reset successfully!")
        
    except Exception as e:
        logger.error(f"Error resetting database: {e}")
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)


def backup_database():
    """Create database backup"""
    try:
        print("\n💾 Creating database backup...")
        backup_path = db_service.backup_database()
        print(f"✅ Backup created: {backup_path}")
    except Exception as e:
        logger.error(f"Error creating backup: {e}")
        print(f"\n❌ Error: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="EdgeSoul Database Management")
    parser.add_argument(
        "command",
        choices=["init", "reset", "backup"],
        help="Command to execute"
    )
    
    args = parser.parse_args()
    
    if args.command == "init":
        init_database()
    elif args.command == "reset":
        reset_database()
    elif args.command == "backup":
        backup_database()
