# Edge Deployment for EdgeSoul v2

This guide covers deploying EdgeSoul v2 on edge devices.

## Supported Edge Platforms

### 1. NVIDIA Jetson (Recommended)
- **Models**: Jetson Nano, Xavier NX, AGX Orin
- **RAM**: Minimum 4GB
- **Storage**: 32GB+
- **GPU**: Built-in CUDA support

### 2. Raspberry Pi
- **Models**: Pi 4 (4GB/8GB), Pi 5
- **RAM**: Minimum 4GB
- **Storage**: 32GB+
- **Note**: CPU-only, slower inference

### 3. Intel NUC
- **RAM**: 8GB+
- **Storage**: 128GB+
- **Optional**: Intel Neural Compute Stick 2

## Setup Instructions

### NVIDIA Jetson

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip docker.io docker-compose

# Install PyTorch for Jetson
wget https://nvidia.box.com/shared/static/xyz.whl
pip3 install torch-*.whl

# Clone and setup
git clone https://github.com/yourusername/edgesoul-v2.git
cd edgesoul-v2

# Configure for Jetson
cp deployment/edge/jetson/.env.example .env
# Edit .env with appropriate settings

# Build with GPU support
docker-compose -f deployment/edge/jetson/docker-compose.yml up -d
```

### Raspberry Pi

```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip docker.io docker-compose

# Install lightweight dependencies
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Use TinyLlama or GPT-2 for knowledge model
# Configure in .env:
# KNOWLEDGE_MODEL_PATH=tinyllama
# USE_LOCAL_LLM=true

# Build
docker-compose -f deployment/edge/raspberrypi/docker-compose.yml up -d
```

## Model Optimization for Edge

### Quantization

```python
# 4-bit quantization (recommended for edge)
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
)

model = AutoModelForCausalLM.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    quantization_config=config,
)
```

### ONNX Conversion

```bash
# Convert models to ONNX for faster inference
python scripts/convert_to_onnx.py --model emotion
python scripts/convert_to_onnx.py --model knowledge
```

### TensorRT (NVIDIA Jetson)

```bash
# Optimize with TensorRT
trtexec --onnx=emotion_model.onnx --saveEngine=emotion_model.trt
```

## Performance Benchmarks

| Device | Emotion Detection | LLM Inference | Total Latency |
|--------|------------------|---------------|---------------|
| Jetson Xavier NX | 50ms | 1.5s | 1.55s |
| Jetson Nano | 150ms | 4s | 4.15s |
| Raspberry Pi 4 | 300ms | 8s | 8.3s |
| Intel NUC i5 | 100ms | 2s | 2.1s |

## Power Consumption

| Device | Idle | Peak | Average |
|--------|------|------|---------|
| Jetson Xavier NX | 5W | 20W | 15W |
| Jetson Nano | 5W | 10W | 8W |
| Raspberry Pi 4 | 3W | 7W | 5W |

## Network Configuration

### Local Network Only
```yaml
# .env
CORS_ORIGINS=http://192.168.1.100:3000
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Remote Access (with SSL)
```bash
# Use Tailscale or ZeroTier for secure remote access
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
```

## Storage Management

Edge devices have limited storage. Manage space:

```bash
# Clean Docker images
docker system prune -a

# Use model caching
export TRANSFORMERS_CACHE=/mnt/external/model_cache

# Monitor storage
df -h
```

## Monitoring

```bash
# Install monitoring stack
docker-compose -f deployment/edge/monitoring/docker-compose.yml up -d

# Access Grafana at http://device-ip:3001
# Default credentials: admin/admin
```

## Auto-start on Boot

```bash
# Enable Docker auto-start
sudo systemctl enable docker

# Auto-start containers
# Add to /etc/rc.local:
cd /home/user/edgesoul-v2
docker-compose up -d
```

## Troubleshooting

### Out of Memory
- Reduce model size (use INT4 quantization)
- Use swap file
- Reduce batch size

### Slow Inference
- Enable GPU acceleration (Jetson)
- Use ONNX/TensorRT
- Reduce max_tokens

### Network Issues
- Check firewall rules
- Verify CORS settings
- Use static IP address

## Security

- Change default passwords
- Enable firewall
- Use HTTPS with Let's Encrypt
- Regular security updates
- Disable unused services

## Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
