"""
Comprehensive emotion detection test - all 6 emotions
"""

from test_emotion_quick import predict_emotion

# Test cases for all emotions
test_cases = [
    ("I'm so happy and excited about this!", "joy"),
    ("I feel so sad and heartbroken", "sadness"),
    ("This makes me so angry and frustrated!", "anger"),
    ("I'm scared and anxious about what might happen", "fear"),
    ("Wow, that's so surprising and unexpected!", "surprise"),
    ("I love you so much, you mean everything to me", "love"),
]

print("\n" + "="*70)
print(" EMOTION DETECTION - COMPREHENSIVE TEST ".center(70))
print("="*70 + "\n")

results = []
for text, expected in test_cases:
    result = predict_emotion(text)
    detected = result['primary_emotion']
    confidence = result['confidence']
    
    # Check if correct
    is_correct = detected == expected
    status = "✅" if is_correct else "❌"
    
    results.append({
        "text": text,
        "expected": expected,
        "detected": detected,
        "confidence": confidence,
        "correct": is_correct
    })
    
    print(f"{status} Text: {text[:50]}...")
    print(f"   Expected: {expected.upper():10s} | Detected: {detected.upper():10s} | Confidence: {confidence:.2%}")
    print()

# Summary
print("="*70)
print(" SUMMARY ".center(70))
print("="*70)

total = len(results)
correct = sum(1 for r in results if r['correct'])
accuracy = (correct / total) * 100

print(f"\nTotal Tests: {total}")
print(f"Correct: {correct}")
print(f"Accuracy: {accuracy:.1f}%")

if accuracy == 100:
    print("\n🎉 Perfect! All emotions detected correctly!")
else:
    print(f"\n⚠️  {total - correct} test(s) failed")
    for r in results:
        if not r['correct']:
            print(f"   - Expected {r['expected']}, got {r['detected']}: {r['text'][:40]}...")

print("\n" + "="*70 + "\n")
