"""
Test script for the Knowledge Engine with Ollama.
Run this to verify Ollama integration is working.
"""

import asyncio
from loguru import logger
from services.knowledge_engine import knowledge_engine


async def test_knowledge_engine():
    """Test the knowledge engine with various questions."""
    
    print("=" * 60)
    print("Testing Knowledge Engine with Ollama")
    print("=" * 60)
    
    # Initialize
    print("\n1. Initializing Knowledge Engine...")
    is_ready = await knowledge_engine.initialize()
    
    if is_ready:
        print("✓ Knowledge Engine is ready!")
        print(f"  Model: {knowledge_engine.model_name}")
        print(f"  Host: {knowledge_engine.ollama_host}")
    else:
        print("✗ Knowledge Engine not available")
        print("\nTo fix this:")
        print("  1. Install Ollama from: https://ollama.ai")
        print("  2. Run: ollama pull phi3:mini")
        print("  3. Make sure Ollama is running")
        print("\nUsing fallback responses for now...")
    
    # Test questions
    test_questions = [
        {
            "question": "What is Python programming language?",
            "emotion": None
        },
        {
            "question": "Explain machine learning in simple terms",
            "emotion": "joy"
        },
        {
            "question": "How does photosynthesis work?",
            "emotion": None
        },
        {
            "question": "Who is the president of India?",
            "emotion": "sadness"
        },
        {
            "question": "Write a simple Python function to check if a number is prime",
            "emotion": None
        }
    ]
    
    print("\n" + "=" * 60)
    print("Testing Questions")
    print("=" * 60)
    
    for i, test in enumerate(test_questions, 1):
        question = test["question"]
        emotion = test["emotion"]
        
        print(f"\n[Question {i}]")
        print(f"Q: {question}")
        if emotion:
            print(f"   (Detected emotion: {emotion})")
        
        print("\nGenerating answer...")
        
        try:
            response = await knowledge_engine.ask(
                question=question,
                emotion=emotion,
                temperature=0.7,
                max_tokens=300
            )
            
            print(f"\n[Answer]")
            print(f"{response.response}")
            print(f"\nMetadata:")
            print(f"  Model: {response.model_name}")
            print(f"  Tokens: {response.tokens_used}")
            
        except Exception as e:
            print(f"\n✗ Error: {str(e)}")
        
        print("\n" + "-" * 60)
    
    # List available models
    print("\n" + "=" * 60)
    print("Available Ollama Models")
    print("=" * 60)
    
    models = await knowledge_engine.list_available_models()
    
    if models:
        print(f"\nFound {len(models)} models:")
        for model in models:
            name = model.get("name", "Unknown")
            size = model.get("size", 0) / (1024**3)  # Convert to GB
            print(f"  • {name} ({size:.1f} GB)")
    else:
        print("\nNo models found or Ollama not running")
        print("Install models with: ollama pull phi3:mini")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)


async def quick_test():
    """Quick single question test."""
    
    print("\n🚀 Quick Test\n")
    
    # Initialize
    await knowledge_engine.initialize()
    
    # Ask a question
    question = "What is Python?"
    print(f"Q: {question}\n")
    
    response = await knowledge_engine.ask(question)
    
    print(f"A: {response.response}\n")
    print(f"Model: {response.model_name}")


if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # Quick test mode
        asyncio.run(quick_test())
    else:
        # Full test mode
        asyncio.run(test_knowledge_engine())
