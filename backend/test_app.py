"""
Test script for app.py endpoints
Run this to verify all endpoints are working
"""
import asyncio
import httpx
import json
from rich.console import Console
from rich.table import Table

console = Console()

BASE_URL = "http://localhost:8000"


async def test_health():
    """Test health endpoint"""
    console.print("\n[bold cyan]Testing /health endpoint...[/bold cyan]")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        data = response.json()
        
        console.print(f"Status: [green]{data['status']}[/green]")
        console.print(f"Services: {json.dumps(data['services'], indent=2)}")


async def test_analyze():
    """Test /analyze endpoint"""
    console.print("\n[bold cyan]Testing /analyze endpoint...[/bold cyan]")
    
    test_texts = [
        "I'm so happy today! 😊",
        "I'm feeling really sad and lonely...",
        "This makes me so angry!",
        "I'm scared about the future",
    ]
    
    async with httpx.AsyncClient() as client:
        for text in test_texts:
            console.print(f"\n📝 Text: [yellow]{text}[/yellow]")
            
            response = await client.post(
                f"{BASE_URL}/analyze",
                json={"text": text}
            )
            
            data = response.json()
            console.print(f"   Emotion: [green]{data['emotion']}[/green]")
            console.print(f"   Confidence: [green]{data['confidence']}%[/green]")
            console.print(f"   Time: {data['processing_time']}s")


async def test_chat():
    """Test /chat endpoint"""
    console.print("\n[bold cyan]Testing /chat endpoint...[/bold cyan]")
    
    test_messages = [
        "What is backward chaining?",
        "I'm feeling so happy today! 😊",
        "How does quantum computing work?",
        "I'm really sad and need someone to talk to",
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for message in test_messages:
            console.print(f"\n💬 User: [yellow]{message}[/yellow]")
            
            response = await client.post(
                f"{BASE_URL}/chat",
                json={"message": message}
            )
            
            data = response.json()
            console.print(f"   🤖 Bot: [green]{data['response'][:200]}...[/green]")
            console.print(f"   Emotion: {data['emotion']['primary']} ({data['emotion']['confidence']}%)")
            console.print(f"   Type: {data['response_type']}")
            console.print(f"   Time: {data['metadata']['total_processing_time']}s")


async def test_quick_analyze():
    """Test quick GET endpoint"""
    console.print("\n[bold cyan]Testing /analyze/{text} GET endpoint...[/bold cyan]")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/analyze/I am very excited!")
        data = response.json()
        
        console.print(f"Text: [yellow]{data['text']}[/yellow]")
        console.print(f"Emotion: [green]{data['emotion']}[/green] ({data['confidence']}%)")


async def test_models():
    """Test /models endpoint"""
    console.print("\n[bold cyan]Testing /models endpoint...[/bold cyan]")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/models")
        data = response.json()
        
        console.print(f"Status: [green]{data['status']}[/green]")
        console.print(f"Current Model: [green]{data['current_model']}[/green]")
        
        if 'available_models' in data:
            console.print(f"Available: {data['available_models']}")


async def main():
    """Run all tests"""
    console.print("[bold green]═" * 60 + "[/bold green]")
    console.print("[bold green]EdgeSoul API Test Suite[/bold green]")
    console.print("[bold green]═" * 60 + "[/bold green]")
    
    try:
        await test_health()
        await test_analyze()
        await test_quick_analyze()
        await test_models()
        await test_chat()
        
        console.print("\n[bold green]✅ All tests completed![/bold green]")
        
    except httpx.ConnectError:
        console.print("\n[bold red]❌ Error: Cannot connect to API[/bold red]")
        console.print("Make sure the server is running:")
        console.print("  python app.py")
        
    except Exception as e:
        console.print(f"\n[bold red]❌ Error: {e}[/bold red]")


if __name__ == "__main__":
    # Install rich if needed: pip install rich
    asyncio.run(main())
