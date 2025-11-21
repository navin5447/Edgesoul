"""
Test Database Persistence for EdgeSoul
Verifies that user profiles, memories, and patterns persist across restarts
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from services.memory_service import memory_service
from models.memory import MemoryType
from loguru import logger
import time


def test_database_persistence():
    """Test that data persists in database"""
    
    print("\n" + "="*60)
    print("EdgeSoul Database Persistence Test")
    print("="*60 + "\n")
    
    test_user = "test_persistence_user"
    
    # Step 1: Create/Update Profile
    print("📝 Step 1: Creating user profile...")
    profile = memory_service.get_or_create_profile(test_user)
    print(f"✅ Profile created: user_id={profile.user_id}")
    print(f"   - Empathy: {profile.empathy_level}")
    print(f"   - Humor: {profile.humor_level}")
    print(f"   - Gender: {profile.gender}")
    
    # Update profile settings
    print("\n🔧 Updating profile settings...")
    updated = memory_service.update_profile(test_user, {
        "empathy_level": 95,
        "humor_level": 75,
        "gender": "female",
        "name": "Test User"
    })
    print(f"✅ Profile updated:")
    print(f"   - Empathy: {updated.empathy_level}")
    print(f"   - Humor: {updated.humor_level}")
    print(f"   - Gender: {updated.gender}")
    print(f"   - Name: {updated.name}")
    
    # Step 2: Add Memories
    print("\n📚 Step 2: Adding memories...")
    memory1 = memory_service.add_memory(
        user_id=test_user,
        memory_type=MemoryType.PREFERENCE,
        content="User prefers detailed explanations",
        confidence=0.9,
        importance=0.8
    )
    print(f"✅ Memory 1 added: {memory1.content}")
    
    memory2 = memory_service.add_memory(
        user_id=test_user,
        memory_type=MemoryType.FACT,
        content="User is interested in machine learning",
        confidence=0.95,
        importance=0.9
    )
    print(f"✅ Memory 2 added: {memory2.content}")
    
    # Step 3: Track Emotions
    print("\n😊 Step 3: Tracking emotions...")
    memory_service.track_emotion(test_user, "joy", 0.85, "Happy about test results")
    print("✅ Tracked emotion: joy (85% intensity)")
    
    memory_service.track_emotion(test_user, "joy", 0.90, "Very excited")
    print("✅ Tracked emotion: joy (90% intensity)")
    
    memory_service.track_emotion(test_user, "sadness", 0.30, "Minor disappointment")
    print("✅ Tracked emotion: sadness (30% intensity)")
    
    # Step 4: Update Conversation Context
    print("\n💬 Step 4: Updating conversation context...")
    memory_service.update_conversation_context(
        user_id=test_user,
        session_id="test_session_123",
        message="Tell me about AI",
        response="AI is fascinating! Let me explain...",
        emotion="joy"
    )
    print("✅ Conversation context updated")
    
    # Step 5: Verify Data Immediately
    print("\n" + "="*60)
    print("✅ VERIFICATION (Before Restart Simulation)")
    print("="*60)
    
    # Verify profile
    loaded_profile = memory_service.get_or_create_profile(test_user)
    print(f"\n👤 Profile:")
    print(f"   - Name: {loaded_profile.name}")
    print(f"   - Empathy: {loaded_profile.empathy_level}")
    print(f"   - Humor: {loaded_profile.humor_level}")
    print(f"   - Gender: {loaded_profile.gender}")
    
    # Verify memories
    recent_memories = memory_service.get_recent_memories(test_user, days=1)
    print(f"\n📚 Memories ({len(recent_memories)} found):")
    for mem in recent_memories:
        print(f"   - [{mem.memory_type.value}] {mem.content[:50]}...")
    
    # Verify emotions
    patterns = memory_service.get_emotional_patterns(test_user)
    print(f"\n😊 Emotional Patterns ({len(patterns)} emotions):")
    for emotion, pattern in patterns.items():
        print(f"   - {emotion}: {pattern.frequency}x, avg intensity: {pattern.avg_intensity:.2f}")
    
    # Verify context
    context = memory_service.get_conversation_context(test_user)
    if context:
        print(f"\n💬 Conversation Context:")
        print(f"   - Session: {context.session_id}")
        print(f"   - Messages: {len(context.messages)}")
        print(f"   - Current emotion: {context.current_emotion}")
    
    # Step 6: Simulate Restart (recreate service)
    print("\n" + "="*60)
    print("🔄 SIMULATING BACKEND RESTART...")
    print("="*60)
    print("\n⏳ Creating new MemoryService instance (simulating restart)...\n")
    
    # Import fresh instance
    from services.memory_service import MemoryService
    new_service = MemoryService()
    
    # Step 7: Verify Data After "Restart"
    print("="*60)
    print("✅ VERIFICATION (After Restart Simulation)")
    print("="*60)
    
    # Verify profile persisted
    loaded_profile = new_service.get_or_create_profile(test_user)
    assert loaded_profile.name == "Test User", "Profile name not persisted!"
    assert loaded_profile.empathy_level == 95, "Empathy level not persisted!"
    assert loaded_profile.humor_level == 75, "Humor level not persisted!"
    assert loaded_profile.gender == "female", "Gender not persisted!"
    print(f"\n✅ Profile PERSISTED:")
    print(f"   - Name: {loaded_profile.name}")
    print(f"   - Empathy: {loaded_profile.empathy_level}")
    print(f"   - Humor: {loaded_profile.humor_level}")
    print(f"   - Gender: {loaded_profile.gender}")
    
    # Verify memories persisted
    loaded_memories = new_service.get_recent_memories(test_user, days=1)
    assert len(loaded_memories) >= 2, "Memories not persisted!"
    print(f"\n✅ Memories PERSISTED ({len(loaded_memories)} found):")
    for mem in loaded_memories:
        print(f"   - [{mem.memory_type.value}] {mem.content[:50]}...")
    
    # Verify emotions persisted
    loaded_patterns = new_service.get_emotional_patterns(test_user)
    assert len(loaded_patterns) >= 2, "Emotional patterns not persisted!"
    assert "joy" in loaded_patterns, "Joy pattern not persisted!"
    print(f"\n✅ Emotional Patterns PERSISTED ({len(loaded_patterns)} emotions):")
    for emotion, pattern in loaded_patterns.items():
        print(f"   - {emotion}: {pattern.frequency}x, avg intensity: {pattern.avg_intensity:.2f}")
    
    # Verify context persisted
    loaded_context = new_service.get_conversation_context(test_user)
    assert loaded_context is not None, "Conversation context not persisted!"
    assert loaded_context.session_id == "test_session_123", "Session ID not persisted!"
    print(f"\n✅ Conversation Context PERSISTED:")
    print(f"   - Session: {loaded_context.session_id}")
    print(f"   - Messages: {len(loaded_context.messages)}")
    print(f"   - Current emotion: {loaded_context.current_emotion}")
    
    # Final Success
    print("\n" + "="*60)
    print("🎉 ALL TESTS PASSED!")
    print("="*60)
    print("\n✅ Database persistence is working correctly!")
    print("✅ User profiles persist across restarts")
    print("✅ Memories persist across restarts")
    print("✅ Emotional patterns persist across restarts")
    print("✅ Conversation contexts persist across restarts")
    print("\n📁 Database location: backend/data/edgesoul.db")
    print("💾 Data is now saved permanently!\n")
    
    # Show database stats
    from database.database_service import db_service
    stats = db_service.get_stats()
    print("📊 Database Statistics:")
    print(f"   - Total users: {stats.get('total_users', 0)}")
    print(f"   - Total memories: {stats.get('total_memories', 0)}")
    print(f"   - Total emotional patterns: {stats.get('total_emotional_patterns', 0)}")
    print(f"   - Active conversations: {stats.get('active_conversations', 0)}")
    print()


if __name__ == "__main__":
    try:
        test_database_persistence()
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
