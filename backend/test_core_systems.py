"""
EdgeSoul Core Systems Test - Database Persistence Focus
Tests the most important feature: permanent data storage
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

print("\n" + "="*70)
print("EdgeSoul - Database Persistence & Core Systems Test")
print("="*70 + "\n")

# Test Counter
passed = 0
failed = 0

def test(name):
    print(f"\n{'='*70}\n{name}\n{'='*70}")

# =============================================================================
# Test 1: Database Infrastructure
# =============================================================================
test("Test 1: Database Infrastructure")
try:
    from database.database_service import db_service
    stats = db_service.get_stats()
    print(f"✅ Database initialized")
    print(f"   Users: {stats['total_users']}")
    print(f"   Memories: {stats['total_memories']}")
    print(f"   Emotional Patterns: {stats['total_emotional_patterns']}")
    print(f"   Active Conversations: {stats['active_conversations']}")
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    failed += 1

# =============================================================================
# Test 2: User Profile Persistence
# =============================================================================
test("Test 2: User Profile - Create, Update, Persist")
try:
    from services.memory_service import memory_service
    
    user_id = "test_final_user"
    
    # Create profile
    profile = memory_service.get_or_create_profile(user_id)
    print(f"✅ Created profile: {user_id}")
    
    # Update with custom settings
    memory_service.update_profile(user_id, {
        "name": "Test User",
        "empathy_level": 90,
        "humor_level": 70,
        "formality_level": 30,
        "verbosity_level": 80,
        "gender": "female"
    })
    print(f"✅ Updated profile settings")
    
    # Verify updates
    updated = memory_service.get_or_create_profile(user_id)
    assert updated.empathy_level == 90, "Empathy not saved"
    assert updated.humor_level == 70, "Humor not saved"
    assert updated.gender == "female", "Gender not saved"
    print(f"✅ Profile settings verified:")
    print(f"   Empathy: {updated.empathy_level}")
    print(f"   Humor: {updated.humor_level}")
    print(f"   Gender: {updated.gender}")
    
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    failed += 1

# =============================================================================
# Test 3: Memory Storage & Retrieval
# =============================================================================
test("Test 3: Memory Storage & Retrieval")
try:
    from models.memory import MemoryType
    
    user_id = "test_final_user"
    
    # Add different types of memories
    mem1 = memory_service.add_memory(
        user_id, MemoryType.PREFERENCE,
        "User prefers detailed technical explanations",
        confidence=0.9, importance=0.8
    )
    print(f"✅ Added preference memory")
    
    mem2 = memory_service.add_memory(
        user_id, MemoryType.FACT,
        "User is learning Python programming",
        confidence=0.95, importance=0.9
    )
    print(f"✅ Added fact memory")
    
    mem3 = memory_service.add_memory(
        user_id, MemoryType.FACT,
        "User likes machine learning and AI",
        confidence=1.0, importance=0.85
    )
    print(f"✅ Added interest memory")
    
    # Search memories
    memories = memory_service.search_memories(user_id, "Python", limit=5)
    assert len(memories) > 0, "Search failed"
    print(f"✅ Search found {len(memories)} matching memories")
    
    # Get recent memories
    recent = memory_service.get_recent_memories(user_id, days=1)
    assert len(recent) >= 3, f"Expected >= 3 memories, got {len(recent)}"
    print(f"✅ Retrieved {len(recent)} recent memories")
    
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    failed += 1

# =============================================================================
# Test 4: Emotional Pattern Tracking
# =============================================================================
test("Test 4: Emotional Pattern Tracking")
try:
    user_id = "test_final_user"
    
    # Track various emotions
    memory_service.track_emotion(user_id, "joy", 0.95, "Excited about project progress")
    print(f"✅ Tracked joy emotion")
    
    memory_service.track_emotion(user_id, "joy", 0.88, "Happy with results")
    print(f"✅ Tracked joy again")
    
    memory_service.track_emotion(user_id, "surprise", 0.75, "Unexpected feature")
    print(f"✅ Tracked surprise")
    
    # Get patterns
    patterns = memory_service.get_emotional_patterns(user_id)
    assert "joy" in patterns, "Joy pattern not found"
    assert patterns["joy"].frequency >= 2, "Joy frequency incorrect"
    print(f"✅ Emotional patterns retrieved:")
    print(f"   Joy: {patterns['joy'].frequency}x, avg intensity: {patterns['joy'].avg_intensity:.2f}")
    if "surprise" in patterns:
        print(f"   Surprise: {patterns['surprise'].frequency}x, avg intensity: {patterns['surprise'].avg_intensity:.2f}")
    
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    failed += 1

# =============================================================================
# Test 5: Conversation Context
# =============================================================================
test("Test 5: Conversation Context Management")
try:
    user_id = "test_final_user"
    
    # Update context with messages
    memory_service.update_conversation_context(
        user_id, "session_123",
        "Tell me about machine learning",
        "Machine learning is a subset of AI that...",
        "joy"
    )
    print(f"✅ Added conversation message 1")
    
    memory_service.update_conversation_context(
        user_id, "session_123",
        "How do I learn it?",
        "Start with Python basics, then move to libraries...",
        "joy"
    )
    print(f"✅ Added conversation message 2")
    
    # Retrieve context
    context = memory_service.get_conversation_context(user_id)
    assert context is not None, "Context not found"
    assert len(context.messages) >= 2, "Messages not saved"
    assert context.current_emotion == "joy", "Emotion not tracked"
    print(f"✅ Context retrieved:")
    print(f"   Session: {context.session_id}")
    print(f"   Messages: {len(context.messages)}")
    print(f"   Topics: {len(context.topics)}")
    print(f"   Current emotion: {context.current_emotion}")
    
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    failed += 1

# =============================================================================
# Test 6: Persistence Across Restart
# =============================================================================
test("Test 6: DATA PERSISTENCE VERIFICATION (Simulated Restart)")
try:
    from services.memory_service import MemoryService
    
    print("🔄 Creating new MemoryService instance (simulates backend restart)...")
    new_service = MemoryService()
    
    user_id = "test_final_user"
    
    # Verify profile persisted
    profile = new_service.get_or_create_profile(user_id)
    assert profile.name == "Test User", "Name not persisted"
    assert profile.empathy_level == 90, "Empathy not persisted"
    assert profile.gender == "female", "Gender not persisted"
    print(f"✅ Profile PERSISTED:")
    print(f"   Name: {profile.name}")
    print(f"   Empathy: {profile.empathy_level}")
    print(f"   Gender: {profile.gender}")
    
    # Verify memories persisted
    memories = new_service.get_recent_memories(user_id, days=1)
    assert len(memories) >= 3, f"Memories not persisted (found {len(memories)})"
    print(f"✅ Memories PERSISTED: {len(memories)} found")
    
    # Verify emotional patterns persisted
    patterns = new_service.get_emotional_patterns(user_id)
    assert "joy" in patterns, "Emotional patterns not persisted"
    assert patterns["joy"].frequency >= 2, "Joy frequency not persisted"
    print(f"✅ Emotional Patterns PERSISTED: {len(patterns)} emotions")
    
    # Verify context persisted
    context = new_service.get_conversation_context(user_id)
    assert context is not None, "Context not persisted"
    assert len(context.messages) >= 2, "Messages not persisted"
    print(f"✅ Conversation Context PERSISTED: {len(context.messages)} messages")
    
    passed += 1
except Exception as e:
    print(f"❌ FAILED: {e}")
    import traceback
    traceback.print_exc()
    failed += 1

# =============================================================================
# FINAL SUMMARY
# =============================================================================
print("\n\n" + "="*70)
print("FINAL TEST SUMMARY")
print("="*70)

total = passed + failed
print(f"\nTotal Tests: {total}")
print(f"✅ Passed: {passed} ({passed/total*100:.1f}%)")
print(f"❌ Failed: {failed} ({failed/total*100:.1f}%)")

if failed == 0:
    print("\n" + "🎉"*20)
    print("ALL CORE SYSTEMS TESTS PASSED!")
    print("🎉"*20)
    print("\n✅ Database persistence working perfectly")
    print("✅ User profiles persist across restarts")
    print("✅ Memories stored permanently")
    print("✅ Emotional patterns tracked over time")
    print("✅ Conversation context maintained")
    print("\n💾 EdgeSoul now has PERMANENT MEMORY!")
    print("="*70 + "\n")
    sys.exit(0)
else:
    print(f"\n⚠️  {failed} test(s) failed - review errors above")
    print("="*70 + "\n")
    sys.exit(1)
