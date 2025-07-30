# Railway Deployment Guide for OpiniXchange

## 🚀 Quick Deploy to Railway

### Step 1: Prepare Your Repository
Your project is already on GitHub at: `https://github.com/Mishragini/OpiniXchange.git`

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `Mishragini/OpiniXchange`
6. **Railway will automatically detect** your `docker-compose.yml`

### Step 3: Configure Environment Variables

After deployment, go to your project settings and add these environment variables:

```bash
# Database (Railway will provide this)
DATABASE_URL=postgresql://...

# Redis (Railway will provide this)
REDIS_URL=redis://...

# Kafka Configuration
KAFKA_BROKERS=kafka:9092

# Frontend URLs (Update with your Railway URLs)
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
NEXT_PUBLIC_WS_URL=wss://your-websocket-service.railway.app

# Security (Generate new ones for production)
JWT_SECRET=your-super-secret-jwt-key-change-this
SESSION_SECRET=your-session-secret-change-this

# Environment
NODE_ENV=production
```

### Step 4: Add Managed Services (Optional but Recommended)

1. **Add PostgreSQL Database:**
   - Go to your Railway project
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide the `DATABASE_URL`

2. **Add Redis Database:**
   - Go to your Railway project
   - Click "New" → "Database" → "Redis"
   - Railway will automatically provide the `REDIS_URL`

### Step 5: Deploy

1. **Railway will automatically build and deploy** your services
2. **Monitor the deployment** in the Railway dashboard
3. **Check the logs** if there are any issues

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check the build logs in Railway dashboard
   - Ensure all Dockerfiles are properly configured

2. **Service Dependencies:**
   - Make sure all services are starting in the correct order
   - Check the `depends_on` configurations

3. **Environment Variables:**
   - Verify all required environment variables are set
   - Check that URLs are using HTTPS for production

### Useful Commands:

```bash
# View Railway logs
railway logs

# Check service status
railway status

# Redeploy
railway up
```

## 🌐 Accessing Your Application

After successful deployment, Railway will provide you with:
- **Frontend URL**: `https://your-frontend-service.railway.app`
- **API URL**: `https://your-api-service.railway.app`
- **WebSocket URL**: `https://your-websocket-service.railway.app`

## 📊 Monitoring

Railway provides:
- ✅ Real-time logs
- ✅ Service health monitoring
- ✅ Automatic restarts
- ✅ Performance metrics

## 🔄 Updates

To update your application:
1. **Push changes** to your GitHub repository
2. **Railway will automatically redeploy** the changes
3. **Monitor the deployment** in the dashboard

## 💰 Costs

Railway pricing:
- **Free tier**: $5 credit monthly
- **Paid plans**: Pay for what you use
- **Database costs**: Separate from compute costs

## 🆘 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: For project-specific issues 