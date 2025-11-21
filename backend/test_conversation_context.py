"""Test conversation context and continuity"""
import asyncio
import sys
from services.intelligent_reply_engine import intelligent_reply_engine
from services.memory_service import memory_service

async def test_conversation_flow():
    print("\n" + "="*80)
    print("TESTING CONVERSATION CONTEXT & CONTINUITY")
    print("="*80)
    
    user_id = "context_test_user"
    
    # Clear any existing conversation for this test user
    memory_service.clear_conversation(user_id)
    
    # Test 1: Multi-turn conversation about the same topic
    print("\n📝 TEST 1: Multi-turn conversation on same topic")
    print("-" * 80)
    
    conversation = [
        ("iam not in anger", "Should clarify user is NOT angry"),
        ("iam very happy today", "Should remember previous clarification"),
        ("why did you say that?", "Should reference previous bot response"),
    ]
    
    for i, (message, expected) in enumerate(conversation, 1):
        print(f"\n🔹 Turn {i}:")
        print(f"   User: {message}")
        print(f"   Expected: {expected}")
        
        # Generate reply
        result = await intelligent_reply_engine.generate_reply(message, user_id)
        response = result['text']
        
        # Save to memory for context
        memory_service.add_message(
            user_id=user_id,
            user_message=message,
            assistant_response=response
        )
        
        print(f"   Bot: {response[:150]}{'...' if len(response) > 150 else ''}")
        print(f"   Strategy: {result.get('type', 'unknown')}")
    
    # Test 2: Emotional conversation continuity
    print("\n" + "="*80)
    print("📝 TEST 2: Emotional conversation continuity")
    print("-" * 80)
    
    memory_service.clear_conversation(user_id)
    
    emotional_flow = [
        ("I had a really bad day", "Should detect sadness"),
        ("my boss yelled at me", "Should connect to 'bad day' context"),
        ("I feel like quitting", "Should understand escalation from previous messages"),
    ]
    
    for i, (message, expected) in enumerate(emotional_flow, 1):
        print(f"\n🔹 Turn {i}:")
        print(f"   User: {message}")
        print(f"   Expected: {expected}")
        
        result = await intelligent_reply_engine.generate_reply(message, user_id)
        response = result['text']
        
        memory_service.add_message(
            user_id=user_id,
            user_message=message,
            assistant_response=response
        )
        
        print(f"   Bot: {response[:150]}{'...' if len(response) > 150 else ''}")
        print(f"   Strategy: {result.get('type', 'unknown')}")
        print(f"   Emotion: {result.get('emotion_addressed', 'N/A')}")
    
    # Test 3: Topic switching
    print("\n" + "="*80)
    print("📝 TEST 3: Topic switching detection")
    print("-" * 80)
    
    memory_service.clear_conversation(user_id)
    
    topic_switch = [
        ("tell me about Python", "Knowledge request"),
        ("what about JavaScript?", "Should understand 'about' refers to programming"),
        ("how are you?", "Complete topic change - casual greeting"),
    ]
    
    for i, (message, expected) in enumerate(topic_switch, 1):
        print(f"\n🔹 Turn {i}:")
        print(f"   User: {message}")
        print(f"   Expected: {expected}")
        
        result = await intelligent_reply_engine.generate_reply(message, user_id)
        response = result['text']
        
        memory_service.add_message(
            user_id=user_id,
            user_message=message,
            assistant_response=response
        )
        
        print(f"   Bot: {response[:150]}{'...' if len(response) > 150 else ''}")
        print(f"   Strategy: {result.get('type', 'unknown')}")
    
    print("\n" + "="*80)
    print("✅ CONVERSATION CONTEXT TEST COMPLETE")
    print("="*80)
    print("\n💡 Check if:")
    print("   1. Bot remembers previous messages")
    print("   2. Responses make sense in context")
    print("   3. Bot can reference earlier conversation")
    print("   4. Emotional continuity maintained")

if __name__ == "__main__":
    try:
        asyncio.run(test_conversation_flow())
    except KeyboardInterrupt:
        print("\n\n⚠️ Test interrupted by user")
        sys.exit(1)
