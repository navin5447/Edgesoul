"""Test the exact question from your conversation"""
import asyncio
from services.hybrid_chat_engine import hybrid_chat_engine
from services.emotion_service import emotion_service
from services.knowledge_engine import knowledge_engine

async def test():
    # Initialize
    print("Initializing...")
    await emotion_service.load_model()
    await knowledge_engine.initialize()
    
    # Test the exact question
    question = "then tell me what things could i learn today"
    
    print(f"\n{'='*70}")
    print(f"Testing: '{question}'")
    print(f"{'='*70}\n")
    
    result = await hybrid_chat_engine.process_message(
        user_input=question,
        context="Previous: User was very happy",
        temperature=0.7
    )
    
    print(f"Emotion: {result['emotion']['primary'].upper()} ({result['emotion']['confidence']:.0%})")
    print(f"Type: {result['response_type']}")
    print(f"\nResponse:")
    print(f"{'-'*70}")
    print(result['response'])
    print(f"{'-'*70}")

if __name__ == "__main__":
    asyncio.run(test())
