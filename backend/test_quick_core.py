"""
Quick Test Suite - Core Functionality Only
Tests critical components without Ollama (faster execution)
"""

import sys
import os
from pathlib import Path

# Set UTF-8 encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

sys.path.insert(0, str(Path(__file__).parent))

print("\n" + "="*70)
print("EdgeSoul Quick Test Suite - Core Components")
print("="*70 + "\n")

test_results = []

# Test 1: Database Persistence
print("="*70)
print("Test 1: Database Persistence")
print("="*70)
try:
    from database.database_service import db_service
    stats = db_service.get_stats()
    print(f"✅ Database initialized: {stats}")
    test_results.append(("Database", True))
except Exception as e:
    print(f"❌ Database failed: {e}")
    test_results.append(("Database", False))

# Test 2: Memory Service
print("\n" + "="*70)
print("Test 2: Memory Service with Database")
print("="*70)
try:
    from services.memory_service import memory_service
    from models.memory import MemoryType
    
    # Create test profile
    profile = memory_service.get_or_create_profile("test_quick_user")
    print(f"✅ Profile created: {profile.user_id}")
    
    # Update profile
    memory_service.update_profile("test_quick_user", {"empathy_level": 85})
    updated = memory_service.get_or_create_profile("test_quick_user")
    assert updated.empathy_level == 85
    print(f"✅ Profile updated: empathy={updated.empathy_level}")
    
    # Add memory
    memory = memory_service.add_memory(
        "test_quick_user",
        MemoryType.FACT,
        "Test memory content"
    )
    print(f"✅ Memory added: {memory.content}")
    
    # Track emotion
    memory_service.track_emotion("test_quick_user", "joy", 0.9)
    patterns = memory_service.get_emotional_patterns("test_quick_user")
    print(f"✅ Emotion tracked: {len(patterns)} patterns")
    
    test_results.append(("Memory Service", True))
except Exception as e:
    print(f"❌ Memory Service failed: {e}")
    import traceback
    traceback.print_exc()
    test_results.append(("Memory Service", False))

# Test 3: ONNX Emotion Detection
print("\n" + "="*70)
print("Test 3: ONNX Emotion Detection")
print("="*70)
try:
    import asyncio
    from services.onnx_emotion_service import onnx_emotion_service
    
    test_cases = [
        ("I'm so happy today!", "joy"),
        ("I'm feeling really sad", "sadness"),
        ("This makes me so angry", "anger"),
        ("I'm scared and worried", "fear"),
        ("I love this so much", "love"),
        ("Wow! That's amazing!", "surprise"),
    ]
    
    async def test_emotions():
        passed = 0
        for text, expected in test_cases:
            result = await onnx_emotion_service.detect_emotion(text)
            if result['primary_emotion'] == expected:
                print(f"✅ '{text}' → {result['primary_emotion']} ({result['confidence']:.2%})")
                passed += 1
            else:
                print(f"❌ '{text}' → {result['primary_emotion']} (expected {expected})")
        return passed
    
    passed = asyncio.run(test_emotions())
    
    if passed >= 4:  # At least 4 out of 6
        print(f"✅ Emotion detection: {passed}/6 correct")
        test_results.append(("Emotion Detection", True))
    else:
        print(f"❌ Emotion detection: {passed}/6 correct (needs improvement)")
        test_results.append(("Emotion Detection", False))
        
except Exception as e:
    print(f"❌ Emotion detection failed: {e}")
    import traceback
    traceback.print_exc()
    test_results.append(("Emotion Detection", False))

# Test 4: Context-Aware Emotion Detection
print("\n" + "="*70)
print("Test 4: Context-Aware Emotion Detection")
print("="*70)
try:
    from services.emotion_service import emotion_service
    
    # Test emotion detection with context awareness
    test_text = "I'm feeling really down today"
    emotion_result = emotion_service.detect_emotion(test_text)
    
    print(f"✅ Emotion detected for '{test_text}':")
    print(f"   Primary: {emotion_result['emotion']}")
    print(f"   Confidence: {emotion_result['confidence']:.2%}")
    print(f"   Context: {emotion_result.get('context', 'N/A')}")
    
    test_results.append(("Context-Aware Emotion", True))
    
except Exception as e:
    print(f"❌ Context-aware emotion detection failed: {e}")
    import traceback
    traceback.print_exc()
    test_results.append(("Context-Aware Emotion", False))

# Test 5: Profile Persistence
print("\n" + "="*70)
print("Test 5: Profile Persistence Across Service Restart")
print("="*70)
try:
    from services.memory_service import MemoryService
    
    # Create new service instance (simulates restart)
    new_service = MemoryService()
    
    # Verify data persisted
    profile = new_service.get_or_create_profile("test_quick_user")
    assert profile.empathy_level == 85, f"Expected 85, got {profile.empathy_level}"
    print(f"✅ Profile persisted: empathy={profile.empathy_level}")
    
    # Verify memories persisted
    memories = new_service.get_recent_memories("test_quick_user", days=1)
    assert len(memories) > 0, "No memories found"
    print(f"✅ Memories persisted: {len(memories)} found")
    
    # Verify patterns persisted
    patterns = new_service.get_emotional_patterns("test_quick_user")
    assert "joy" in patterns, "Joy pattern not found"
    print(f"✅ Emotional patterns persisted: {len(patterns)} emotions")
    
    test_results.append(("Persistence", True))
    
except Exception as e:
    print(f"❌ Persistence test failed: {e}")
    import traceback
    traceback.print_exc()
    test_results.append(("Persistence", False))

# Final Summary
print("\n\n" + "="*70)
print("QUICK TEST SUMMARY")
print("="*70)

passed = sum(1 for _, result in test_results if result)
total = len(test_results)

for test_name, result in test_results:
    status = "✅ PASSED" if result else "❌ FAILED"
    print(f"{status:12} - {test_name}")

print("="*70)
print(f"Total: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
print("="*70)

if passed == total:
    print("\n🎉 ALL CORE TESTS PASSED! 🎉")
    print("\nNote: Ollama-dependent tests skipped for speed.")
    print("Run individual test files to test knowledge engine.")
    sys.exit(0)
else:
    print(f"\n⚠️  {total - passed} test(s) failed")
    sys.exit(1)
