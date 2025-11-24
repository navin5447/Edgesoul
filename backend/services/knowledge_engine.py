"""
Knowledge Engine using Ollama for local LLM inference.
Supports phi-3-mini, mistral-7b, and other Ollama models.
Completely offline-compatible after initial model download.
"""

from typing import Optional, Dict, List
from loguru import logger
import httpx
import json
from datetime import datetime

from models.knowledge import KnowledgeResponse
from core.config import settings  # Import settings for optimization


class KnowledgeEngine:
    """
    Local knowledge reasoning engine using Ollama.
    Provides factual answers using local LLM models.
    """
    
    def __init__(
        self,
        model_name: str = "phi3:mini",
        ollama_host: str = "http://localhost:11434",
        timeout: int = 60,
    ):
        """
        Initialize the Knowledge Engine.
        
        Args:
            model_name: Ollama model to use (phi3:mini, mistral:7b, llama2, etc.)
            ollama_host: Ollama API endpoint
            timeout: Request timeout in seconds
        """
        self.model_name = model_name
        self.ollama_host = ollama_host
        self.timeout = timeout
        self.is_available = False
        self._client = None
        
        logger.info(f"Initializing Knowledge Engine with model: {model_name}")
    
    async def initialize(self) -> bool:
        """
        Check if Ollama is running and model is available.
        Returns True if ready, False otherwise.
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check if Ollama is running
                response = await client.get(f"{self.ollama_host}/api/tags")
                
                if response.status_code == 200:
                    models_data = response.json()
                    available_models = [m["name"] for m in models_data.get("models", [])]
                    
                    logger.info(f"Ollama is running. Available models: {available_models}")
                    
                    # Check if our model is available
                    model_exists = any(
                        self.model_name in model or model.startswith(self.model_name.split(":")[0])
                        for model in available_models
                    )
                    
                    if model_exists:
                        self.is_available = True
                        logger.info(f"✓ Model '{self.model_name}' is ready")
                        return True
                    else:
                        logger.warning(
                            f"Model '{self.model_name}' not found. "
                            f"Run: ollama pull {self.model_name}"
                        )
                        return False
                else:
                    logger.warning("Ollama API responded with non-200 status")
                    return False
                    
        except httpx.ConnectError:
            logger.warning(
                f"Cannot connect to Ollama at {self.ollama_host}. "
                "Make sure Ollama is installed and running. "
                "Install from: https://ollama.ai"
            )
            return False
        except Exception as e:
            logger.error(f"Error initializing Knowledge Engine: {str(e)}")
            return False
    
    async def ask(
        self,
        question: str,
        context: Optional[str] = None,
        emotion: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 512,  # Increased default from 500 to 512
    ) -> KnowledgeResponse:
        """
        Ask a question and get a factual answer with optimized performance.
        
        Args:
            question: The question to answer
            context: Optional conversation context
            emotion: Optional detected emotion for tone adjustment
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum response length
            
        Returns:
            KnowledgeResponse with answer and metadata
        """
        if not self.is_available:
            logger.warning("Knowledge Engine not available, using fallback")
            return self._fallback_response(question)
        
        try:
            # Build the prompt
            prompt = self._build_prompt(question, context, emotion)
            
            # Call Ollama API
            start_time = datetime.now()
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.ollama_host}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": settings.OLLAMA_NUM_PREDICT,  # 512 tokens for longer responses
                            "num_ctx": settings.OLLAMA_NUM_CTX,          # 4096 context window
                            "num_batch": settings.OLLAMA_NUM_BATCH,      # 512 batch size
                            "num_gpu": settings.OLLAMA_NUM_GPU,          # GPU acceleration
                            "num_thread": settings.OLLAMA_NUM_THREAD,    # Multi-threading
                            "top_p": settings.OLLAMA_TOP_P,              # 0.9 nucleus sampling
                            "top_k": settings.OLLAMA_TOP_K,              # 40 top-k
                            "repeat_penalty": settings.OLLAMA_REPEAT_PENALTY,  # 1.1 repetition penalty
                            "stop": [],  # Don't stop early - let it complete
                            "presence_penalty": 0.0,
                            "frequency_penalty": 0.0
                        }
                    }
                )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "").strip()
                
                # Log token usage for debugging
                eval_count = result.get("eval_count", 0)
                logger.info(f"Generated {eval_count} tokens (max was {max_tokens})")
                
                # CRITICAL: Clean up special tokens that leak into responses
                # Remove template tokens like <|assistant|>, <|user|>, <|system|>, etc.
                import re
                answer = re.sub(r'<\|[^|]+\|>', '', answer).strip()
                
                # CRITICAL: Clean up dialogue-format responses
                # Remove "Assistant:" or "User:" prefixes
                dialogue_prefixes = ["Assistant:", "User:", "Human:", "AI:", "EdgeSoul:"]
                for prefix in dialogue_prefixes:
                    if answer.startswith(prefix):
                        answer = answer[len(prefix):].strip()
                
                # If response contains dialogue markers, take only the first response
                if "\nUser:" in answer or "\nAssistant:" in answer or "\nHuman:" in answer:
                    # Split and take only first part (EdgeSoul's response)
                    for marker in ["\nUser:", "\nAssistant:", "\nHuman:", "\nAI:"]:
                        if marker in answer:
                            answer = answer.split(marker)[0].strip()
                            break
                
                # CRITICAL: Filter out bad responses that leak system prompts or are too robotic
                bad_response_indicators = [
                    "I'm EdgeSoul, a knowledgeable and helpful AI assistant",
                    "Provide accurate, factual, and concise answers",
                    "Be friendly, helpful, and appropriate",
                    "system_instructions",
                    "As an AI language model",
                    "I'm an AI assistant",
                    "prompt_parts",
                    "User Question:",
                    "Your response:",
                    "Conversation Context:",
                    "Examples of good jokes:"
                ]
                
                # Check if response contains system prompt leakage
                if any(indicator in answer for indicator in bad_response_indicators):
                    logger.warning(f"AI leaked system prompt, using fallback for: {question}")
                    return self._fallback_response(question)
                
                # Check if response is suspiciously long (> 2000 words likely means it's confused)
                # IMPORTANT: Code responses can be very long, so high limit
                word_count = len(answer.split())
                if word_count > 2000:
                    logger.warning(f"AI response too long ({word_count} words), using fallback")
                    return self._fallback_response(question)
                
                # Calculate processing time
                elapsed = (datetime.now() - start_time).total_seconds()
                
                logger.info(f"Generated answer in {elapsed:.2f}s using {self.model_name}")
                
                return KnowledgeResponse(
                    response=answer,
                    context_used=context,
                    model_name=self.model_name,
                    tokens_used=result.get("eval_count", 0),
                )
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return self._fallback_response(question)
                
        except httpx.TimeoutException:
            logger.error("Request to Ollama timed out")
            return self._fallback_response(question)
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return self._fallback_response(question)
    
    def _build_prompt(
        self,
        question: str,
        context: Optional[str] = None,
        emotion: Optional[str] = None
    ) -> str:
        """Build prompt - direct question for best results."""
        # For coding questions, add instruction to give complete code
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['code', 'program', 'python', 'javascript', 'function', 'write', 'create']):
            # Coding question - ensure complete code response
            return f"{question}\n\nProvide the COMPLETE, working code with ALL necessary parts. Include comments and examples. Do NOT stop in the middle - give the FULL solution."
        
        # For ALL other questions - simple, direct prompt without special tokens
        # The special tokens were causing the model to include them in responses
        return f"Question: {question}\n\nAnswer:"
    
    def _fallback_response(self, query: str) -> KnowledgeResponse:
        """Fallback responses when Ollama is unavailable."""
        query_lower = query.lower()
        response = None
        
        # Learning & Education queries (check first - most specific)
        if any(x in query_lower for x in ["what can i learn", "what should i learn", "things to learn", "what to learn", "tell me what", "what could i learn"]):
            response = """Here are exciting things you can learn today:

