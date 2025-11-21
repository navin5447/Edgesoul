# Database Migrations

This directory contains database migration scripts for EdgeSoul.

## Quick Start

### Initialize Database (First Time)

```powershell
# From backend directory
python migrate_database.py init
```

This creates all necessary tables in `data/edgesoul.db`.

### Backup Database

```powershell
python migrate_database.py backup
```

Creates a timestamped backup in `backups/` directory.

### Reset Database (⚠️ Deletes All Data)

```powershell
python migrate_database.py reset
```

## Database Schema

### Tables

1. **user_profiles** - User preferences and personality settings
   - Empathy, humor, formality, verbosity levels
   - Voice preferences
   - Communication patterns
   - Usage statistics

2. **memories** - User memories (preferences, facts, patterns)
   - Memory type (preference, fact, pattern, conversation, emotional)
   - Content and context
   - Confidence and importance scores
   - Access tracking

3. **emotional_patterns** - Emotional tracking over time
   - Emotion frequency and intensity
   - Triggers and time patterns
   - Trend analysis

4. **conversation_contexts** - Recent conversation history
   - Message history
   - Topics discussed
   - Emotion trajectory

## Database Location

- **Development**: `backend/data/edgesoul.db`
- **Backups**: `backend/backups/edgesoul_backup_TIMESTAMP.db`

## Features

✅ Persistent storage across restarts
✅ Automatic backups
✅ Foreign key constraints
✅ Indexes for fast queries
✅ WAL mode for better concurrency
✅ Connection pooling

## Testing Persistence

```powershell
python test_database_persistence.py
```

This verifies that:
- User profiles persist
- Memories persist
- Emotional patterns persist
- Conversation contexts persist

## Migration Strategy

We use a simple migration approach:

1. **Initial Setup**: `migrate_database.py init`
2. **Schema Changes**: Manual SQL or new migration scripts
3. **Backups**: Always backup before changes

For production, consider:
- Alembic for complex migrations
- Automated backup schedule
- Database replication
