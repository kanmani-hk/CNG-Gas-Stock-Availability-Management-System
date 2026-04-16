# Backend Troubleshooting Guide

## Quick Start

```bash
cd backend
npm install
npm run dev
```

Server should start on `http://localhost:5000`

---

## Common Errors & Solutions

### Error 1: "MODULE_NOT_FOUND"
**Cause:** Dependencies not installed  
**Fix:**
```bash
cd backend
npm install
```

### Error 2: "MongoDB Connection Refused"
**Cause:** MongoDB is not running  
**Fix:** Install and start MongoDB:

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Then start service:
net start "MongoDB"
# or use mongod.exe directly
mongod
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# or
mongod
```

**Docker (Easiest):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### Error 3: "EADDRINUSE: address already in use :::5000"
**Cause:** Port 5000 already in use  
**Fix:**
```bash
# Windows - kill process on port 5000:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Error 4: ".env not found"
**Cause:** Missing .env file  
**Fix:**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Error 5: "User model not found"
**Cause:** MongoDB schema issue  
**Fix:**
- Ensure MongoDB is running
- Check database with: `mongo` → `show databases`
- Restart backend after MongoDB is running

---

## Verify Everything Works

```bash
# Check server health
curl http://localhost:5000/health

# Should return:
# {"status":"Server is running","timestamp":"2026-02-24T..."}
```

---

## Offline Mode (No MongoDB needed!)

The app automatically falls back to localStorage if MongoDB is unavailable:
- ✅ Register/Login works offline
- ✅ User data saved locally
- ✅ No errors - just works!

---

## Debug Mode

Set environment variable to see detailed logs:

```bash
# Windows
set DEBUG=*
npm run dev

# Mac/Linux
DEBUG=* npm run dev
```

---

## Still Having Issues?

1. **Check Node version:**
   ```bash
   node --version  # Should be v16+
   npm --version   # Should be v7+
   ```

2. **Clear cache:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check .env file:**
   ```bash
   # Make sure these are set:
   cat .env
   ```

4. **Restart everything:**
   ```bash
   # Terminal 1: MongoDB
   mongod
   
   # Terminal 2: Backend
   cd backend && npm run dev
   
   # Terminal 3: Frontend
   npm run dev
   ```

---

## Backend is Running Successfully When You See:

```
✓ Server running on http://localhost:5000
✓ API Base: http://localhost:5000/api
✓ Health Check: http://localhost:5000/health
✓ MongoDB Connected: localhost
```

(MongoDB line is optional - app works without it)
