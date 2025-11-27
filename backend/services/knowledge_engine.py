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
        timeout: int = 30,
    ):
        """
        Initialize the Knowledge Engine with dual-model strategy.
        
        Args:
            model_name: Default quality model (phi3:mini)
            ollama_host: Ollama API endpoint
            timeout: Default request timeout in seconds
        """
        self.model_quality = settings.OLLAMA_MODEL_QUALITY  # phi3:mini for complex
        self.model_fast = settings.OLLAMA_MODEL_FAST        # tinyllama for simple
        self.ollama_host = ollama_host
        self.timeout = timeout
        self.is_available = False
        self._client = None
        
        logger.info(f"Initializing Knowledge Engine - Fast: {self.model_fast}, Quality: {self.model_quality}")
    
    async def initialize(self) -> bool:
        """
        Check if Ollama is running and both models are available.
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
                    
                    # Check if at least one model is available
                    fast_exists = any(
                        self.model_fast in model or model.startswith(self.model_fast.split(":")[0])
                        for model in available_models
                    )
                    quality_exists = any(
                        self.model_quality in model or model.startswith(self.model_quality.split(":")[0])
                        for model in available_models
                    )
                    
                    if fast_exists or quality_exists:
                        self.is_available = True
                        if fast_exists and quality_exists:
                            logger.info(f"✓ Both models ready: {self.model_fast}, {self.model_quality}")
                        elif fast_exists:
                            logger.info(f"✓ Fast model ready: {self.model_fast}")
                        else:
                            logger.info(f"✓ Quality model ready: {self.model_quality}")
                        return True
                    else:
                        logger.warning(
                            f"No models found. Run: ollama pull {self.model_fast} && ollama pull {self.model_quality}"
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
        temperature: float = 0.3,  # Lower = faster
        max_tokens: int = 150,
    ) -> KnowledgeResponse:
        """
        Ask a question with smart model selection and streaming for speed.
        
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
            question_lower = question.lower()
            
            # FAST KNOWLEDGE BASE: Check if it's a simple factual question we can answer instantly
            fallback = self._check_simple_facts(question_lower)
            if fallback:
                logger.info(f"⚡ INSTANT ANSWER from knowledge base (<1ms)")
                return KnowledgeResponse(
                    response=fallback,
                    context_used=None,
                    model_name="instant_knowledge_base",
                    tokens_used=len(fallback.split())
                )
            
            # SMART MODEL SELECTION: Quality vs Speed
            
            # CODE/PROGRAMMING requests - ALWAYS use phi3:mini (better quality)
            code_keywords = [
                'code', 'program', 'python', 'javascript', 'java', 'function',
                'write a', 'create a', 'build a', 'develop', 'script',
                'api', 'algorithm', 'class', 'method', 'loop'
            ]
            
            # COMPLEX questions - use phi3:mini
            complex_keywords = [
                'explain', 'why', 'how does', 'how can', 'compare',
                'difference between', 'analyze', 'what is', 'tell me about',
                'describe', 'discuss', 'elaborate',
                'want to learn', 'learn something', 'teach me', 'i want to'
            ]
            
            # SIMPLE questions - REMOVED tinyllama (it's useless)
            # Just checking for greetings that should get instant responses elsewhere
            simple_keywords = []
            
            # Determine which model to use - ALWAYS phi3:mini (tinyllama disabled)
            is_code = any(kw in question_lower for kw in code_keywords)
            is_complex = any(kw in question_lower for kw in complex_keywords)
            
            # Choose model and settings - phi3:mini with INCREASED tokens for complete responses
            if is_code:
                # Code generation - need enough tokens for complete code
                model = self.model_quality
                num_predict = 400  # Increased for complete code responses
                timeout = 90  # Increased timeout for longer responses
                logger.info(f"🔧 CODE REQUEST → Using {model} (400 tokens, ~60s)")
            elif is_complex:
                # Complex questions - need detailed explanations
                model = self.model_quality
                num_predict = 350  # Enough for detailed answers
                timeout = 75
                logger.info(f"🧠 COMPLEX REQUEST → Using {model} (350 tokens, ~50s)")
            else:
                # Default: allow complete responses
                model = self.model_quality
                num_predict = 300  # Prevent cutting off mid-sentence
                timeout = 60
                logger.info(f"📚 DEFAULT REQUEST → Using {model} (300 tokens, ~45s)")
            
            # Build the prompt
            prompt = self._build_prompt(question, context, emotion)
            
            # STREAMING: Generate with streaming for instant response
            start_time = datetime.now()
            answer = ""
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_host}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": True,  # Enable streaming
                        "options": {
                            "temperature": settings.OLLAMA_TEMPERATURE,  # 0.3 for speed
                            "num_predict": num_predict,
                            "num_ctx": settings.OLLAMA_NUM_CTX,      # 2048 context
                            "num_batch": settings.OLLAMA_NUM_BATCH,
                            "num_gpu": settings.OLLAMA_NUM_GPU,
                            "num_thread": settings.OLLAMA_NUM_THREAD,
                            "top_p": settings.OLLAMA_TOP_P,          # 0.8
                            "top_k": settings.OLLAMA_TOP_K,
                            "repeat_penalty": settings.OLLAMA_REPEAT_PENALTY,
                        }
                    },
                ) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line.strip():
                                try:
                                    chunk = json.loads(line)
                                    answer += chunk.get("response", "")
                                    
                                    # Stop if done
                                    if chunk.get("done", False):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    else:
                        logger.error(f"Ollama API error: {response.status_code}")
                        return self._fallback_response(question)
            
            # Clean up the response
            answer = answer.strip()
            
            # CRITICAL: Clean up special tokens that leak into responses
            import re
            answer = re.sub(r'<\|[^|]+\|>', '', answer).strip()
            
            # CRITICAL: Clean up dialogue-format responses
            dialogue_prefixes = ["Assistant:", "User:", "Human:", "AI:", "EdgeSoul:"]
            for prefix in dialogue_prefixes:
                if answer.startswith(prefix):
                    answer = answer[len(prefix):].strip()
            
            # If response contains dialogue markers, take only the first response
            if "\nUser:" in answer or "\nAssistant:" in answer or "\nHuman:" in answer:
                for marker in ["\nUser:", "\nAssistant:", "\nHuman:", "\nAI:"]:
                    if marker in answer:
                        answer = answer.split(marker)[0].strip()
                        break
            
            # CRITICAL: Filter out bad responses that leak system prompts
            bad_response_indicators = [
                "I'm EdgeSoul, a knowledgeable and helpful AI assistant",
                "Provide accurate, factual, and concise answers",
                "system_instructions",
                "As an AI language model",
                "I'm an AI assistant",
            ]
            
            if any(indicator in answer for indicator in bad_response_indicators):
                logger.warning(f"AI leaked system prompt, using fallback for: {question}")
                return self._fallback_response(question)
            
            # Check if response is suspiciously long
            word_count = len(answer.split())
            if word_count > 2000:
                logger.warning(f"AI response too long ({word_count} words), using fallback")
                return self._fallback_response(question)
            
            # Calculate processing time
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(f"✓ Generated answer in {elapsed:.2f}s using {model}")
            
            return KnowledgeResponse(
                response=answer,
                context_used=context,
                model_name=model,
                tokens_used=len(answer.split()),  # Approximate token count
            )
                
        except httpx.TimeoutException:
            logger.error("Request to Ollama timed out")
            return self._fallback_response(question)
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return self._fallback_response(question)
    
    def _check_simple_facts(self, question_lower: str) -> Optional[str]:
        """
        Check if question can be answered from simple knowledge base (instant, no LLM needed).
        ONLY for FACTUAL questions - emotional questions handled by intelligent_reply_engine.
        Returns answer string if found, None otherwise.
        """
        # ==================== CATEGORY 1: PERSONAL ADVICE & LIFE ====================
        
        if "improve communication skills" in question_lower or "improve my communication" in question_lower:
            return "To improve communication: 1) Listen actively without interrupting, 2) Practice clear and concise speaking, 3) Read body language, 4) Ask questions to understand better, 5) Practice with friends or in front of a mirror, 6) Join public speaking groups like Toastmasters."
        
        if "overcome overthinking" in question_lower or "stop overthinking" in question_lower:
            return "To overcome overthinking: 1) Practice mindfulness and meditation, 2) Set a time limit for decisions, 3) Focus on solutions, not problems, 4) Write down your thoughts to clear your mind, 5) Stay present in the moment, 6) Accept that you can't control everything."
        
        if "become more confident" in question_lower or "build confidence" in question_lower:
            return "To build confidence: 1) Set small achievable goals, 2) Practice positive self-talk, 3) Improve your skills through learning, 4) Dress well and maintain good posture, 5) Face your fears gradually, 6) Celebrate small wins, 7) Surround yourself with supportive people."
        
        if "stay motivated" in question_lower or "keep motivated" in question_lower:
            return "To stay motivated: 1) Set clear, meaningful goals, 2) Break big goals into small tasks, 3) Track your progress visually, 4) Reward yourself for milestones, 5) Find an accountability partner, 6) Remember your 'why', 7) Take breaks to avoid burnout."
        
        if "manage time better" in question_lower or "time management" in question_lower:
            return "For better time management: 1) Use the Eisenhower Matrix (urgent vs important), 2) Time-block your calendar, 3) Eliminate distractions, 4) Use the Pomodoro Technique (25min focus + 5min break), 5) Prioritize tasks by impact, 6) Say 'no' to non-essential tasks."
        
        if "stop procrastinating" in question_lower or "overcome procrastination" in question_lower:
            return "To stop procrastinating: 1) Start with just 2 minutes (2-minute rule), 2) Break tasks into tiny steps, 3) Remove distractions, 4) Use the '5-4-3-2-1 Go!' technique, 5) Make tasks fun or rewarding, 6) Work during your peak energy hours."
        
        if "improve public speaking" in question_lower or "public speaking" in question_lower:
            return "To improve public speaking: 1) Practice your speech multiple times, 2) Know your material inside-out, 3) Start with small audiences, 4) Make eye contact and use gestures, 5) Speak slowly and clearly, 6) Join Toastmasters or similar groups, 7) Record yourself to identify areas to improve."
        
        if "build good habits" in question_lower or "create good habits" in question_lower:
            return "To build good habits: 1) Start small (1% better daily), 2) Stack new habits onto existing ones, 3) Make it obvious (visual cues), 4) Make it easy (reduce friction), 5) Track your progress, 6) Be consistent for 21-66 days, 7) Don't break the chain."
        
        if "deal with stress" in question_lower or "manage stress" in question_lower:
            return "To manage stress: 1) Practice deep breathing exercises, 2) Exercise regularly (even 10min walks help), 3) Get 7-8 hours sleep, 4) Talk to friends or a therapist, 5) Practice mindfulness/meditation, 6) Limit caffeine and alcohol, 7) Take breaks and do hobbies."
        
        # ==================== CATEGORY 2: LEARNING & EDUCATION ====================
        
        if "study effectively" in question_lower or "how to study" in question_lower:
            return "Study effectively: 1) Use active recall (test yourself), 2) Spaced repetition (review at intervals), 3) Pomodoro technique (25min focus), 4) Teach concepts to others, 5) Take handwritten notes, 6) Eliminate distractions, 7) Study in short, focused sessions."
        
        if "improve my english" in question_lower or "improve english" in question_lower:
            return "To improve English: 1) Read books, news, articles daily, 2) Watch English movies/shows with subtitles, 3) Practice speaking with language partners, 4) Write daily (journal, blog, essays), 5) Use apps like Duolingo or HelloTalk, 6) Learn 5 new words daily, 7) Think in English."
        
        # ==================== CATEGORY 3: CODING & TECHNOLOGY ====================
        
        if "what language should i learn" in question_lower and "program" in question_lower:
            return "Best programming languages for beginners: **Python** (easiest, most versatile), **JavaScript** (web development), **Java** (enterprise apps), **C++** (systems/games). For 2025: Python for AI/data, JavaScript for web, Go for cloud, Rust for performance."
        
        if "start with machine learning" in question_lower or "learn machine learning" in question_lower:
            return "To start machine learning: 1) Learn Python basics first, 2) Study math (linear algebra, statistics), 3) Take Andrew Ng's ML course (Coursera), 4) Learn libraries: NumPy, Pandas, scikit-learn, 5) Practice on Kaggle datasets, 6) Build small projects, 7) Understand neural networks basics."
        
        if "how does ai work" in question_lower or "explain ai" in question_lower:
            return "AI (Artificial Intelligence) works by training computer models on large datasets to recognize patterns and make predictions. It uses algorithms like neural networks (inspired by human brains) to learn from examples. Types: Machine Learning (learns from data), Deep Learning (complex neural networks), NLP (understands language)."
        
        if "what is api" in question_lower:
            return "API (Application Programming Interface) is a way for different software to communicate. Think of it as a waiter in a restaurant: you (app) tell the waiter (API) what you want, the waiter tells the kitchen (server), and brings back your food (data). APIs let apps share data and functionality."
        
        # ==================== CATEGORY 4: PRODUCTIVITY & TOOLS ====================
        
        if "how to be more organized" in question_lower or "get organized" in question_lower:
            return "To be more organized: 1) Use a task manager (Todoist, Notion), 2) Keep a daily calendar, 3) Declutter your workspace weekly, 4) Use folders and labels for files, 5) Plan your week every Sunday, 6) Follow the 'touch it once' rule, 7) Automate repetitive tasks."
        
        if "productivity apps" in question_lower or "suggest apps for productivity" in question_lower:
            return "Top productivity apps: **Notion** (all-in-one workspace), **Todoist** (task management), **Obsidian** (note-taking), **RescueTime** (time tracking), **Forest** (focus timer), **Grammarly** (writing), **Pocket** (read later), **Calendly** (scheduling)."
        
        # ==================== CATEGORY 5: BUSINESS & CAREER ====================
        
        if "start a business" in question_lower or "how to start business" in question_lower:
            return "To start a business: 1) Identify a problem to solve, 2) Research your market and competitors, 3) Create a simple MVP (minimum viable product), 4) Validate with real customers, 5) Start small (don't quit your job yet), 6) Register your business legally, 7) Focus on one niche first."
        
        if "earn money online" in question_lower or "make money online" in question_lower:
            return "Ways to earn online: 1) Freelancing (Upwork, Fiverr) - writing, design, coding, 2) Online tutoring (Chegg, Preply), 3) Content creation (YouTube, blogging), 4) Selling digital products (courses, ebooks), 5) Dropshipping or print-on-demand, 6) Affiliate marketing, 7) Virtual assistant services."
        
        if "skills for the future" in question_lower or "best skills" in question_lower:
            return "Future-proof skills: **Tech**: AI/ML, cloud computing, cybersecurity, data analysis. **Soft skills**: Critical thinking, creativity, emotional intelligence, adaptability. **Business**: Digital marketing, product management, sales. **Emerging**: Prompt engineering, blockchain, green tech."
        
        if "how to negotiate salary" in question_lower or "negotiate salary" in question_lower:
            return "Salary negotiation tips: 1) Research market rates (Glassdoor, PayScale), 2) Know your value and achievements, 3) Let them make the first offer, 4) Ask for 10-20% more than desired, 5) Focus on total package (benefits, WFH, PTO), 6) Practice your pitch, 7) Be ready to walk away."
        
        # ==================== CATEGORY 6: CREATIVE WRITING ====================
        
        # (Kept short - creative requests need LLM generation)
        
        # ==================== CATEGORY 7: ENTERTAINMENT & FITNESS ====================
        
        if "how to lose weight" in question_lower or "lose weight" in question_lower:
            return "To lose weight healthily: 1) Calorie deficit (eat less than you burn), 2) Eat whole foods (protein, veggies, fruits), 3) Drink 2-3L water daily, 4) Exercise 30min daily (cardio + strength), 5) Sleep 7-8 hours, 6) Avoid sugary drinks, 7) Track your food intake. Aim for 0.5-1kg/week loss."
        
        if "gym routine for beginners" in question_lower or "start gym" in question_lower:
            return "Beginner gym routine (3x/week): **Day 1**: Chest & triceps (bench press, pushups, dips). **Day 2**: Back & biceps (rows, pull-ups, curls). **Day 3**: Legs & shoulders (squats, lunges, overhead press). Start with 3 sets x 8-12 reps. Add 20min cardio. Rest 1-2 days between."
        
        # ==================== CATEGORY 8: FINANCE & MONEY ====================
        
        if "how to save money" in question_lower or "save money" in question_lower:
            return "To save money: 1) Follow 50/30/20 rule (50% needs, 30% wants, 20% savings), 2) Automate savings (pay yourself first), 3) Track all expenses, 4) Cut subscriptions you don't use, 5) Cook at home, 6) Use cashback apps, 7) Set specific savings goals."
        
        if "how to invest" in question_lower or "start investing" in question_lower:
            return "Investing basics: 1) Start with emergency fund (3-6 months expenses), 2) Pay off high-interest debt first, 3) Learn about stocks, bonds, mutual funds, ETFs, 4) Start with index funds (low risk, diversified), 5) Use apps like Vanguard, Fidelity, 6) Invest regularly (dollar-cost averaging), 7) Think long-term (10+ years)."
        
        if "explain stocks" in question_lower or "what are stocks" in question_lower:
            return "Stocks are shares of ownership in a company. When you buy a stock, you own a small piece of that company. You make money through: 1) **Dividends** (company profits shared with shareholders), 2) **Price appreciation** (sell stock for more than you paid). Risk: prices can go up or down based on company performance."
        
        if "passive income" in question_lower:
            return "Passive income ideas: 1) Dividend stocks/index funds, 2) Rental property or REITs, 3) Create online courses (Udemy, Teachable), 4) Write ebooks (Amazon KDP), 5) Affiliate marketing, 6) Print-on-demand products, 7) YouTube ad revenue, 8) License your photos/music. Note: Most require initial effort!"
        
        # ==================== CATEGORY 9: RELATIONSHIP ADVICE ====================
        
        if "handle breakup" in question_lower or "deal with breakup" in question_lower:
            return "Handling breakups: 1) Allow yourself to grieve, 2) Cut contact temporarily (no stalking socials), 3) Lean on friends and family, 4) Focus on self-improvement, 5) Exercise and stay active, 6) Don't rush into new relationship, 7) Learn from the experience. Remember: time heals everything. 💙"
        
        if "make new friends" in question_lower or "how to make friends" in question_lower:
            return "To make new friends: 1) Join clubs/groups matching your interests, 2) Attend local events and meetups, 3) Be approachable and smile, 4) Start small talk and ask questions, 5) Follow up (suggest hanging out), 6) Be genuine and authentic, 7) Volunteer or take classes. Quality > quantity!"
        
        if "become more social" in question_lower or "improve social skills" in question_lower:
            return "To become more social: 1) Start with small interactions (cashier, neighbors), 2) Practice active listening, 3) Ask open-ended questions, 4) Share about yourself too, 5) Join group activities regularly, 6) Work on confidence and body language, 7) Be patient with yourself - it's a skill!"
        
        if "feel lonely" in question_lower or "why do i feel lonely" in question_lower:
            return "Feeling lonely is normal and common. To help: 1) Understand it's a signal to connect, not a flaw, 2) Reach out to friends/family (even a text helps), 3) Join communities with shared interests, 4) Volunteer or help others, 5) Develop self-compassion, 6) Consider therapy if persistent. You're not alone in feeling lonely!"
        
        if "trust issues" in question_lower or "fix trust issues" in question_lower:
            return "To fix trust issues: 1) Understand the root cause (past hurt?), 2) Start small - trust in low-risk situations, 3) Communicate openly with others, 4) Work on self-trust first, 5) Give people benefit of the doubt, 6) Set healthy boundaries, 7) Consider therapy for deep issues. Trust is rebuilt slowly."
        
        if "set boundaries" in question_lower or "how to set boundaries" in question_lower:
            return "Setting healthy boundaries: 1) Know your limits (what you're comfortable with), 2) Be clear and direct ('I can't do that'), 3) Don't over-explain or apologize, 4) Start with small boundaries, 5) Be consistent in enforcing them, 6) It's okay to say 'no', 7) Remove yourself if boundaries aren't respected."
        
        if "improve my relationship" in question_lower or "improve relationship" in question_lower:
            return "To improve relationships: 1) Communicate openly and honestly, 2) Listen without judgment, 3) Spend quality time together, 4) Show appreciation daily, 5) Resolve conflicts calmly, 6) Support each other's goals, 7) Keep dating/romance alive, 8) Work on yourself too. Relationships need continuous effort!"
        
        if "talk to someone i like" in question_lower or "talk to crush" in question_lower:
            return "To talk to someone you like: 1) Start with friendly conversation (common interests), 2) Be yourself - don't pretend, 3) Ask questions and listen, 4) Use humor and smile, 5) Compliment genuinely, 6) Suggest hanging out casually, 7) Don't overthink - they're human too! Confidence comes with practice."
        
        if "people lose interest" in question_lower or "why do people lose interest" in question_lower:
            return "People lose interest when: 1) No emotional connection built, 2) Too available/no mystery, 3) Mismatched values or goals, 4) Better option appeared, 5) They weren't ready for relationship, 6) Communication broke down, 7) They changed or grew apart. Often it's not about you - compatibility matters!"
        
        if "stop worrying about others" in question_lower or "stop caring what others think" in question_lower:
            return "To stop worrying about others' opinions: 1) Remember most people think about themselves, not you, 2) You can't control others' thoughts, 3) Focus on your values, not theirs, 4) Criticism says more about them than you, 5) Surround yourself with supporters, 6) Practice self-acceptance, 7) Everyone gets judged - it's normal!"
        
        # ==================== CATEGORY 10: RANDOM & CURIOSITY ====================
        
        if "are aliens real" in question_lower or "do aliens exist" in question_lower:
            return "Whether aliens exist is unknown. Given billions of galaxies with billions of stars, many scientists believe life elsewhere is probable (Drake Equation). However, we haven't found definitive proof yet. NASA is searching via SETI, Mars rovers, and studying exoplanets. The universe is vast - we're still exploring!"
        
        if "is time travel possible" in question_lower or "can we time travel" in question_lower:
            return "According to Einstein's relativity, time travel to the future is theoretically possible (time dilation near speed of light or strong gravity). Going backwards is much harder - would require exotic physics like wormholes or closed timelike curves. Currently, we can't do either practically. It remains science fiction for now!"
        
        if "meaning of happiness" in question_lower or "what is happiness" in question_lower:
            return "Happiness is a state of well-being and contentment. Research shows it comes from: 1) Strong relationships, 2) Meaningful work/purpose, 3) Gratitude and positive mindset, 4) Health and physical activity, 5) Helping others, 6) Personal growth, 7) Living in the present. It's a journey, not a destination!"
        
        if "purpose of life" in question_lower or "meaning of life" in question_lower:
            return "The purpose of life is a deeply personal question. Common answers: 1) Find happiness and minimize suffering, 2) Build meaningful relationships, 3) Contribute to society, 4) Grow and learn continuously, 5) Create and experience beauty, 6) Leave the world better than you found it. Your purpose is what you decide it to be!"
        
        if "what happens after death" in question_lower or "after death" in question_lower:
            return "What happens after death is unknown and depends on beliefs. Science says biological functions stop. Religions offer various views: reincarnation, heaven/hell, spiritual realm, or reunion with the universe. Philosophically, your impact lives on through people you've touched. It remains life's greatest mystery."
        
        if "what is consciousness" in question_lower or "explain consciousness" in question_lower:
            return "Consciousness is awareness of yourself and your surroundings. Scientists debate whether it's just brain activity or something more. It involves perception, thoughts, emotions, and sense of 'self'. The 'hard problem of consciousness' asks: how does physical brain create subjective experience? Still unsolved!"
        
        if "explain the universe" in question_lower or "how big is the universe" in question_lower:
            return "The universe is everything that exists - all matter, energy, space, and time. It's about 13.8 billion years old (Big Bang). Observable universe is 93 billion light-years across, with 2 trillion galaxies. It's expanding and mostly dark matter/energy. We're on a small planet in the Milky Way galaxy!"
        
        if "how big is infinity" in question_lower or "what is infinity" in question_lower:
            return "Infinity (∞) isn't a number - it's a concept meaning 'without end'. In math, there are different sizes of infinity! Countable infinity (integers) vs uncountable infinity (real numbers). Your mind can't fully grasp it because everything we experience is finite. It's beautifully paradoxical!"
        
        if "why do humans dream" in question_lower or "why do we dream" in question_lower:
            return "Scientists believe we dream to: 1) Process emotions and memories, 2) Consolidate learning, 3) Practice threat scenarios (evolutionary survival), 4) Clear mental clutter, 5) Solve problems creatively. Dreams occur in REM sleep. Fun fact: everyone dreams 4-6 times per night, but we forget most!"
        
        if "how to become successful" in question_lower or "become successful" in question_lower:
            return "Success formula: 1) Define YOUR success (not society's), 2) Set clear goals and plan, 3) Take consistent action daily, 4) Learn from failures, 5) Build strong relationships, 6) Stay disciplined over motivated, 7) Adapt and evolve, 8) Help others succeed. Success = small daily wins compounded over time!"
        
        # ==================== CATEGORY 2 ADDITIONS: LEARNING & EDUCATION ====================
        
        if "help me prepare for exam" in question_lower or "prepare for exam" in question_lower:
            return "Exam preparation: 1) Start 2-4 weeks early, 2) Create study schedule by topic, 3) Use active recall (practice tests), 4) Make concise notes/flashcards, 5) Study hardest subjects when fresh, 6) Take breaks (Pomodoro), 7) Sleep well before exam, 8) Review mistakes thoroughly. Last day: light review only!"
        
        if "how to write an assignment" in question_lower or "write assignment" in question_lower:
            return "Writing assignments: 1) Understand the question/rubric, 2) Research from credible sources, 3) Create outline (intro, body, conclusion), 4) Write rough draft first, 5) Use topic sentences and transitions, 6) Cite sources properly, 7) Edit and proofread, 8) Check formatting. Start early to avoid rush!"
        
        # ==================== CATEGORY 5 ADDITIONS: BUSINESS & CAREER ====================
        
        if "what career is best for me" in question_lower or "which career" in question_lower:
            return "To find your career: 1) List your strengths and passions, 2) Take career assessments (16Personalities, StrengthsFinder), 3) Research growing industries (AI, healthcare, green tech), 4) Try internships or side projects, 5) Talk to people in fields you like, 6) Consider work-life balance needs, 7) Start somewhere - careers evolve!"
        
        if "startup ideas" in question_lower or "business ideas" in question_lower:
            return "Startup ideas for 2025: 1) AI tools for specific niches, 2) Sustainable/eco products, 3) Online education platforms, 4) Health & wellness apps, 5) Remote work tools, 6) Local service apps (cleaning, repairs), 7) Subscription boxes, 8) Digital marketing agency. Best idea = solve a problem you've experienced!"
        
        if "write a business plan" in question_lower or "create business plan" in question_lower:
            return "Business plan outline: 1) **Executive Summary** (overview), 2) **Problem & Solution**, 3) **Market Analysis** (target customers, competitors), 4) **Product/Service Details**, 5) **Marketing Strategy**, 6) **Financial Projections** (costs, revenue), 7) **Team**, 8) **Milestones**. Keep it clear and realistic!"
        
        if "marketing strategies" in question_lower or "marketing strategy" in question_lower:
            return "Marketing strategies: 1) **Content Marketing** (blogs, videos), 2) **Social Media** (Instagram, TikTok, LinkedIn), 3) **SEO** (rank on Google), 4) **Email Marketing**, 5) **Influencer partnerships**, 6) **Paid ads** (Google, Facebook), 7) **Referrals/word-of-mouth**. Start with free channels, then scale with ads!"
        
        if "improve linkedin" in question_lower or "linkedin profile" in question_lower:
            return "LinkedIn profile tips: 1) Professional photo (smile, plain background), 2) Headline = what you do + value, 3) Summary tells your story, 4) List achievements (not just duties), 5) Get recommendations, 6) Share valuable content regularly, 7) Engage with others' posts, 8) Custom URL. Think of it as your online resume!"
        
        if "build a portfolio" in question_lower or "create portfolio" in question_lower:
            return "Building a portfolio: 1) Choose 5-10 best projects (quality > quantity), 2) Show process, not just results, 3) Include case studies with problems/solutions, 4) Make it easy to navigate, 5) Add contact info prominently, 6) Update regularly, 7) Get feedback before publishing. Use platforms: Behance, GitHub, personal website."
        
        if "high salary job" in question_lower or "highest paying" in question_lower:
            return "High-paying careers 2025: **Tech**: Software engineer ($120k+), AI/ML engineer ($150k+), Cloud architect ($140k+). **Healthcare**: Surgeon ($400k+), Anesthesiologist ($350k+). **Business**: Investment banker ($200k+), Product manager ($150k+). **Law**: Corporate lawyer ($180k+). But passion + skills matter more than just salary!"
        
        # ==================== CATEGORY 7 ADDITIONS: ENTERTAINMENT ====================
        
        if "recommend movies" in question_lower or "good movies" in question_lower:
            return "Top movies by genre: **Sci-Fi**: Interstellar, Inception, The Matrix. **Drama**: The Shawshank Redemption, Forrest Gump. **Action**: The Dark Knight, Mad Max Fury Road. **Thriller**: Se7en, Shutter Island. **Comedy**: The Grand Budapest Hotel. **Animation**: Spider-Verse, Spirited Away. What mood are you in?"
        
        if "recommend books" in question_lower or "good books" in question_lower:
            return "Must-read books: **Self-help**: Atomic Habits, How to Win Friends. **Fiction**: 1984, To Kill a Mockingbird. **Business**: Zero to One, The Lean Startup. **Psychology**: Thinking Fast and Slow. **Philosophy**: Man's Search for Meaning. **Sci-Fi**: Dune, Ender's Game. What genre interests you?"
        
        if "recommend anime" in question_lower or "good anime" in question_lower:
            return "Top anime recommendations: **Action**: Attack on Titan, Demon Slayer, One Punch Man. **Adventure**: Fullmetal Alchemist Brotherhood, Hunter x Hunter. **Thriller**: Death Note, Steins;Gate. **Romance**: Your Name, A Silent Voice. **Slice of life**: Violet Evergarden. **Comedy**: Spy x Family. New to anime? Start with Death Note or Your Name!"
        
        # ==================== CATEGORY 8 ADDITIONS: FINANCE ====================
        
        if "explain crypto" in question_lower or "what is crypto" in question_lower:
            return "Cryptocurrency is digital money using blockchain (secure, decentralized ledger). Bitcoin was first (2009). You can buy, trade, or mine crypto. Benefits: no banks, fast international transfers. Risks: volatile prices, hacking, regulations unclear. Only invest what you can afford to lose. Popular: Bitcoin, Ethereum, Solana."
        
        if "build credit score" in question_lower or "increase credit score" in question_lower:
            return "To build credit score: 1) Pay bills on time (35% of score), 2) Keep credit utilization under 30%, 3) Don't close old accounts (length matters), 4) Mix credit types (card + loan), 5) Limit hard inquiries, 6) Check report for errors, 7) Become authorized user on good account. Takes 6-12 months to see improvement!"
        
        if "start freelancing" in question_lower or "how to freelance" in question_lower:
            return "Start freelancing: 1) Choose your skill (writing, design, coding, etc.), 2) Create portfolio with 3-5 samples, 3) Sign up on Upwork, Fiverr, Freelancer, 4) Start with lower rates to get reviews, 5) Deliver excellent work and communicate well, 6) Ask for testimonials, 7) Raise rates as you grow. Consistency is key!"
        
        if "avoid financial mistakes" in question_lower or "financial mistakes" in question_lower:
            return "Avoid these financial mistakes: 1) Living beyond your means, 2) Not having emergency fund, 3) High-interest debt (credit cards), 4) No retirement savings, 5) Lifestyle inflation (spend more as you earn), 6) No budget/tracking, 7) Emotional investing, 8) Not learning about money. Financial education = wealth foundation!"
        
        if "explain mutual funds" in question_lower or "what are mutual funds" in question_lower:
            return "Mutual funds pool money from many investors to buy stocks, bonds, or other assets. Managed by professionals. Benefits: diversification, professional management, low minimum. Types: Equity (stocks), Debt (bonds), Hybrid. Charges: expense ratio (0.5-2%). Good for beginners who want hands-off investing. Returns vary by fund type!"
        
        # ==================== BASIC FACTS (Original) ====================
        
        # Math questions
        if any(x in question_lower for x in ["2+2", "2 + 2", "what is 2+2", "what's 2+2"]):
            return "4"
        if any(x in question_lower for x in ["5+5", "5 + 5"]):
            return "10"
        
        # Basic geography
        if "capital of france" in question_lower:
            return "The capital of France is Paris."
        if "capital of india" in question_lower:
            return "The capital of India is New Delhi."
        if "capital of usa" in question_lower or "capital of united states" in question_lower:
            return "The capital of the United States is Washington, D.C."
        
        # Programming basics
        if "what is python" in question_lower and "code" not in question_lower:
            return "Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, it's widely used in web development, data science, AI, and automation."
        if "what is javascript" in question_lower:
            return "JavaScript is a programming language that makes websites interactive. It runs in web browsers and can also be used on servers with Node.js. It's one of the core technologies of the web."
        if "what is html" in question_lower:
            return "HTML (HyperText Markup Language) is the standard language for creating web pages. It uses tags to structure content like headings, paragraphs, links, and images."
        
        # Common knowledge
        if "who invented python" in question_lower:
            return "Python was invented by Guido van Rossum and first released in 1991."
        if "what is ai" in question_lower or "what is artificial intelligence" in question_lower:
            return "Artificial Intelligence (AI) is technology that enables computers to perform tasks that typically require human intelligence, such as learning, problem-solving, and decision-making."
        
        # No instant answer found
        return None
    
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
