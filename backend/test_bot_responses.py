"""
Test Bot Responses - Verify all conversation types work correctly
"""
import asyncio
import sys
from loguru import logger

# Add backend to path
sys.path.insert(0, '.')

from services.intelligent_reply_engine import intelligent_reply_engine
from services.emotion_service import emotion_service

# Test cases covering different scenarios
TEST_CASES = [
    # Casual greetings
    {"message": "hi", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    {"message": "how are you", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    {"message": "what's up", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    
    # Casual states (should be neutral, not anger)
    {"message": "iam very hungry", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    {"message": "iam tired today", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    {"message": "iam bored", "expected_type": "casual_chat", "expected_emotion": "neutral"},
    
    # Emotional messages (should use emotional support)
    {"message": "iam very sad today", "expected_type": "emotional_support", "expected_emotion": "sadness"},
    {"message": "iam so angry right now", "expected_type": "emotional_support", "expected_emotion": "anger"},
    {"message": "iam scared", "expected_type": "emotional_support", "expected_emotion": "fear"},
    {"message": "iam so happy today", "expected_type": "casual_chat", "expected_emotion": "joy"},
    
    # Knowledge questions
    {"message": "what is python", "expected_type": "knowledge_focused", "expected_emotion": "neutral"},
    {"message": "explain machine learning", "expected_type": "knowledge_focused", "expected_emotion": "neutral"},
    {"message": "how do computers work", "expected_type": "knowledge_focused", "expected_emotion": "neutral"},
    
    # Practical questions
    {"message": "i applied to paypal why should i choose them", "expected_type": "knowledge_focused", "expected_emotion": "neutral"},
    {"message": "what should i include on my resume", "expected_type": "knowledge_focused", "expected_emotion": "neutral"},
]

async def test_bot_responses():
    """Test all message types"""
    
    logger.info("="*80)
    logger.info("TESTING BOT RESPONSES")
    logger.info("="*80)
    
    passed = 0
    failed = 0
    issues = []
    
    for i, test in enumerate(TEST_CASES, 1):
        message = test["message"]
        expected_type = test["expected_type"]
        expected_emotion = test["expected_emotion"]
        
        logger.info(f"\n{'='*80}")
        logger.info(f"TEST {i}/{len(TEST_CASES)}: {message}")
        logger.info(f"{'='*80}")
        
        try:
            # Generate response
            result = await intelligent_reply_engine.generate_reply(
                message=message,
                user_id="test_user"
            )
            
            response_text = result['text']
            response_type = result['type']
            emotion_data = result['emotion']
            detected_emotion = emotion_data['primary']
            
            # Check response quality
            checks = {
                "✓ Response generated": bool(response_text),
                f"✓ Response type: {response_type}": response_type == expected_type,
                f"✓ Emotion detected: {detected_emotion}": detected_emotion == expected_emotion,
                "✓ No dialogue format (User:/Assistant:)": "User:" not in response_text and "Assistant:" not in response_text,
                "✓ Response not too long": len(response_text.split()) < 150,
                "✓ Not showing system prompts": "You are EdgeSoul" not in response_text,
            }
            
            # Log results
            all_passed = True
            for check, passed_check in checks.items():
                status = "✅" if passed_check else "❌"
                logger.info(f"{status} {check}")
                if not passed_check:
                    all_passed = False
            
            logger.info(f"\n📝 Response ({len(response_text.split())} words):")
            logger.info(f"   {response_text[:200]}{'...' if len(response_text) > 200 else ''}")
            
            if all_passed:
                passed += 1
                logger.success(f"✅ TEST {i} PASSED")
            else:
                failed += 1
                logger.error(f"❌ TEST {i} FAILED")
                issues.append({
                    "test": i,
                    "message": message,
                    "expected": f"{expected_type}/{expected_emotion}",
                    "got": f"{response_type}/{detected_emotion}",
                    "response": response_text[:100]
                })
                
        except Exception as e:
            failed += 1
            logger.error(f"❌ TEST {i} ERROR: {e}")
            issues.append({
                "test": i,
                "message": message,
                "error": str(e)
            })
    
    # Final summary
    logger.info(f"\n{'='*80}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*80}")
    logger.success(f"✅ PASSED: {passed}/{len(TEST_CASES)}")
    if failed > 0:
        logger.error(f"❌ FAILED: {failed}/{len(TEST_CASES)}")
        logger.info(f"\n{'='*80}")
        logger.info("ISSUES FOUND:")
        for issue in issues:
            logger.warning(f"\nTest {issue['test']}: {issue.get('message', 'N/A')}")
            if 'error' in issue:
                logger.error(f"  Error: {issue['error']}")
            else:
                logger.error(f"  Expected: {issue.get('expected', 'N/A')}")
                logger.error(f"  Got: {issue.get('got', 'N/A')}")
                logger.error(f"  Response: {issue.get('response', 'N/A')}")
    else:
        logger.success(f"\n🎉 ALL TESTS PASSED! Bot is working correctly!")
    
    return passed == len(TEST_CASES)

if __name__ == "__main__":
    success = asyncio.run(test_bot_responses())
    sys.exit(0 if success else 1)
