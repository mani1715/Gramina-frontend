# Railway Deployment Guide for GramaMitra Frontend

## Environment Variables Configuration

### Required Environment Variable

In your Railway frontend project dashboard, go to **Variables** tab and set:

#### REACT_APP_BACKEND_URL (CRITICAL)
```
REACT_APP_BACKEND_URL=https://gramina-backend-production.up.railway.app
```

**Important:** 
- Replace with your actual Railway backend URL
- Do NOT include trailing slash
- This must match exactly with your backend service URL

## Deployment Steps

### 1. Set Environment Variable in Railway

1. Go to your Railway project dashboard
2. Click on your frontend service
3. Navigate to the **Variables** tab
4. Add `REACT_APP_BACKEND_URL` with your backend's Railway URL
5. Save the changes

### 2. Redeploy

After updating the environment variable:
1. Railway will automatically redeploy, OR
2. Manually trigger a redeploy from the Deployments tab
3. Wait for the build and deployment to complete

### 3. Verify Configuration

1. Open your deployed frontend
2. Open browser DevTools (F12)
3. Check the Network tab when making API calls
4. Verify requests are going to your backend URL

## Build Configuration

Railway should automatically detect this as a React app. If needed, you can set:

### Build Command:
```
npm install && npm run build
```

### Start Command:
```
npm start
```

## Testing the Deployment

1. Navigate to your frontend URL: `https://gramina-frontend-production.up.railway.app`
2. Try to sign up or log in
3. Check browser console - no CORS errors should appear
4. Verify that API calls are successful

## Common Issues

### Issue: Cannot connect to backend

**Solution:**
1. Verify `REACT_APP_BACKEND_URL` is set correctly in Railway variables
2. Check that the backend URL is accessible (open it in a browser)
3. Ensure backend service is running on Railway

### Issue: Getting 404 errors on API calls

**Solution:**
1. Check that backend URL doesn't have a trailing slash
2. Verify the backend service is healthy
3. Check backend logs for errors

### Issue: CORS errors still appearing

**Solution:**
1. Ensure backend has `FRONTEND_URL` set correctly
2. Check that both services have been redeployed after setting variables
3. Clear browser cache and try again

## Environment Variables Summary

| Variable | Value | Required |
|----------|-------|----------|
| REACT_APP_BACKEND_URL | Your Railway backend URL | ✅ Yes |

Example:
```
REACT_APP_BACKEND_URL=https://gramina-backend-production.up.railway.app
```

## Production Checklist

- [ ] `REACT_APP_BACKEND_URL` is set in Railway variables
- [ ] Backend service is deployed and running
- [ ] Backend has `FRONTEND_URL` pointing to this frontend
- [ ] Both services have been redeployed after setting variables
- [ ] Test signup/login functionality works
- [ ] No CORS errors in browser console

## Support

If issues persist:
1. Check Railway deployment logs for errors
2. Verify all environment variables in both services
3. Ensure both frontend and backend are using latest code from GitHub
4. Test backend API directly using curl or Postman
