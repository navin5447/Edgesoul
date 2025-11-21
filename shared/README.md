# Shared Utilities and Types

This directory contains shared code, types, and utilities used across frontend and backend.

## Structure

```
shared/
├── types/              # TypeScript/Python type definitions
├── constants/          # Shared constants
├── utils/             # Shared utility functions
└── README.md          # This file
```

## Usage

### Frontend (TypeScript)
```typescript
import { EmotionType, MessageRole } from '@shared/types';
import { EMOTION_COLORS } from '@shared/constants';
```

### Backend (Python)
```python
from shared.types import EmotionType, MessageRole
from shared.constants import EMOTION_LABELS
```

## Shared Types

- **EmotionType**: Emotion classifications
- **MessageRole**: Message sender roles
- **SessionStatus**: Session states

## Shared Constants

- **EMOTION_COLORS**: Color mapping for emotions
- **EMOTION_LABELS**: Display labels for emotions
- **API_ENDPOINTS**: Shared API endpoint constants
- **MAX_MESSAGE_LENGTH**: Message constraints

## Synchronization

Keep types and constants synchronized between frontend and backend to ensure consistency.
