# Deployment Configurations for EdgeSoul v2

This directory contains deployment configurations for various environments.

## Structure

```
deployment/
├── docker/            # Docker configurations
├── edge/             # Edge deployment configs
├── nginx/            # Nginx reverse proxy configs
├── kubernetes/       # Kubernetes manifests (optional)
└── README.md         # This file
```

## Deployment Options

### 1. Docker (Development & Production)

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Edge Deployment

See `edge/README.md` for edge-specific configurations for:
- NVIDIA Jetson
- Raspberry Pi
- AWS IoT Greengrass
- Azure IoT Edge

### 3. Cloud Deployment

- **Vercel**: Frontend (Next.js)
- **Railway/Render**: Backend (FastAPI)
- **Firebase**: Database & Auth
- **AWS/GCP**: Full stack

### 4. Kubernetes (Optional)

```bash
kubectl apply -f kubernetes/
```

## Environment Variables

Each deployment method requires proper environment configuration:
- Copy `.env.example` to `.env`
- Configure API keys and secrets
- Set appropriate URLs and ports

## SSL/TLS

For production deployments, configure SSL certificates:
- Let's Encrypt for automatic certificates
- Custom certificates in `nginx/ssl/`

## Monitoring

Set up monitoring and logging:
- Prometheus + Grafana
- ELK Stack
- Cloud-native solutions (CloudWatch, Stackdriver)

## Scaling

- Horizontal: Multiple backend instances behind load balancer
- Vertical: Increase container resources
- Auto-scaling: Kubernetes HPA or cloud auto-scaling groups
