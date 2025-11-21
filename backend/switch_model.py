"""
Simple script to switch between Ollama models in knowledge_engine.py
"""
import sys

def switch_model(model_name: str):
    """Switch the Ollama model in knowledge_engine.py"""
    
    file_path = "services/knowledge_engine.py"
    
    # Valid models
    valid_models = {
        "tiny": ("tinyllama", "Fastest, uses ~1GB RAM"),
        "phi3": ("phi3:mini", "Better quality, needs ~4GB free RAM"),
        "mistral": ("mistral:7b", "Best quality, needs ~8GB free RAM"),
    }
    
    if model_name not in valid_models:
        print(f"❌ Invalid model: {model_name}")
        print(f"\n📋 Available models:")
        for key, (name, desc) in valid_models.items():
            print(f"   {key:10} → {name:15} | {desc}")
        print(f"\n💡 Usage: python switch_model.py <tiny|phi3|mistral>")
        sys.exit(1)
    
    target_model, description = valid_models[model_name]
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the model line
    import re
    pattern = r'model_name="[^"]+",  # Use tinyllama.*?available'
    replacement = f'model_name="{target_model}",  # Use tinyllama when <4GB free RAM, or phi3:mini when 4GB+ available'
    
    new_content = re.sub(pattern, replacement, content)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Switched to model: {target_model}")
    print(f"📝 Description: {description}")
    print(f"\n⚠️  Remember to restart your backend server!")
    print(f"   python -m uvicorn main:app --reload")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ Missing argument")
        print("💡 Usage: python switch_model.py <tiny|phi3|mistral>")
        print("\n📋 Available models:")
        print("   tiny      → tinyllama    | Fastest, uses ~1GB RAM")
        print("   phi3      → phi3:mini    | Better quality, needs ~4GB free RAM")
        print("   mistral   → mistral:7b   | Best quality, needs ~8GB free RAM")
        sys.exit(1)
    
    switch_model(sys.argv[1])
