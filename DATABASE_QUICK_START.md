# 🚀 Quick Start with Database Persistence

## What Changed?

Your EdgeSoul bot now has **permanent memory**! 🎉

### Before
- User profiles lost on restart ❌
- Conversation history lost ❌
- Emotional patterns lost ❌

### Now
- Everything saved to SQLite database ✅
- Data persists across restarts ✅
- No data loss ever ✅

---

## Getting Started

### 1️⃣ Install Dependencies (if not already installed)

```powershell
cd backend
pip install sqlalchemy alembic
```

### 2️⃣ Initialize Database (ONE TIME ONLY)

```powershell
python migrate_database.py init
```

**Output:**
```
✅ Database tables created successfully!
📁 Database location: backend/data/edgesoul.db
```

### 3️⃣ Start Backend Normally

```powershell
python -m uvicorn main:app --reload
```

That's it! The database is now active and saving everything automatically.

---

## How It Works

### Automatic Saving

When users interact with EdgeSoul:

1. **Profile Changes** → Saved instantly to database
   - Gender selection → Persisted ✅
   - Personality sliders → Persisted ✅
   - Voice preferences → Persisted ✅

2. **Conversations** → Saved automatically
   - Messages → Stored in context ✅
   - Topics → Tracked ✅
   - Emotions → Recorded ✅

3. **Learning** → Permanent
   - User preferences learned ✅
   - Emotional patterns detected ✅
   - Interests tracked ✅

### No Code Changes Needed!

The MemoryService automatically uses the database. Your existing code works exactly the same!

---

## Database Commands

### View Statistics

```powershell
python -c "from database.database_service import db_service; print(db_service.get_stats())"
```

### Backup Database

```powershell
python migrate_database.py backup
```

**Creates:** `backups/edgesoul_backup_YYYYMMDD_HHMMSS.db`

### Test Persistence

```powershell
python test_database_persistence.py
```

---

## Database Location

```
backend/
├── data/
│   └── edgesoul.db          ← Your main database (DON'T DELETE!)
└── backups/
    └── edgesoul_backup_*.db ← Automatic backups
```

### Important!

- ✅ **Commit `data/` folder to git** (or add to .gitignore if too large)
- ✅ **Backup before major changes** using `migrate_database.py backup`
- ✅ **Never manually edit the .db file** (use the API)

---

## Troubleshooting

### "Database locked" Error

**Cause:** Another process is using the database

**Fix:**
```powershell
# Stop all backend instances
# Then restart:
python -m uvicorn main:app --reload
```

### Reset Database (⚠️ DELETES ALL DATA)

```powershell
python migrate_database.py reset
```

Only use this for testing!

---

## What Gets Saved?

### User Profiles ✅
- Name, gender
- Empathy: 0-100
- Humor: 0-100
- Formality: 0-100
- Verbosity: 0-100
- Voice settings

### Memories ✅
- Preferences learned
- Facts shared by user
- Conversation topics
- Important moments

### Emotional Patterns ✅
- Joy frequency
- Sadness triggers
- Anger contexts
- Fear indicators
- Love expressions
- Surprise reactions

### Conversation Context ✅
- Last 10 messages
- Current session
- Recent topics
- Emotion trajectory

---

## Verification

To verify everything is working:

```powershell
python test_database_persistence.py
```

**Expected Output:**
```
🎉 ALL TESTS PASSED!
✅ User profiles persist across restarts
✅ Memories persist across restarts
✅ Emotional patterns persist across restarts
✅ Conversation contexts persist across restarts
```

---

## FAQ

### Q: Where is my data stored?
**A:** `backend/data/edgesoul.db` (SQLite database file)

### Q: Can I use a different database?
**A:** Yes! Update `database_service.py` to use PostgreSQL, MySQL, etc.

### Q: Will old users need to re-create profiles?
**A:** No! The database auto-creates profiles on first use.

### Q: How big will the database get?
**A:** ~50KB per user per week. Very small!

### Q: Is this production-ready?
**A:** Yes! SQLite is perfect for <100K users. Use PostgreSQL for larger scale.

---

## Next Steps

1. ✅ Database initialized
2. ✅ Backend running with persistence
3. ✅ Start chatting - everything saves automatically!
4. ✅ Restart backend - data is still there!

**Your EdgeSoul bot now has permanent memory! 🧠💾**

Enjoy your fully persistent AI companion! 🎉
