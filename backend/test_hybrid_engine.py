"""
Test script for Hybrid Chat Engine.
Tests emotion detection + knowledge reasoning + emotional rephrasing.
"""

import asyncio
from loguru import logger
from services.hybrid_chat_engine import hybrid_chat_engine
from services.emotion_service import emotion_service
from services.knowledge_engine import knowledge_engine
import json


async def test_hybrid_engine():
    """Test the hybrid chat engine with various scenarios."""
    
    print("=" * 70)
    print("HYBRID CHAT ENGINE TEST SUITE")
    print("=" * 70)
    
    # Initialize services
    print("\n📋 Initializing services...")
    print("-" * 70)
    
    # Load emotion model
    try:
        await emotion_service.load_model()
        print("✓ Emotion detection model loaded")
    except Exception as e:
        print(f"✗ Emotion model failed: {str(e)}")
    
    # Initialize knowledge engine
    ollama_ready = await knowledge_engine.initialize()
    if ollama_ready:
        print("✓ Ollama knowledge engine ready")
    else:
        print("⚠ Ollama not available - using fallback")
    
    print("✓ Hybrid engine initialized")
    
    # Test scenarios
    test_cases = [
        {
            "name": "Happy + Knowledge Query",
            "input": "I'm so excited! Can you explain what Python is?",
            "expected": "Joy emotion + Python explanation with enthusiastic tone"
        },
        {
            "name": "Sad + Knowledge Query",
            "input": "I'm feeling really down. Can you tell me who is the president of India?",
            "expected": "Sadness emotion + President info with empathetic tone"
        },
        {
            "name": "Angry + Knowledge Query",
            "input": "I'm so frustrated! What is machine learning?",
            "expected": "Anger emotion + ML explanation with calm tone"
        },
        {
            "name": "Pure Joy Expression",
            "input": "I'm so happy today! Everything is going great!",
            "expected": "Joy emotion + Emotional support (no knowledge)"
        },
        {
            "name": "Pure Sadness Expression",
            "input": "I feel so sad and alone right now",
            "expected": "Sadness emotion + Empathetic support"
        },
        {
            "name": "Neutral Knowledge Query",
            "input": "What is photosynthesis?",
            "expected": "Neutral/low emotion + Scientific explanation"
        },
        {
            "name": "Fear + How-to Query",
            "input": "I'm scared I'll fail. How do I learn programming?",
            "expected": "Fear emotion + Learning guide with reassuring tone"
        },
        {
            "name": "Code Request",
            "input": "Can you write code for checking prime numbers?",
            "expected": "Knowledge response with code example"
        }
    ]
    
    print("\n" + "=" * 70)
    print("RUNNING TEST CASES")
    print("=" * 70)
    
    results = []
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'=' * 70}")
        print(f"TEST {i}: {test['name']}")
        print(f"{'=' * 70}")
        print(f"\n📝 Input: \"{test['input']}\"")
        print(f"📊 Expected: {test['expected']}")
        print(f"\n⏳ Processing...")
        
        try:
            # Process message
            result = await hybrid_chat_engine.process_message(
                user_input=test["input"],
                context=None,
                temperature=0.7
            )
            
            # Display results
            print(f"\n✅ RESULTS:")
            print(f"{'─' * 70}")
            
            # Emotion analysis
            emotion = result["emotion"]
            print(f"🎭 Emotion Detected:")
            print(f"   Primary: {emotion['primary'].upper()} ({emotion['confidence']:.1%} confidence)")
            print(f"   All emotions: {json.dumps(emotion['all_emotions'], indent=6)}")
            
            # Response details
            print(f"\n💬 Response Type: {result['response_type']}")
            print(f"🎵 Tone: {result['tone']}")
            
            # The actual response
            print(f"\n🤖 Bot Response:")
            print(f"{'─' * 70}")
            print(f"{result['response']}")
            print(f"{'─' * 70}")
            
            # Metadata
            metadata = result["metadata"]
            print(f"\n📈 Metadata:")
            print(f"   Processing time: {metadata['processing_time']}")
            print(f"   Knowledge used: {metadata['knowledge_used']}")
            print(f"   Model: {metadata['model']}")
            
            # Test evaluation
            success = True
            if "happy" in test["input"].lower() or "excited" in test["input"].lower():
                if emotion["primary"] != "joy":
                    success = False
                    print(f"\n⚠️  Warning: Expected 'joy' but got '{emotion['primary']}'")
            
            if "?" in test["input"] or any(kw in test["input"].lower() for kw in ["what", "how", "explain", "write"]):
                if not metadata["knowledge_used"]:
                    print(f"\n⚠️  Warning: Expected knowledge response but got emotional only")
            
            status = "✓ PASS" if success else "⚠ PARTIAL"
            print(f"\n{status}")
            
            results.append({
                "test": test["name"],
                "status": status,
                "emotion": emotion["primary"],
                "confidence": emotion["confidence"],
                "type": result["response_type"]
            })
            
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            results.append({
                "test": test["name"],
                "status": "✗ FAIL",
                "error": str(e)
            })
        
        print()
    
    # Summary
    print("=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    for result in results:
        status_icon = "✓" if "PASS" in result["status"] else "⚠" if "PARTIAL" in result["status"] else "✗"
        print(f"{status_icon} {result['test']}: {result['status']}")
        if "emotion" in result:
            print(f"   └─ Emotion: {result['emotion']} ({result.get('confidence', 0):.1%}), Type: {result['type']}")
    
    # Stats
    passed = sum(1 for r in results if "PASS" in r["status"])
    partial = sum(1 for r in results if "PARTIAL" in r["status"])
    failed = sum(1 for r in results if "FAIL" in r["status"])
    
    print(f"\n📊 Statistics:")
    print(f"   Total tests: {len(results)}")
    print(f"   Passed: {passed}")
    print(f"   Partial: {partial}")
    print(f"   Failed: {failed}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE!")
    print("=" * 70)


async def quick_test():
    """Quick interactive test."""
    
    print("\n" + "=" * 70)
    print("HYBRID CHAT ENGINE - Quick Interactive Test")
    print("=" * 70)
    
    # Initialize
    print("\nInitializing...")
    await emotion_service.load_model()
    await knowledge_engine.initialize()
    
    print("\n✓ Ready! Type your messages (or 'quit' to exit)\n")
    
    while True:
        try:
            user_input = input("You: ")
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\nGoodbye! 👋")
                break
            
            if not user_input.strip():
                continue
            
            # Process
            result = await hybrid_chat_engine.process_message(
                user_input=user_input,
                context=None
            )
            
            # Display
            emotion = result["emotion"]
            print(f"\n[{emotion['primary'].upper()} {emotion['confidence']:.0%}] Bot: {result['response']}\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"\nError: {str(e)}\n")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        # Interactive mode
        asyncio.run(quick_test())
    else:
        # Full test suite
        asyncio.run(test_hybrid_engine())
