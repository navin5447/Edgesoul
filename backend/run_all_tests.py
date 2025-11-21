"""
Comprehensive Test Runner for EdgeSoul
Runs all tests and generates a detailed report
"""

import sys
import os
from pathlib import Path
import subprocess
import time
from datetime import datetime

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))


class TestRunner:
    """Runs all EdgeSoul tests and generates report"""
    
    def __init__(self):
        self.results = {}
        self.start_time = None
        self.end_time = None
    
    def run_test(self, test_file: str, description: str) -> dict:
        """Run a single test file"""
        print(f"\n{'='*60}")
        print(f"Running: {test_file}")
        print(f"Description: {description}")
        print('='*60)
        
        start = time.time()
        
        try:
            # Run test with UTF-8 encoding
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'
            
            result = subprocess.run(
                [sys.executable, test_file],
                cwd=Path(__file__).parent,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace',
                env=env,
                timeout=120  # 2 minute timeout
            )
            
            elapsed = time.time() - start
            
            # Check if passed
            passed = result.returncode == 0 and (
                'PASSED' in result.stdout or
                'SUCCESS' in result.stdout or
                'All tests passed' in result.stdout or
                result.returncode == 0
            )
            
            # Check for errors
            has_error = (
                result.returncode != 0 or
                'Error' in result.stderr or
                'Traceback' in result.stderr or
                'FAILED' in result.stdout
            )
            
            if has_error:
                passed = False
            
            return {
                'file': test_file,
                'description': description,
                'passed': passed,
                'elapsed': elapsed,
                'returncode': result.returncode,
                'stdout': result.stdout[:500] if result.stdout else '',
                'stderr': result.stderr[:500] if result.stderr else '',
                'full_output': result.stdout + '\n' + result.stderr
            }
            
        except subprocess.TimeoutExpired:
            return {
                'file': test_file,
                'description': description,
                'passed': False,
                'elapsed': 120,
                'returncode': -1,
                'stdout': '',
                'stderr': 'Test timed out after 120 seconds',
                'full_output': 'TIMEOUT'
            }
        except Exception as e:
            return {
                'file': test_file,
                'description': description,
                'passed': False,
                'elapsed': time.time() - start,
                'returncode': -1,
                'stdout': '',
                'stderr': str(e),
                'full_output': f'ERROR: {e}'
            }
    
    def run_all_tests(self):
        """Run all test files"""
        
        # Define all tests with categories
        tests = {
            'Core Emotion Detection': [
                ('test_emotion_quick.py', 'Quick emotion detection test'),
                ('test_all_emotions.py', 'Test all 6 emotion types'),
                ('test_advanced_scenarios.py', 'Advanced emotion scenarios'),
            ],
            'Knowledge Engine': [
                ('test_ollama_working.py', 'Test Ollama integration'),
                ('test_knowledge_engine.py', 'Knowledge engine functionality'),
            ],
            'Hybrid System': [
                ('test_hybrid_engine.py', 'Hybrid emotion + knowledge'),
                ('test_chatbot_intelligence.py', 'Chatbot intelligence'),
                ('test_bot_responses.py', 'Bot response quality'),
            ],
            'Memory & Context': [
                ('test_database_persistence.py', 'Database persistence'),
                ('test_conversation_context.py', 'Conversation context'),
                ('test_learning.py', 'Learning from conversations'),
            ],
            'Edge Cases': [
                ('test_frustration_fix.py', 'Frustration handling'),
                ('test_exact_question.py', 'Exact question matching'),
            ],
            'System Integration': [
                ('test_complete_system.py', 'Complete system integration'),
                ('test_app.py', 'FastAPI app functionality'),
            ],
            'Feature Tests': [
                ('test_phase1_gender.py', 'Gender-based personality'),
                ('test_phase2_theming.py', 'UI theming'),
                ('test_phase3_bot_personality.py', 'Bot personality customization'),
            ]
        }
        
        self.start_time = datetime.now()
        
        print("\n" + "="*70)
        print("EdgeSoul Comprehensive Test Suite")
        print("="*70)
        print(f"Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70)
        
        all_results = []
        
        for category, category_tests in tests.items():
            print(f"\n\n{'#'*70}")
            print(f"# Category: {category}")
            print('#'*70)
            
            category_results = []
            
            for test_file, description in category_tests:
                result = self.run_test(test_file, description)
                category_results.append(result)
                all_results.append(result)
                
                # Print immediate result
                status = "✅ PASSED" if result['passed'] else "❌ FAILED"
                print(f"\n{status} - {test_file} ({result['elapsed']:.2f}s)")
                
                if not result['passed']:
                    print(f"Error: {result['stderr'][:200]}")
            
            self.results[category] = category_results
        
        self.end_time = datetime.now()
        
        # Generate final report
        self.print_summary()
        
        return all_results
    
    def print_summary(self):
        """Print test summary report"""
        
        print("\n\n" + "="*70)
        print("TEST SUMMARY REPORT")
        print("="*70)
        
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        total_time = 0
        
        for category, results in self.results.items():
            print(f"\n📦 {category}:")
            print("-" * 60)
            
            for result in results:
                total_tests += 1
                total_time += result['elapsed']
                
                if result['passed']:
                    passed_tests += 1
                    status = "✅"
                else:
                    failed_tests += 1
                    status = "❌"
                
                print(f"  {status} {result['file']:<35} {result['elapsed']:>6.2f}s")
        
        # Overall statistics
        print("\n" + "="*70)
        print("OVERALL STATISTICS")
        print("="*70)
        print(f"Total Tests:    {total_tests}")
        print(f"✅ Passed:      {passed_tests} ({passed_tests/total_tests*100:.1f}%)")
        print(f"❌ Failed:      {failed_tests} ({failed_tests/total_tests*100:.1f}%)")
        print(f"⏱️  Total Time:  {total_time:.2f}s")
        print(f"📅 Started:     {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📅 Ended:       {self.end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"⏰ Duration:    {(self.end_time - self.start_time).total_seconds():.2f}s")
        
        # Failed tests details
        if failed_tests > 0:
            print("\n" + "="*70)
            print("FAILED TESTS DETAILS")
            print("="*70)
            
            for category, results in self.results.items():
                failed = [r for r in results if not r['passed']]
                if failed:
                    print(f"\n{category}:")
                    for result in failed:
                        print(f"\n  ❌ {result['file']}")
                        print(f"     Error: {result['stderr'][:200]}")
        
        print("\n" + "="*70)
        
        if failed_tests == 0:
            print("🎉 ALL TESTS PASSED! 🎉")
        else:
            print(f"⚠️  {failed_tests} test(s) need attention")
        
        print("="*70 + "\n")
    
    def save_report(self, filename: str = "test_report.txt"):
        """Save detailed report to file"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("EdgeSoul Test Report\n")
            f.write("="*70 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*70 + "\n\n")
            
            for category, results in self.results.items():
                f.write(f"\n{category}\n")
                f.write("-" * 60 + "\n")
                
                for result in results:
                    f.write(f"\n{result['file']}\n")
                    f.write(f"  Status: {'PASSED' if result['passed'] else 'FAILED'}\n")
                    f.write(f"  Time: {result['elapsed']:.2f}s\n")
                    f.write(f"  Return Code: {result['returncode']}\n")
                    
                    if not result['passed']:
                        f.write(f"\n  Error:\n")
                        f.write(f"  {result['stderr']}\n")
                    
                    f.write("\n" + "-" * 60 + "\n")
        
        print(f"📄 Detailed report saved to: {filename}")


def main():
    """Main test runner"""
    
    runner = TestRunner()
    results = runner.run_all_tests()
    
    # Save detailed report
    runner.save_report('test_report.txt')
    
    # Exit with appropriate code
    failed_count = sum(1 for r in results if not r['passed'])
    sys.exit(0 if failed_count == 0 else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
