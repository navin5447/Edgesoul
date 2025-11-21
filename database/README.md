# Database Configuration for EdgeSoul v2

This directory contains database configuration and schemas for EdgeSoul v2.

## Structure

```
database/
├── firebase/            # Firebase configuration
│   ├── config.json     # Firebase credentials (add to .gitignore)
│   ├── config.example.json  # Example configuration
│   ├── rules.json      # Firestore security rules
│   └── indexes.json    # Firestore indexes
├── schemas/            # Data schemas
│   ├── user.json       # User schema
│   ├── session.json    # Session schema
│   └── message.json    # Message schema
├── migrations/         # Database migrations
└── README.md          # This file
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Authentication (optional)

### 2. Get Configuration

1. Go to Project Settings > Service Accounts
2. Generate new private key
3. Save as `firebase/config.json`
4. Update `firebase/config.example.json` with your web app config

### 3. Configure Security Rules

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### 4. Create Indexes

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Collections

### Users
- **Collection**: `users`
- **Document ID**: Auto-generated or custom
- **Schema**: See `schemas/user.json`

### Sessions
- **Collection**: `sessions`
- **Document ID**: Session UUID
- **Schema**: See `schemas/session.json`

### Messages
- **Collection**: `sessions/{sessionId}/messages`
- **Document ID**: Auto-generated
- **Schema**: See `schemas/message.json`

## Alternative: Redis Only

For simpler deployments, you can use Redis for session management without Firebase:

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Configure in backend/.env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Data Models

### User
```json
{
  "id": "user_123",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "last_active": "2024-01-01T00:00:00Z",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

### Session
```json
{
  "id": "session_abc123",
  "user_id": "user_123",
  "created_at": "2024-01-01T00:00:00Z",
  "last_activity": "2024-01-01T00:00:00Z",
  "message_count": 10,
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  }
}
```

### Message
```json
{
  "id": "msg_xyz789",
  "session_id": "session_abc123",
  "role": "user",
  "content": "Hello!",
  "timestamp": "2024-01-01T00:00:00Z",
  "emotion": {
    "primary": "joy",
    "confidence": 0.89,
    "all": {
      "joy": 0.89,
      "neutral": 0.05,
      "surprise": 0.03
    }
  }
}
```

## Usage in Backend

```python
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase
cred = credentials.Certificate("../database/firebase/config.json")
initialize_app(cred)

db = firestore.client()

# Create session
session_ref = db.collection('sessions').document(session_id)
session_ref.set({
    'user_id': user_id,
    'created_at': firestore.SERVER_TIMESTAMP,
    'last_activity': firestore.SERVER_TIMESTAMP,
})

# Add message
message_ref = session_ref.collection('messages').document()
message_ref.set({
    'role': 'user',
    'content': message_text,
    'timestamp': firestore.SERVER_TIMESTAMP,
    'emotion': emotion_data,
})
```

## Privacy & Security

- Never commit `config.json` to version control
- Use Firebase security rules to protect data
- Implement proper authentication
- Consider GDPR/privacy regulations
- Regularly backup data
- Use encryption for sensitive data

## Backup & Export

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups

# Import Firestore data
gcloud firestore import gs://your-bucket/backups/export-file
```
