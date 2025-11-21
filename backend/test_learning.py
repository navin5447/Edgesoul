"""Quick test for the learning question"""
import asyncio
from services.knowledge_engine import knowledge_engine

async def test():
    # Initialize
    await knowledge_engine.initialize()
    
    # Test questions
    questions = [
        "what things can I learn today?",
        "tell me what I should learn",
        "how to learn programming?",
        "What is Python?",
        "recommend something for me"
    ]
    
    for q in questions:
        print(f"\n{'='*60}")
        print(f"Q: {q}")
        print(f"{'='*60}")
        result = await knowledge_engine.ask(q)
        print(result.response)
        print()

if __name__ == "__main__":
    asyncio.run(test())
