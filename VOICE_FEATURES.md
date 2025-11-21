# 🎤 Voice Features - EdgeSoul

## Overview
Full voice conversation system with speech-to-text (voice input) and text-to-speech (bot speaks back).

## Features Implemented

### ✅ Voice Input (Speech-to-Text)
- Click microphone button in chat to start speaking
- Real-time transcription shows what you're saying
- Auto-submits when you finish speaking
- Visual indicators (red pulsing mic, recording dot)
- Error handling for permissions and browser support

### ✅ Voice Output (Text-to-Speech)
- Bot reads responses aloud automatically when voice enabled
- Gender-adaptive voices:
  - **Male**: Deeper pitch (0.8), normal speed
  - **Female**: Higher pitch (1.2), slightly faster
  - **Other**: Medium pitch, normal speed
- Toggle voice on/off with speaker button
- Speaking indicator shows when bot is talking

### ✅ Gender-Adaptive Personalities
Voice characteristics automatically match user's gender preference:
- Male users get deeper, solution-focused voice
- Female users get warmer, empathetic voice
- Other users get balanced, inclusive voice

## How to Use

### For Users:

1. **Enable Voice**:
   - Click the speaker icon (🔊) in the chat header
   - Icon turns purple when voice is enabled

2. **Speak to Bot**:
   - Click the microphone button (🎤) in the input area
   - Speak your message clearly
   - Bot transcribes and sends your message
   - Mic button pulses red while recording

3. **Bot Speaks Back**:
   - When voice enabled, bot reads responses aloud
   - "🔊 Speaking..." indicator shows when bot is talking
   - Voice adapts to your gender (male/female/other)

4. **Stop Voice**:
   - Click speaker icon again to disable
   - Or click mic while recording to stop listening

### Browser Support:
- **Speech Recognition**: Chrome, Edge (requires internet for accuracy)
- **Text-to-Speech**: All modern browsers (works offline)
- Features gracefully degrade if not supported

## Technical Details

### Voice Settings (Backend)
User profile now includes:
```python
voice_enabled: bool = True
voice_speed: float = 1.0  # 0.5 to 2.0
voice_pitch: float = 1.0  # 0.0 to 2.0
auto_speak_responses: bool = False
```

### Gender-Adaptive Voice Configuration
```typescript
// Male voice
pitch: 0.8 (deeper)
rate: 1.0 (normal)

// Female voice  
pitch: 1.2 (higher)
rate: 1.1 (slightly faster)

// Other voice
pitch: 1.0 (medium)
rate: 1.0 (normal)
```

## Error Handling

### Microphone Permission Denied:
- Shows error message: "Microphone permission denied"
- User must enable in browser settings

### No Speech Detected:
- Shows: "No speech detected. Please try again."
- Auto-clears after 3 seconds

### Browser Not Supported:
- Microphone button hidden if speech recognition unavailable
- Voice toggle hidden if text-to-speech unavailable
- Chat continues to work normally without voice

## Files Modified/Created

### New Files:
1. `frontend/lib/voice.ts` - Voice utilities (Speech Recognition & TTS managers)
2. `frontend/components/chat/VoiceButton.tsx` - Microphone button component

### Modified Files:
1. `frontend/components/chat/ChatInterface.tsx` - Integrated voice features
2. `backend/models/memory.py` - Added voice preferences to UserProfile

## Testing Checklist

- [x] ✅ Voice input button appears in chat
- [x] ✅ Click mic → starts recording (pulses red)
- [x] ✅ Speak → transcribes to input field
- [x] ✅ Voice toggle in header works
- [x] ✅ Bot speaks responses when voice enabled
- [x] ✅ Gender-adaptive voices (male/female/other)
- [x] ✅ Error handling (no mic, permission denied)
- [x] ✅ Chat still works without voice features
- [x] ✅ No errors in console
- [x] ✅ Visual indicators (recording dot, speaking status)

## Known Limitations

1. **Speech Recognition Internet Dependency**: 
   - Chrome's speech recognition needs internet for best accuracy
   - Works offline but less accurate

2. **Voice Selection**:
   - Voice availability varies by OS and browser
   - Fallback to default English voice if gender-specific not found

3. **Auto-Submit**:
   - Voice input auto-submits on sentence end (. ? !)
   - Can also manually edit and click Send

## Future Enhancements

- [ ] Voice settings in profile page (speed, pitch sliders)
- [ ] Wake word detection ("Hey EdgeSoul")
- [ ] Multi-language support
- [ ] Custom voice selection
- [ ] Voice activity detection (auto-stop when silence)

## Safety Notes

⚠️ **No Breaking Changes**:
- All voice features are additive
- Chat works perfectly without voice
- Graceful degradation if browser doesn't support
- No changes to existing chat API or message flow
- Gender preference already saved, just used for voice selection

✅ **Production Ready**:
- Error boundaries prevent crashes
- User-friendly error messages
- Visual feedback for all states
- Works across all supported browsers
