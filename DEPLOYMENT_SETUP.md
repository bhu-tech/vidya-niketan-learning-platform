# 🚀 Deployment Setup Guide

## Quick Deployment Path (Recommended)

**Total Time:** ~3 hours | **Cost:** Free tier → ~$15/month  
**Services:** Render (Backend) + Vercel (Frontend) + MongoDB Atlas (Database) + Namecheap (Domain)

---

## Step 1: Prepare Your Code (30 minutes)

### 1.1 Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit - ready for production"
git remote add origin https://github.com/YOUR_USERNAME/online-learning-platform.git
git push -u origin main
```

### 1.2 Add Production Environment Files

**Backend `.env` file (Create manually, DON'T commit):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bhuvan
JWT_SECRET=generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

**Frontend `.env.production` file (Create manually):**
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_NAME=Online Learning Platform
```

### 1.3 Update Backend for Production

Edit [backend/src/index.js](backend/src/index.js):
```javascript
// Add CORS configuration for production domain
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## Step 2: Database Setup (15 minutes)

### 2.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with Google or email
3. Create Organization → Create Project → Create Cluster
4. Choose: FREE tier
5. Region: US-EAST-1
6. Cluster Name: `bhuvan-production`

### 2.2 Create Database User

In MongoDB Atlas Dashboard:
- Go to Database Access → Add New Database User
- Username: `bhuvan_admin`
- Password: Generate a strong password
- Role: Read and write to any database
- **Save this password - you'll need it in Step 4**

### 2.3 Allow Network Access

- Go to Network Access → Add IP Address
- Select "Allow access from anywhere" (0.0.0.0/0)
- Click Confirm

### 2.4 Get Connection String

- Go to Clusters → Connect → Connect your application
- Copy the MongoDB URI
- Replace `<username>` and `<password>` with your credentials
- Save it for Step 4

---

## Step 3: Backend Deployment (45 minutes)

### 3.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize GitHub access

### 3.2 Deploy Backend to Render

1. In Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configuration:
   - **Name:** `online-learning-api`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Plan:** Free

4. Add Environment Variables (click "Advanced"):
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = (paste your MongoDB connection string)
   JWT_SECRET = (generate new secret)
   EMAIL_USER = your-gmail@gmail.com
   EMAIL_PASSWORD = your-app-password
   FRONTEND_URL = https://yourdomain.com
   LOG_LEVEL = info
   ```

5. Click "Create Web Service"
6. **Wait for deployment (2-3 minutes)**
7. Copy your Render URL: `https://your-api-name.onrender.com`

### 3.3 Update CORS for Production

Go back to [backend/src/index.js](backend/src/index.js) and update CORS to accept your Render domain during testing.

---

## Step 4: Frontend Deployment (30 minutes)

### 4.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize GitHub

### 4.2 Deploy Frontend to Vercel

1. In Vercel Dashboard → Add New → Project
2. Import your GitHub repository
3. Configuration:
   - **Framework:** React
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. Environment Variables:
   ```
   REACT_APP_API_BASE_URL=https://your-api-name.onrender.com
   ```

5. Click "Deploy"
6. **Wait for deployment (2-3 minutes)**
7. Copy your Vercel URL: `https://your-project.vercel.app`

### 4.3 Test Frontend Connection

- Open your Vercel URL
- Try logging in - should connect to your Render backend
- Check browser console for any errors

---

## Step 5: Domain Setup (30 minutes)

### 5.1 Purchase Domain

1. Go to https://www.namecheap.com
2. Search for your desired domain
3. Add to cart and checkout
4. Use coupon code for discount (Google: "namecheap coupon 2024")
5. **Note down your domain name**

### 5.2 Connect Domain to Vercel

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add" → Enter your domain
3. Choose "Use Namecheap nameservers"
4. Vercel will show you 2 nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

### 5.3 Update Namecheap Nameservers

1. Go to Namecheap → Your Domains → Manage
2. Find "Nameservers" section
3. Select "Custom DNS"
4. Enter the two Vercel nameservers
5. Click checkmark to save
6. **Wait 24-48 hours for propagation**

### 5.4 Setup API Subdomain (Optional but Recommended)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add subdomain: `api.yourdomain.com`
3. Create CNAME record in Namecheap pointing to your Render URL
4. Update frontend `.env` to use: `https://api.yourdomain.com`

---

## Step 6: Final Configuration (15 minutes)

### 6.1 Update Backend Environment

Render Dashboard → Your Service → Environment:
```
FRONTEND_URL=https://yourdomain.com
```

### 6.2 Test All Features

- [ ] Login/Signup works
- [ ] Create a class
- [ ] Attendance marking works
- [ ] Fee details display
- [ ] Email notifications sent
- [ ] Zoom link works (if enabled)
- [ ] PDF uploads work
- [ ] Student dashboard loads

### 6.3 Setup SSL/HTTPS

Vercel and Render automatically provide HTTPS certificates. No manual setup needed!

---

## Step 7: Monitoring & Maintenance

### 7.1 Monitor Backend Logs

Render Dashboard → Your Service → Logs
```
Watch for any errors or warnings
```

### 7.2 Monitor Frontend

Vercel Dashboard → Analytics
```
View performance metrics
```

### 7.3 Database Backup

MongoDB Atlas → Backup:
- Enable automatic backups
- Set retention to 30 days
- Test backup restoration monthly

---

## 🆘 Troubleshooting

### "CORS Error" in Frontend
**Solution:** Update `FRONTEND_URL` in Render backend environment variables

### "Cannot connect to database"
**Solution:** 
1. Check MongoDB connection string in `.env`
2. Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
3. Verify username and password are correct

### "Build fails on Vercel"
**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `build` script exists in frontend `package.json`
3. Verify all dependencies are listed in `package.json`

### "Email not sending in production"
**Solution:**
1. Use Gmail App Password (not regular password)
2. Enable "Less secure app access" if not using App Password
3. Check EMAIL_USER and EMAIL_PASSWORD in Render env

### "Slow performance after deployment"
**Solution:**
1. Upgrade from free tier to paid
2. Enable caching in Vercel
3. Optimize database indexes in MongoDB

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid (Minimal) | Notes |
|---------|-----------|---|---|
| **MongoDB Atlas** | Free | ~$57/month | Free includes 512MB storage |
| **Render** | Free | $7/month | Free sleeps after 15 min inactivity |
| **Vercel** | Free | $20/month | Free includes unlimited deployments |
| **Domain** | N/A | ~$11/year | Varies by TLD |
| **Gmail** | Free | N/A | Free with Google account |
| **TOTAL** | **Free** | **~$40-50/month** | Varies by traffic |

---

## 🎯 What's Next?

1. ✅ Code ready for production
2. ⏳ Choose deployment services (Render + Vercel + MongoDB Atlas)
3. ⏳ Setup accounts and configure
4. ⏳ Deploy code
5. ⏳ Setup domain
6. ⏳ Test everything works
7. ⏳ Monitor for issues
8. ⏳ Scale as needed

**Estimated Timeline:** 3-4 hours for complete setup

---

## 📚 Quick Reference

- **Backend URL:** https://api.yourdomain.com
- **Frontend URL:** https://yourdomain.com
- **Admin Email:** your-email@gmail.com
- **Database:** MongoDB Atlas (yourdomain)
- **Logs:** Render Dashboard
- **Analytics:** Vercel Dashboard

---

## ❓ Need Help?

- **Render Support:** https://render.com/docs
- **Vercel Support:** https://vercel.com/docs
- **MongoDB Support:** https://docs.mongodb.com
- **GitHub Support:** https://github.com/support

Good luck with your deployment! 🎉
