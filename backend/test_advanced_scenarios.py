"""
Advanced Test Scenarios for EdgeSoul Bot
Tests complex emotions, long sentences, code requests, and mixed scenarios
"""

import asyncio
from loguru import logger
from services.intelligent_reply_engine import intelligent_reply_engine

# Configure logger
logger.remove()
logger.add(lambda msg: print(msg, end=""), colorize=True, format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

async def test_advanced_scenarios():
    """Test bot with complex scenarios"""
    
    test_cases = [
        # Complex Emotional Scenarios
        {
            "input": "I had such a terrible day at work, my boss yelled at me in front of everyone and I feel so embarrassed and humiliated, I don't even want to go back tomorrow",
            "type": "complex_emotion",
            "expected_emotion": "sadness/anger",
            "description": "Long sentence with multiple emotions"
        },
        {
            "input": "OMG I just got promoted and I'm getting a raise and my dream project got approved I literally can't believe this is happening to me right now!!!",
            "type": "complex_emotion",
            "expected_emotion": "joy",
            "description": "Excited long sentence with multiple good news"
        },
        {
            "input": "I'm feeling really anxious about my upcoming presentation next week, what if I forget everything I prepared and everyone thinks I'm incompetent",
            "type": "complex_emotion",
            "expected_emotion": "fear/anxiety",
            "description": "Anxiety with future worry"
        },
        {
            "input": "My best friend just told me they're moving to another country and I won't see them for years, I'm so sad but also happy for their opportunity, it's so confusing",
            "type": "mixed_emotion",
            "expected_emotion": "sadness/joy",
            "description": "Mixed emotions - bittersweet"
        },
        
        # Code Requests - Simple
        {
            "input": "write me a python function to reverse a string",
            "type": "code_request",
            "expected_type": "knowledge_focused",
            "description": "Simple code request"
        },
        {
            "input": "can you show me how to create a fibonacci sequence in python",
            "type": "code_request",
            "expected_type": "knowledge_focused",
            "description": "Algorithm code request"
        },
        {
            "input": "I need help with a for loop in javascript that counts from 1 to 10",
            "type": "code_request",
            "expected_type": "knowledge_focused",
            "description": "Basic loop code"
        },
        
        # Code Requests - Complex
        {
            "input": "write a python script that reads a CSV file and calculates the average of the numbers in the second column",
            "type": "code_request",
            "expected_type": "knowledge_focused",
            "description": "Complex code with file handling"
        },
        {
            "input": "can you help me build a REST API endpoint in FastAPI that accepts POST requests with JSON data and stores it in a database",
            "type": "code_request",
            "expected_type": "knowledge_focused",
            "description": "Advanced API code"
        },
        
        # Emotional + Code
        {
            "input": "I'm so frustrated, I've been trying to fix this bug for 3 hours and my code keeps throwing errors, can you help me understand what's wrong with my Python list comprehension",
            "type": "emotional_code",
            "expected_emotion": "anger/frustration",
            "description": "Frustration with code problem"
        },
        {
            "input": "I'm really excited to learn machine learning but I don't know where to start, can you explain how neural networks work and maybe show me some basic code",
            "type": "emotional_code",
            "expected_emotion": "joy",
            "description": "Excitement with learning request"
        },
        
        # Complex Knowledge Questions
        {
            "input": "explain to me in detail how blockchain technology works and what makes it secure and different from traditional databases",
            "type": "complex_knowledge",
            "expected_type": "knowledge_focused",
            "description": "Complex technical explanation"
        },
        {
            "input": "I'm trying to understand the difference between supervised learning, unsupervised learning, and reinforcement learning in AI, can you break it down for me",
            "type": "complex_knowledge",
            "expected_type": "knowledge_focused",
            "description": "Multi-part technical question"
        },
        
        # Casual + Long
        {
            "input": "hey how's your day going, I was just thinking about you and wanted to check in to see how things are",
            "type": "casual_long",
            "expected_type": "casual_chat",
            "description": "Long casual greeting"
        },
        {
            "input": "I'm so bored right now, there's literally nothing to do and all my friends are busy, what should I do to pass the time",
            "type": "casual_long",
            "expected_type": "casual_chat",
            "description": "Boredom with request for suggestions"
        },
    ]
    
    print("=" * 100)
    print("ADVANCED SCENARIO TESTING")
    print("=" * 100)
    
    passed = 0
    total = len(test_cases)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'=' * 100}")
        print(f"TEST {i}/{total}: {test['description']}")
        print(f"{'=' * 100}")
        print(f"📝 Input ({len(test['input'].split())} words):")
        print(f"   {test['input']}")
        print()
        
        try:
            # Generate response
            result = await intelligent_reply_engine.generate_reply(
                message=test['input'],
                user_id='test_user'
            )
            
            response = result.get('text', result.get('message', ''))
            strategy = result.get('strategy', result.get('type', ''))
            emotion = result.get('emotion', '')
            
            # Print results
            print(f"🎯 Strategy: {strategy}")
            print(f"😊 Emotion: {emotion}")
            print(f"📊 Response length: {len(response.split())} words")
            print(f"\n💬 Response:")
            print(f"   {response[:200]}{'...' if len(response) > 200 else ''}")
            
            # Validation
            checks = []
            
            # Check response exists
            if response and len(response) > 0:
                checks.append("✅ Response generated")
            else:
                checks.append("❌ No response")
            
            # Check response is reasonable length (not too short or too long)
            word_count = len(response.split())
            if 10 <= word_count <= 300:
                checks.append(f"✅ Response length OK ({word_count} words)")
            else:
                checks.append(f"⚠️ Response length: {word_count} words")
            
            # Check for code if code request
            if test['type'] in ['code_request', 'emotional_code']:
                if any(indicator in response.lower() for indicator in ['def ', 'function', 'import', '{', '}', 'for ', 'while ', '```']):
                    checks.append("✅ Contains code")
                else:
                    checks.append("⚠️ No code found")
            
            # Check no system prompt leaking
            if not any(leak in response for leak in ['User:', 'Assistant:', 'You are EdgeSoul', 'CONVERSATION HISTORY']):
                checks.append("✅ No prompt leaking")
            else:
                checks.append("❌ System prompt visible")
            
            # Check emotional tone for emotional requests
            if test['type'] in ['complex_emotion', 'mixed_emotion', 'emotional_code']:
                emotional_words = ['sorry', 'understand', 'feel', 'here for you', 'glad', 'excited', 'happy', 'sad', 'anxious', 'frustrated']
                if any(word in response.lower() for word in emotional_words):
                    checks.append("✅ Emotional response")
                else:
                    checks.append("⚠️ Not very emotional")
            
            print("\n📋 Validation:")
            for check in checks:
                print(f"   {check}")
            
            # Count as passed if response exists and no major issues
            if response and len(response) > 0 and 'User:' not in response:
                passed += 1
                print(f"\n✅ TEST {i} PASSED")
            else:
                print(f"\n❌ TEST {i} FAILED")
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            logger.exception(e)
    
    # Summary
    print(f"\n{'=' * 100}")
    print("TEST SUMMARY")
    print(f"{'=' * 100}")
    print(f"✅ PASSED: {passed}/{total} ({passed/total*100:.0f}%)")
    print(f"❌ FAILED: {total-passed}/{total}")
    print(f"{'=' * 100}\n")

if __name__ == "__main__":
    asyncio.run(test_advanced_scenarios())
