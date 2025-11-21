"""
Quick test to verify Ollama is working with your bot
"""
import asyncio
from services.knowledge_engine import knowledge_engine
from services.emotion_service import emotion_service
from services.hybrid_chat_engine import hybrid_chat_engine

async def test_ollama():
    print("=" * 60)
    print("Testing Ollama Integration")
    print("=" * 60)
    
    # Initialize services
    print("\n1. Initializing services...")
    await emotion_service.load_model()
    await knowledge_engine.initialize()
    
    if knowledge_engine.is_available:
        print("   ✓ Ollama is READY!")
        print(f"   ✓ Model: {knowledge_engine.model_name}")
    else:
        print("   ✗ Ollama not available - using fallback")
    
    # Test questions
    test_questions = [
        "What is backward chaining?",
        "Explain quantum computing in simple terms",
        "How does blockchain work?",
    ]
    
    print("\n2. Testing Questions:")
    print("-" * 60)
    
    for question in test_questions:
        print(f"\n📝 Question: {question}")
        print("-" * 60)
        
        # Process with hybrid engine
        response = await hybrid_chat_engine.process_message(question)
        
        print(f"🤖 Response:\n{response['response'][:300]}...")
        print(f"\n📊 Metadata:")
        print(f"   - Model: {response['metadata']['model']}")
        
        # Handle processing_time which might be string or float
        proc_time = response['metadata']['processing_time']
        if isinstance(proc_time, str):
            print(f"   - Time: {proc_time}")
        else:
            print(f"   - Time: {proc_time:.2f}s")
        
        print(f"   - Type: {response['response_type']}")
        print()
    
    print("=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_ollama())