**Programming & Tech:**
• Python - Great for beginners, used in AI, web development, data science
• JavaScript - Build interactive websites and web apps
• Git & GitHub - Version control for your projects
• SQL - Manage and query databases

**Data Science & AI:**
• Machine Learning basics - Understand AI fundamentals
• Data Analysis with Pandas - Work with data in Python
• Data Visualization - Create charts with Matplotlib/Plotly

**Web Development:**
• HTML & CSS - Build beautiful web pages
• React or Next.js - Modern web frameworks
• REST APIs - Connect frontend to backend

**Soft Skills:**
• Problem-solving with algorithms
• System design thinking
• Communication & presentation skills

**Pick one that interests you and start with small projects! What catches your attention?**"""
            return KnowledgeResponse(
                response=response,
                context_used=None,
                model_name="fallback",
                tokens_used=len(response.split()),
            )
        
        # How to learn / start questions
        if ("how to" in query_lower or "how do i" in query_lower or "how can i" in query_lower) and "learn" in query_lower:
            response = """To learn effectively:

1. **Choose Your Path**: Pick one topic that interests you most
2. **Start Small**: Learn basics before advanced concepts
3. **Practice Daily**: Even 30 minutes makes a difference
4. **Build Projects**: Apply what you learn in real projects
5. **Join Communities**: Connect with others learning the same thing

**Free Resources:**
• YouTube tutorials
• FreeCodeCamp.org
• Codecademy
• Official documentation
• GitHub projects

