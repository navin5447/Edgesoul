"""Test frustration emotion detection fix"""
import asyncio
from services.emotion_service import emotion_service

async def test_frustration():
    print("\n" + "="*80)
    print("TESTING FRUSTRATION EMOTION DETECTION FIX")
    print("="*80)
    
    test_cases = [
        "I'm so frustrated, I've been trying to fix this bug for 3 hours",
        "This is so annoying, nothing works",
        "I'm really angry about this situation",
        "I hate this stupid error",
        "This code is broken and I can't figure out why",
        "I'm upset and stressed out",
        "This is terrible and awful"
    ]
    
    print("\n🧪 Testing frustration/anger detection:")
    print("-" * 80)
    
    for text in test_cases:
        result = await emotion_service.detect_emotion(text)
        emotion = result['primary']
        confidence = result['confidence']
        
        # Should detect anger, NOT joy!
        status = "✅ PASS" if emotion == "anger" else f"❌ FAIL (got {emotion})"
        
        print(f"\nText: {text}")
        print(f"Emotion: {emotion} ({confidence:.0%}) {status}")
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(test_frustration())
