# TribeCore Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- AWS Account / Cloud Provider
- Domain name
- SSL Certificate
- PostgreSQL Database (managed service)
- Redis instance

## Docker Production Deployment

### 1. Build Production Images

```bash
# Build backend
cd backend
docker build -t tribecore-backend:latest .

# Build frontend
cd frontend
docker build -t tribecore-frontend:latest .
```

### 2. Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## AWS Deployment

### Architecture

```
Internet → CloudFront → ALB → ECS (Backend + Frontend)
                         ↓
                    RDS PostgreSQL
                    ElastiCache Redis
                    S3 (Documents)
```

### Steps

1. **Setup RDS PostgreSQL**
   - Create PostgreSQL database
   - Note connection string

2. **Setup ElastiCache Redis**
   - Create Redis cluster
   - Note connection endpoint

3. **Setup S3 Bucket**
   - Create bucket for documents
   - Configure CORS

4. **Deploy Backend (ECS)**
   ```bash
   # Push image to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin
   docker tag tribecore-backend:latest [ECR_URL]
   docker push [ECR_URL]
   ```

5. **Deploy Frontend (S3 + CloudFront)**
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://your-bucket-name
   ```

## Environment Variables (Production)

### Backend
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-rds-endpoint
DATABASE_SSL=true
JWT_SECRET=your-production-secret
AWS_S3_BUCKET=your-bucket
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com
```

## Monitoring

- Use AWS CloudWatch for logs
- Set up Datadog/Sentry for error tracking
- Configure uptime monitoring

## Backup Strategy

1. **Database Backups**
   - RDS automated backups
   - Daily snapshots

2. **Document Backups**
   - S3 versioning enabled
   - Cross-region replication

## Scaling

- Auto-scaling for ECS tasks
- Read replicas for RDS
- CloudFront CDN for static assets

## Security Checklist

- ✅ SSL/TLS enabled
- ✅ Environment variables secured
- ✅ Database encryption at rest
- ✅ VPC security groups configured
- ✅ WAF rules enabled
- ✅ Regular security updates