What specific topic interests you most? I can give you a focused learning path!"""
            return KnowledgeResponse(
                response=response,
                context_used=None,
                model_name="fallback",
                tokens_used=len(response.split()),
            )
        
        # Recommendations
        if any(x in query_lower for x in ["recommend", "suggest", "advice", "should i"]):
            response = """I can provide guidance! Here are some thoughts:

**For Learning:** Start with your interests and build practical projects
**For Programming:** Python or JavaScript are great first languages  
**For Career:** Focus on problem-solving skills and consistent practice
**For Projects:** Start small, finish what you start, then scale up

What specific area would you like recommendations for? I can give more targeted advice!"""
            return KnowledgeResponse(
                response=response,
                context_used=None,
                model_name="fallback",
                tokens_used=len(response.split()),
            )
        
        # Programming & Technology
        if "python" in query_lower and any(x in query_lower for x in ["what is", "define", "explain"]):
            response = "Python is a high-level, interpreted programming language created by Guido van Rossum in 1991. It emphasizes code readability with its use of significant indentation. Python is widely used for web development, data science, artificial intelligence, scientific computing, and automation."
        
        elif "javascript" in query_lower and any(x in query_lower for x in ["what is", "define"]):
            response = "JavaScript is a versatile, high-level programming language primarily used to create interactive web pages. It runs in web browsers and can also be used server-side with Node.js. It's one of the core technologies of the World Wide Web alongside HTML and CSS."
        
        elif "ai" in query_lower or "artificial intelligence" in query_lower:
            response = "Artificial Intelligence (AI) is the simulation of human intelligence by computer systems. It includes machine learning, natural language processing, computer vision, and robotics. AI systems learn from data, recognize patterns, and make decisions with minimal human intervention."
        
        # Politics & Geography
        elif "president" in query_lower and "india" in query_lower:
            response = "As of 2025, Droupadi Murmu is the President of India. She took office on July 25, 2022, becoming India's first tribal president and the second female president after Pratibha Patil."
        
        elif "prime minister" in query_lower and "india" in query_lower:
            response = "As of 2025, Narendra Modi is the Prime Minister of India. He has been serving since May 26, 2014, and is currently in his third term after winning the 2024 general elections."
        
        elif "capital" in query_lower:
            capitals = {
                "india": "New Delhi",
                "france": "Paris",
                "usa": "Washington, D.C.",
                "uk": "London",
                "japan": "Tokyo",
                "china": "Beijing",
                "germany": "Berlin",
                "italy": "Rome",
            }
            for country, capital in capitals.items():
                if country in query_lower:
                    response = f"The capital of {country.title()} is {capital}."
                    break
        
        # Science & Mathematics
        elif "photosynthesis" in query_lower:
            response = "Photosynthesis is the process by which green plants convert light energy (usually from sunlight) into chemical energy stored in glucose. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants absorb carbon dioxide and water, and produce glucose and oxygen."
        
        elif "fibonacci" in query_lower:
            response = "The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89... It appears frequently in nature, art, and mathematics. The sequence was introduced to Western mathematics by Leonardo Fibonacci in 1202."
        
        # Programming Code Examples
        elif "armstrong" in query_lower and "code" in query_lower:
            response = """Here's Python code to check Armstrong numbers:

```python
def is_armstrong(n):
    # Convert number to string to get digits
    digits = str(n)
    power = len(digits)
    
    # Calculate sum of digits raised to power
    total = sum(int(digit)**power for digit in digits)
    
    # Check if sum equals original number
    return total == n

# Test examples
print(is_armstrong(153))   # True: 1³+5³+3³ = 153
print(is_armstrong(9474))  # True: 9⁴+4⁴+7⁴+4⁴ = 9474
print(is_armstrong(123))   # False
```"""
        
        # Default fallback - try to be helpful
        if not response:
            response = f"""I understand you're asking: "{query}"

I can help with many topics! Try asking:
• **Programming**: "What is Python?", "Explain machine learning"
• **Science**: "How does photosynthesis work?"
• **Geography**: "Capital of India?", "Who is the president?"
• **Math**: "What is a prime number?", "Explain Fibonacci"
• **Learning**: "What can I learn today?", "How to start coding?"
• **Recommendations**: "What should I learn?"

Could you rephrase your question, or pick a topic you'd like to explore?"""
        
        return KnowledgeResponse(
            response=response,
            context_used=None,
            model_name="fallback",
            tokens_used=len(response.split()),
        )
    
    async def list_available_models(self) -> List[Dict[str, str]]:
        """Get list of available Ollama models."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_host}/api/tags")
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("models", [])
                return []
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            return []
    
    def is_ready(self) -> bool:
        """Check if engine is ready to use."""
        return self.is_available


# Global instance - can be configured via environment variables
knowledge_engine = KnowledgeEngine(
    model_name="phi3:mini",  # Better conversational model
    ollama_host="http://localhost:11434"
)
