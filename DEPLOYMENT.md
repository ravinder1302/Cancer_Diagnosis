# Deployment Guide - AI Cancer Diagnosis System

This guide will help you deploy the AI Cancer Diagnosis System to Render or any other cloud platform.

## Prerequisites

- Python 3.11+
- Node.js 16+
- Git
- Render account (for cloud deployment)

## Local Development Setup

### 1. Backend Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd cancer_diagnosis

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python start.py
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 3. Using Docker (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t cancer-diagnosis-api .
docker run -p 8000:8000 cancer-diagnosis-api
```

## Render Deployment

### 1. Backend API Deployment

1. **Connect Repository to Render**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**

   - **Name**: `cancer-diagnosis-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`

3. **Environment Variables**

   ```
   PYTHON_VERSION=3.11.0
   PYTHONPATH=/opt/render/project/src
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your API

### 2. Frontend Deployment

1. **Create Static Site**

   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**

   - **Name**: `cancer-diagnosis-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

3. **Environment Variables**

   ```
   REACT_APP_API_URL=https://your-api-service.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Render will build and deploy your frontend

### 3. Using render.yaml (Recommended)

If you have the `render.yaml` file in your repository:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically create both services

## Environment Variables

### Backend Environment Variables

```bash
# Required
PYTHON_VERSION=3.11.0
PYTHONPATH=/opt/render/project/src

# Optional
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
DEBUG=False
```

### Frontend Environment Variables

```bash
# Required
REACT_APP_API_URL=https://your-api-service.onrender.com

# Optional
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## Health Checks

The backend includes a health check endpoint at `/health` that returns:

```json
{
  "status": "healthy",
  "models_loaded": true,
  "api_version": "1.0.0",
  "uptime": 123.45
}
```

## Monitoring

### Backend Monitoring

- **Health Checks**: Automatic health checks every 30 seconds
- **Logs**: Available in Render dashboard
- **Metrics**: Response times and error rates

### Frontend Monitoring

- **Build Status**: Available in Render dashboard
- **Performance**: Built-in React performance monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Python/Node.js versions
   - Verify all dependencies are in requirements.txt/package.json
   - Check build logs in Render dashboard

2. **Runtime Errors**

   - Check application logs
   - Verify environment variables
   - Ensure data file (Cancer_Data.csv) is accessible

3. **CORS Issues**

   - Verify CORS configuration in FastAPI
   - Check frontend API URL configuration

4. **Model Loading Issues**
   - Ensure models directory exists
   - Check file permissions
   - Verify model files are included in deployment

### Debug Commands

```bash
# Check backend health
curl https://your-api.onrender.com/health

# Test API endpoints
curl -X POST https://your-api.onrender.com/predict/diagnosis \
  -H "Content-Type: application/json" \
  -d '{"radius_mean": 17.99, ...}'

# Check frontend build
cd frontend && npm run build
```

## Security Considerations

1. **API Security**

   - Use HTTPS in production
   - Implement rate limiting
   - Add authentication if needed
   - Validate all inputs

2. **Data Security**

   - Secure storage of patient data
   - HIPAA compliance (if applicable)
   - Data encryption at rest and in transit

3. **Model Security**
   - Validate model inputs
   - Implement input sanitization
   - Monitor for adversarial attacks

## Scaling

### Horizontal Scaling

- Render automatically scales based on traffic
- Consider using multiple instances for high availability
- Implement load balancing for multiple regions

### Performance Optimization

- Enable model caching
- Implement response caching
- Optimize database queries (if using database)
- Use CDN for static assets

## Backup and Recovery

1. **Code Backup**

   - Use Git for version control
   - Regular commits and pushes
   - Tag releases for rollback

2. **Data Backup**

   - Backup training data
   - Export trained models
   - Database backups (if applicable)

3. **Disaster Recovery**
   - Document recovery procedures
   - Test backup restoration
   - Maintain multiple deployment environments

## Support

For issues and questions:

1. Check the application logs
2. Review the API documentation at `/docs`
3. Check the health endpoint
4. Contact the development team

## Updates and Maintenance

### Regular Maintenance

1. **Dependency Updates**

   - Regular security updates
   - Performance improvements
   - Bug fixes

2. **Model Updates**

   - Retrain models with new data
   - Validate model performance
   - A/B testing for new models

3. **Monitoring**
   - Monitor system performance
   - Track prediction accuracy
   - User feedback analysis
