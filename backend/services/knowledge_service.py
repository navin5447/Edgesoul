from typing import Optional
from loguru import logger
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import os

from core.config import settings
from models.knowledge import KnowledgeResponse
from services.knowledge_engine import knowledge_engine


class KnowledgeService:
    """Service for knowledge reasoning using LLM."""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.is_loaded = False
        self.model_name = "gpt2"  # Default fallback model
    
    async def load_model(self):
        """Load the knowledge reasoning model."""
        try:
            logger.info("Loading knowledge reasoning model...")
            
            # Try to initialize Ollama-based knowledge engine
            if await knowledge_engine.initialize():
                logger.info("✓ Ollama knowledge engine initialized successfully")
                self.is_loaded = True
                return
            
            # Fall back to other methods if Ollama not available
            if settings.USE_LOCAL_LLM:
                logger.info("Ollama not available, attempting to load local LLM...")
                # Use a local model (GPT-2 for demo, replace with Llama 2 or similar)
                self.model_name = "gpt2"  # or "meta-llama/Llama-2-7b-chat-hf"
                
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
                
                # Move to GPU if available
                if torch.cuda.is_available():
                    self.model = self.model.cuda()
                    logger.info("Knowledge model loaded on GPU")
                else:
                    logger.info("Knowledge model loaded on CPU")
                
                self.model.eval()
                
                # Create pipeline for easier inference
                self.pipeline = pipeline(
                    "text-generation",
                    model=self.model,
                    tokenizer=self.tokenizer,
                    device=0 if torch.cuda.is_available() else -1,
                )
            else:
                logger.info("Using API-based LLM or fallback responses")
            
            self.is_loaded = True
            logger.info("Knowledge reasoning model loaded successfully")
        
        except Exception as e:
            logger.error(f"Failed to load knowledge model: {str(e)}")
            raise
    
    async def generate_response(
        self,
        query: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        emotion: Optional[str] = None,
    ) -> KnowledgeResponse:
        """
        Generate a response using the knowledge reasoning model.
        """
        # Try Ollama-based knowledge engine first
        if knowledge_engine.is_ready():
            logger.info("Using Ollama knowledge engine")
            return await knowledge_engine.ask(
                question=query,
                context=context,
                emotion=emotion,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        
        # Fall back to other methods
        if not settings.USE_LOCAL_LLM or not self.is_loaded:
            logger.info("Using fallback knowledge base")
            return self._fallback_response(query)
        
        try:
            if settings.USE_LOCAL_LLM:
                return await self._generate_local(query, context, temperature, max_tokens, emotion)
            else:
                return await self._generate_api(query, context, temperature, max_tokens)
        
        except Exception as e:
            logger.error(f"Error in knowledge generation: {str(e)}")
            return self._fallback_response(query)
    
    async def _generate_local(
        self,
        query: str,
        context: Optional[str],
        temperature: float,
        max_tokens: int,
        emotion: Optional[str] = None,
    ) -> KnowledgeResponse:
        """Generate response using local model."""
        # Build prompt
        prompt = self._build_prompt(query, context, emotion)
        
        # Generate response
        outputs = self.pipeline(
            prompt,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            top_p=0.9,
            num_return_sequences=1,
        )
        
        generated_text = outputs[0]["generated_text"]
        
        # Extract only the response (remove prompt)
        response_text = generated_text[len(prompt):].strip()
        
        return KnowledgeResponse(
            response=response_text,
            context_used=context,
            model_name=self.model_name,
            tokens_used=len(response_text.split()),
        )
    
    async def _generate_api(
        self,
        query: str,
        context: Optional[str],
        temperature: float,
        max_tokens: int,
    ) -> KnowledgeResponse:
        """Generate response using API-based model (OpenAI, Anthropic, etc.)."""
        try:
            # Try OpenAI first
            if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                
                messages = [
                    {"role": "system", "content": "You are EdgeSoul, a helpful AI assistant with emotion awareness."},
                ]
                
                if context:
                    messages.append({"role": "system", "content": f"Context: {context}"})
                
                messages.append({"role": "user", "content": query})
                
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                return KnowledgeResponse(
                    response=response.choices[0].message.content,
                    context_used=context,
                    model_name="gpt-3.5-turbo",
                    tokens_used=response.usage.total_tokens,
                )
            
            # Try Anthropic Claude
            elif hasattr(settings, 'ANTHROPIC_API_KEY') and settings.ANTHROPIC_API_KEY:
                from anthropic import AsyncAnthropic
                client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                
                prompt = query
                if context:
                    prompt = f"Context: {context}\n\nQuestion: {query}"
                
                response = await client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=max_tokens,
                    temperature=temperature,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                return KnowledgeResponse(
                    response=response.content[0].text,
                    context_used=context,
                    model_name="claude-3-haiku",
                    tokens_used=response.usage.input_tokens + response.usage.output_tokens,
                )
            
            # Fallback to local response
            else:
                logger.info("No API keys configured, using fallback responses")
                return self._fallback_response(query)
        
        except Exception as e:
            logger.error(f"Error in API-based generation: {e}")
            return self._fallback_response(query)
    
    def _build_prompt(self, query: str, context: Optional[str] = None, emotion: Optional[str] = None) -> str:
        """Build a prompt for the model."""
        base_prompt = "You are EdgeSoul, a helpful and empathetic AI assistant.\n\n"
        
        if emotion:
            base_prompt += f"The user's emotional state is: {emotion}\n"
            base_prompt += "Please provide a factual answer while being sensitive to their emotional state.\n\n"
        
        if context:
            base_prompt += f"Context:\n{context}\n\n"
        
        base_prompt += f"User: {query}\nAssistant:"
        
        return base_prompt
    
    def _fallback_response(self, query: str) -> KnowledgeResponse:
        """Fallback response when model is unavailable - provides answers to common questions."""
        query_lower = query.lower()
        response = None
        
        # Politics & Government
        if "president" in query_lower and "india" in query_lower:
            response = "As of 2025, Droupadi Murmu is the President of India. She took office on July 25, 2022, becoming India's first tribal president and second female president."
        elif "prime minister" in query_lower and "india" in query_lower:
            response = "As of 2025, Narendra Modi is the Prime Minister of India. He has been serving since May 2014 and is currently in his third term."
        elif "president" in query_lower and ("usa" in query_lower or "america" in query_lower):
            response = "As of 2025, the President of the United States is elected every four years. For the most current information, please check recent news sources."
        
        # Geography - Capitals
        elif "capital" in query_lower:
            if "india" in query_lower:
                response = "The capital of India is New Delhi, located in the northern part of the country."
            elif "france" in query_lower:
                response = "The capital of France is Paris, known as the 'City of Light' and famous for the Eiffel Tower."
            elif "usa" in query_lower or "america" in query_lower:
                response = "The capital of the United States is Washington, D.C., which stands for District of Columbia."
            elif "japan" in query_lower:
                response = "The capital of Japan is Tokyo, one of the world's most populous metropolitan areas."
            elif "china" in query_lower:
                response = "The capital of China is Beijing, a major cultural and political center."
            elif "uk" in query_lower or "england" in query_lower or "britain" in query_lower:
                response = "The capital of the United Kingdom is London, a global financial and cultural hub."
            else:
                response = "I can help you find capital cities! Please specify which country you're asking about."
        
        # Programming & Technology
        elif "python" in query_lower:
            if "what is" in query_lower or "define" in query_lower:
                response = "Python is a high-level, interpreted programming language created by Guido van Rossum in 1991. It's known for its simple, readable syntax and is widely used for web development, data science, AI, machine learning, automation, and scientific computing."
            elif "learn" in query_lower or "start" in query_lower:
                response = "To learn Python: 1) Install Python from python.org, 2) Start with basics like variables, data types, and loops, 3) Practice with online platforms like CodeAcademy, LeetCode, or HackerRank, 4) Build small projects to apply your knowledge."
        elif "javascript" in query_lower and ("what is" in query_lower or "define" in query_lower):
            response = "JavaScript is a versatile programming language primarily used for web development. It runs in browsers to make websites interactive and is also used for server-side development (Node.js), mobile apps, and more."
        elif "ai" in query_lower and ("what is" in query_lower or "define" in query_lower or "artificial intelligence" in query_lower):
            response = "Artificial Intelligence (AI) is the simulation of human intelligence by machines. It includes machine learning, natural language processing, computer vision, and robotics. AI systems can learn from data, recognize patterns, and make decisions."
        elif "machine learning" in query_lower and ("what is" in query_lower or "define" in query_lower):
            response = "Machine Learning is a subset of AI that enables computers to learn from data without being explicitly programmed. It uses algorithms to identify patterns and make predictions or decisions based on data."
        
        # Mathematics & Science
        elif "armstrong" in query_lower and "number" in query_lower:
            if "code" in query_lower or "program" in query_lower or "python" in query_lower:
                response = "Here's Python code for Armstrong number:\n\n```python\ndef is_armstrong(n):\n    digits = str(n)\n    power = len(digits)\n    total = sum(int(d)**power for d in digits)\n    return total == n\n\n# Example: Check 153\nprint(is_armstrong(153))  # True (1³+5³+3³=153)\n```"
            else:
                response = "An Armstrong number (narcissistic number) equals the sum of its digits raised to the power of the number of digits. Examples: 153 (1³+5³+3³=153), 9474 (9⁴+4⁴+7⁴+4⁴=9474), 370, 371, 407."
        elif "fibonacci" in query_lower:
            if "code" in query_lower or "program" in query_lower:
                response = "Here's Python code for Fibonacci sequence:\n\n```python\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b\n\nfibonacci(10)  # Prints: 0 1 1 2 3 5 8 13 21 34\n```"
            else:
                response = "The Fibonacci sequence is a series where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55... It appears frequently in nature and mathematics."
        elif "prime number" in query_lower:
            if "code" in query_lower or "program" in query_lower:
                response = "Here's Python code to check prime numbers:\n\n```python\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nprint(is_prime(17))  # True\n```"
            else:
                response = "A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. Examples: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29..."
        elif "photosynthesis" in query_lower:
            response = "Photosynthesis is the process by which plants convert light energy (usually from the sun) into chemical energy stored in glucose. The equation is: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Plants use carbon dioxide and water to produce glucose and oxygen."
        
        # General Knowledge
        elif "who invented" in query_lower or "who discovered" in query_lower:
            if "internet" in query_lower:
                response = "The internet was developed through contributions from many scientists. Key figures include: Tim Berners-Lee (invented the World Wide Web in 1989), Vint Cerf and Bob Kahn (TCP/IP protocol), and ARPANET researchers in the 1960s."
            elif "telephone" in query_lower:
                response = "Alexander Graham Bell is credited with inventing the telephone in 1876, though there were other inventors like Elisha Gray working on similar technology at the same time."
            elif "electricity" in query_lower or "light bulb" in query_lower:
                response = "Thomas Edison is famous for inventing the practical incandescent light bulb in 1879, though many scientists like Nikola Tesla, Benjamin Franklin, and others contributed to understanding electricity."
        elif "when" in query_lower and "independence" in query_lower and "india" in query_lower:
            response = "India gained independence from British rule on August 15, 1947. This day is celebrated annually as Independence Day in India."
        elif "how many" in query_lower and ("states" in query_lower or "union territories" in query_lower) and "india" in query_lower:
            response = "India has 28 states and 8 union territories as of 2025. The most recent changes were the reorganization of Jammu and Kashmir into two union territories in 2019."
        
        # How-to questions
        elif "how to" in query_lower:
            if "learn programming" in query_lower or "learn coding" in query_lower:
                response = "To learn programming: 1) Choose a beginner-friendly language (Python, JavaScript), 2) Learn basics: variables, loops, functions, 3) Practice daily on platforms like LeetCode, HackerRank, 4) Build small projects, 5) Read others' code, 6) Join coding communities. Start with free resources like freeCodeCamp, Codecademy, or YouTube tutorials."
            elif "write" in query_lower and ("email" in query_lower or "letter" in query_lower):
                response = "To write a professional email: 1) Use a clear subject line, 2) Start with a proper greeting (Dear/Hi), 3) State your purpose in the first paragraph, 4) Keep it concise and organized, 5) End with a call-to-action if needed, 6) Close professionally (Best regards/Sincerely), 7) Proofread before sending."
        
        # If no match found
        if not response:
            # Try to provide a helpful response based on question words
            if any(word in query_lower for word in ["who", "what", "when", "where", "why", "how"]):
                response = f"That's a great question! While I can answer many common questions about programming, science, geography, and general knowledge, I don't have specific information about '{query}' in my current knowledge base. For the most accurate answer, I recommend searching on Google or Wikipedia."
            else:
                response = "I'm here to help! I can answer questions about programming, mathematics, science, geography, history, and more. Try asking me things like 'What is Python?', 'Who is the president of India?', or 'How to learn programming?'"
        
        return KnowledgeResponse(
            response=response,
            context_used=None,
            model_name="fallback_knowledge_base",
            tokens_used=len(response.split()),
        )
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded."""
        return self.is_loaded
    
    async def unload_model(self):
        """Unload the model to free memory."""
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self.is_loaded = False
        logger.info("Knowledge reasoning model unloaded")


# Global instance
knowledge_service = KnowledgeService()
