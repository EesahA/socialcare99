# 🚀 Deployment Guide - Render.com

This guide will help you deploy both the frontend and backend of Social Care 365 to Render.com.

## 📋 Prerequisites

- [Render.com](https://render.com) account
- MongoDB Atlas account (for database)
- Git repository with your code

## 🔧 Backend Deployment

### Step 1: Create Backend Service

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your Git repository**
4. **Configure the service:**

```
Name: socialcare99-backend
Environment: Node
Build Command: cd server && npm install
Start Command: cd server && npm start
```

### Step 2: Set Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialcare99
JWT_SECRET=your-super-secret-jwt-key-here
```

### Step 3: Deploy

Click "Create Web Service" and wait for deployment.

**Your backend URL will be:** `https://socialcare99-backend.onrender.com`

## 🌐 Frontend Deployment

### Step 1: Create Frontend Service

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Static Site"**
3. **Connect your Git repository**
4. **Configure the service:**

```
Name: socialcare99-frontend
Build Command: cd client && npm install && npm run build
Publish Directory: client/build
```

### Step 2: Set Environment Variables

Add this environment variable:

```
REACT_APP_API_URL=https://socialcare99-backend.onrender.com
```

### Step 3: Deploy

Click "Create Static Site" and wait for deployment.

**Your frontend URL will be:** `https://socialcare99-frontend.onrender.com`

## 🗄️ Database Setup

### MongoDB Atlas

1. **Create a MongoDB Atlas cluster**
2. **Create a database user**
3. **Get your connection string**
4. **Add it to backend environment variables**

## 🔄 Update Frontend API Configuration

After deployment, update your frontend environment:

1. **In Render dashboard, go to your frontend service**
2. **Add environment variable:**
   ```
   REACT_APP_API_URL=https://socialcare99-backend.onrender.com
   ```
3. **Redeploy the frontend**

## ✅ Verification

### Backend Health Check
Visit: `https://socialcare99-backend.onrender.com/api/health`

Should return:
```json
{
  "status": "OK",
  "uptime": 123.45,
  "database": "Connected",
  "timestamp": "2025-01-XX..."
}
```

### Frontend
Visit: `https://socialcare99-frontend.onrender.com`

Should load your React app and connect to the backend.

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json

2. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly

3. **Database Connection**
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas

4. **CORS Issues**
   - Backend should accept requests from frontend domain
   - Check CORS configuration

## 🔄 Redeployment

To update your app:

1. **Push changes to Git**
2. **Render will automatically redeploy**
3. **Monitor deployment logs**

## 📱 Custom Domains

You can add custom domains in Render dashboard:

1. **Go to your service settings**
2. **Click "Custom Domains"**
3. **Add your domain**
4. **Update DNS records**

---

**Happy Deploying! 🎉** 