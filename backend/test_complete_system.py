"""
Complete System Test - EdgeSoul v3.0
Tests all components: emotion detection, AI responses, memory, performance
"""

import asyncio
import time
from loguru import logger
from services.intelligent_reply_engine import intelligent_reply_engine

# Test cases covering all scenarios
TEST_CASES = [
    # Emotion Detection Tests
    {"input": "hi", "expected_emotion": "neutral", "expected_strategy": "casual_chat"},
    {"input": "iam very deperrsed", "expected_emotion": "sadness", "expected_strategy": "emotional_support"},
    {"input": "no one is talking to me", "expected_emotion": "sadness", "expected_strategy": "emotional_support"},
    {"input": "how are you?", "expected_emotion": "neutral", "expected_strategy": "casual_chat"},
    {"input": "hey are you mad", "expected_emotion": "anger", "expected_strategy": "emotional_support"},
    
    # Knowledge Tests
    {"input": "what is python?", "expected_emotion": "neutral", "expected_strategy": "knowledge_focused"},
    {"input": "tell me a joke", "expected_emotion": "joy", "expected_strategy": "knowledge_focused"},
    {"input": "explain quantum physics", "expected_emotion": "neutral", "expected_strategy": "knowledge_focused"},
    
    # Edge Cases
    {"input": "i am so scared", "expected_emotion": "fear", "expected_strategy": "emotional_support"},
    {"input": "this is so annoying", "expected_emotion": "anger", "expected_strategy": "emotional_support"},
]

async def test_system():
    """Run comprehensive system tests"""
    
    print("\n" + "="*80)
    print("🧪 EDGESOUL COMPLETE SYSTEM TEST")
    print("="*80 + "\n")
    
    results = {
        "passed": 0,
        "failed": 0,
        "total_time": 0,
        "details": []
    }
    
    for i, test in enumerate(TEST_CASES, 1):
        print(f"\n📝 Test {i}/{len(TEST_CASES)}: \"{test['input']}\"")
        print("-" * 80)
        
        start_time = time.time()
        
        try:
            # Generate reply
            response = await intelligent_reply_engine.generate_reply(
                message=test['input'],
                user_id='test_user_123'
            )
            
            elapsed = time.time() - start_time
            results["total_time"] += elapsed
            
            # Check emotion
            detected_emotion = response['emotion']['primary']
            emotion_match = detected_emotion == test['expected_emotion']
            
            # Check strategy
            detected_strategy = response.get('strategy', 'unknown')
            strategy_match = detected_strategy == test['expected_strategy']
            
            # Check response quality
            response_text = response['message']
            has_response = len(response_text) > 10
            
            # Check performance
            is_fast = elapsed < 2.0  # Target < 2s
            
            # Overall pass/fail
            test_passed = emotion_match and has_response
            
            if test_passed:
                results["passed"] += 1
                status = "✅ PASS"
            else:
                results["failed"] += 1
                status = "❌ FAIL"
            
            # Print results
            print(f"Status: {status}")
            print(f"Emotion: {detected_emotion} {'✓' if emotion_match else '✗ Expected: ' + test['expected_emotion']}")
            print(f"Strategy: {detected_strategy} {'✓' if strategy_match else '✗ Expected: ' + test['expected_strategy']}")
            print(f"Confidence: {response['emotion']['confidence']:.2%}")
            print(f"Response Time: {elapsed*1000:.0f}ms {'✓' if is_fast else '✗ (>2s)'}")
            print(f"Response Length: {len(response_text)} chars")
            print(f"Model: {response.get('metadata', {}).get('model_used', 'unknown')}")
            print(f"\nResponse Preview:")
            print(f"  {response_text[:200]}...")
            
            results["details"].append({
                "test": test['input'],
                "passed": test_passed,
                "emotion": detected_emotion,
                "strategy": detected_strategy,
                "time_ms": round(elapsed * 1000),
                "response_length": len(response_text)
            })
            
        except Exception as e:
            results["failed"] += 1
            elapsed = time.time() - start_time
            results["total_time"] += elapsed
            
            print(f"❌ ERROR: {str(e)}")
            results["details"].append({
                "test": test['input'],
                "passed": False,
                "error": str(e),
                "time_ms": round(elapsed * 1000)
            })
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    print(f"✅ Passed: {results['passed']}/{len(TEST_CASES)}")
    print(f"❌ Failed: {results['failed']}/{len(TEST_CASES)}")
    print(f"⏱️  Avg Response Time: {(results['total_time']/len(TEST_CASES))*1000:.0f}ms")
    print(f"🎯 Success Rate: {(results['passed']/len(TEST_CASES))*100:.1f}%")
    
    # Performance Analysis
    print("\n🔥 PERFORMANCE ANALYSIS")
    print("-" * 80)
    fast_responses = sum(1 for d in results['details'] if d.get('time_ms', 9999) < 2000)
    print(f"Responses < 2s: {fast_responses}/{len(TEST_CASES)} ({fast_responses/len(TEST_CASES)*100:.1f}%)")
    
    avg_time = results['total_time'] / len(TEST_CASES)
    if avg_time < 2.0:
        print("✅ Performance Target Met (<2s avg)")
    else:
        print(f"⚠️  Performance Target Missed ({avg_time:.2f}s avg)")
    
    # Memory Test
    print("\n💾 MEMORY SYSTEM TEST")
    print("-" * 80)
    try:
        from services.memory_service import memory_service
        profile = memory_service.get_or_create_profile('test_user_123')
        patterns = memory_service.get_emotional_patterns('test_user_123')
        context = memory_service.get_context_summary('test_user_123')
        
        print(f"✅ Profile Created: {profile.user_id}")
        print(f"✅ Emotional Patterns Tracked: {len(patterns)} patterns")
        print(f"✅ Conversation Context: {len(context)} messages")
        print(f"✅ Memory System: WORKING")
    except Exception as e:
        print(f"❌ Memory System Error: {e}")
    
    # Final Verdict
    print("\n" + "="*80)
    if results['passed'] == len(TEST_CASES) and avg_time < 2.0:
        print("🎉 ALL SYSTEMS OPERATIONAL - READY FOR PRODUCTION!")
    elif results['passed'] >= len(TEST_CASES) * 0.8:
        print("⚠️  MOST SYSTEMS WORKING - MINOR ISSUES DETECTED")
    else:
        print("❌ CRITICAL ISSUES DETECTED - NEEDS FIXES")
    print("="*80 + "\n")
    
    return results

if __name__ == "__main__":
    print("\n🚀 Starting EdgeSoul Complete System Test...\n")
    results = asyncio.run(test_system())
