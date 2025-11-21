"""
Test script to verify chatbot intelligence improvements.
Run this to test emotion detection, intent recognition, and response quality.
"""

import asyncio
import sys
from loguru import logger

from services.emotion_service import emotion_service
from services.intelligent_reply_engine import intelligent_reply_engine
from services.chat_service import ChatService

# Configure logger
logger.remove()
logger.add(sys.stdout, format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>")


async def test_emotion_detection():
    """Test emotion detection accuracy."""
    print("\n" + "="*60)
    print("🎭 TESTING EMOTION DETECTION")
    print("="*60)
    
    test_cases = [
        # Test case format: (message, expected_emotion, description)
        ("hi", "neutral", "Simple greeting should be neutral"),
        ("I'm scolded but I didn't do anything", "sadness", "Victim context should be sadness, not anger"),
        ("make me feel confident", "joy", "Positive request should be joy/neutral"),
        ("help me calm down I'm stressed", "fear", "Anxiety/stress should be fear"),
        ("I'm happy but also worried", "joy", "Mixed emotions - primary should be joy"),
        ("Nobody understands me", "sadness", "Depression indicators should be sadness"),
        ("tell me a joke", "joy", "Humor request should be joy/neutral"),
        ("I'm scared of failing", "fear", "Fear expression should be fear"),
        ("explain quantum physics", "neutral", "Factual question should be neutral"),
    ]
    
    await emotion_service.load_model()
    
    passed = 0
    failed = 0
    
    for message, expected, description in test_cases:
        result = await emotion_service.detect_emotion(message)
        detected = result['primary']
        confidence = result['confidence']
        
        # Check if detected emotion matches expected
        status = "✅ PASS" if detected == expected else "❌ FAIL"
        if detected == expected:
            passed += 1
        else:
            failed += 1
        
        print(f"\n{status} | {description}")
        print(f"   Message: \"{message}\"")
        print(f"   Expected: {expected} | Detected: {detected} (confidence: {confidence:.2f})")
    
    print(f"\n{'='*60}")
    print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print(f"{'='*60}\n")


async def test_intent_detection():
    """Test intent detection and response quality."""
    print("\n" + "="*60)
    print("🎯 TESTING INTENT DETECTION & RESPONSE QUALITY")
    print("="*60)
    
    test_cases = [
        ("make me cool", "Should provide empowering, confidence-boosting response"),
        ("help me relax", "Should provide calming techniques/breathing exercises"),
        ("tell me a joke", "Should route to knowledge engine for humor"),
        ("I'm depressed", "Should provide emotional support"),
        ("explain machine learning", "Should route to knowledge engine"),
        ("", "Should handle empty input gracefully"),
    ]
    
    for message, expected_behavior in test_cases:
        print(f"\n{'─'*60}")
        print(f"📝 Test: \"{message}\"")
        print(f"Expected: {expected_behavior}")
        print(f"{'─'*60}")
        
        try:
            if message:  # Skip empty message for intelligent_reply_engine
                response = await intelligent_reply_engine.generate_reply(message, user_id="test_user")
                print(f"Strategy: {response['strategy']}")
                print(f"Emotion: {response['emotion']['primary']} (confidence: {response['emotion']['confidence']:.2f})")
                print(f"Response: {response['message'][:200]}...")
                print(f"✅ Response generated successfully")
            else:
                # Test empty input handling
                chat_service = ChatService()
                response = await chat_service.process_message("")
                print(f"Response: {response.content}")
                print(f"✅ Empty input handled gracefully")
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")


async def test_error_handling():
    """Test error handling and edge cases."""
    print("\n" + "="*60)
    print("🛡️ TESTING ERROR HANDLING")
    print("="*60)
    
    chat_service = ChatService()
    
    test_cases = [
        (None, "None input"),
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        ("a" * 10000, "Very long message (should truncate)"),
        (123, "Invalid type (number)"),
    ]
    
    for message, description in test_cases:
        print(f"\n{'─'*60}")
        print(f"Test: {description}")
        print(f"{'─'*60}")
        
        try:
            response = await chat_service.process_message(message)
            print(f"✅ Handled gracefully: {response.content[:100]}...")
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")


async def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("🧠 EDGESOUL CHATBOT INTELLIGENCE TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Emotion Detection
        await test_emotion_detection()
        
        # Test 2: Intent Detection & Response Quality
        await test_intent_detection()
        
        # Test 3: Error Handling
        await test_error_handling()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED!")
        print("="*60)
        print("\n💡 Review the results above to verify chatbot intelligence.")
        print("   Green checkmarks (✅) indicate successful tests.")
        print("   Red crosses (❌) indicate areas that may need attention.\n")
        
    except Exception as e:
        logger.error(f"Test suite failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
