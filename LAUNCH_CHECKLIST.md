# 📋 Production Deployment Checklist

## Phase 0: Pre-Deployment (Do This First!)

- [ ] All code committed to GitHub
- [ ] Backend `.env.example` created
- [ ] Frontend `.env.production` template created
- [ ] `Procfile` added to backend
- [ ] `.gitignore` updated with `.env` and sensitive files
- [ ] All dependencies in `package.json`
- [ ] `npm audit` run and vulnerabilities fixed
- [ ] Code reviewed for console.log() statements (remove them)
- [ ] Admin seed script tested locally
- [ ] All features tested in local development

---

## Phase 1: Account Setup (15 minutes)

### Accounts to Create:

- [ ] **GitHub** - if not already
  - [ ] Repository created and code pushed
  - [ ] `.env` file added to `.gitignore`

- [ ] **MongoDB Atlas**
  - [ ] Sign up (free tier)
  - [ ] Organization created
  - [ ] Project created
  - [ ] Cluster created (free tier, US region)
  - [ ] Database user created (`bhuvan_admin`)
  - [ ] IP whitelist updated (0.0.0.0/0 for production)
  - [ ] Connection string saved securely

- [ ] **Render**
  - [ ] Sign up with GitHub
  - [ ] GitHub permissions authorized

- [ ] **Vercel**
  - [ ] Sign up with GitHub
  - [ ] GitHub permissions authorized

- [ ] **Namecheap** (for domain)
  - [ ] Account created
  - [ ] Domain searched and decided

---

## Phase 2: Database Configuration (15 minutes)

### In MongoDB Atlas:

- [ ] Free tier cluster running
- [ ] Database user created with strong password
- [ ] Network access configured (whitelist all for now)
- [ ] Connection string copied
  - Format: `mongodb+srv://bhuvan_admin:PASSWORD@cluster0.xxxxx.mongodb.net/bhuvan?retryWrites=true`

### Verify Connection:

```bash
# Test connection string locally before deploying
mongodb+srv://bhuvan_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bhuvan
```

---

## Phase 3: Backend Deployment (45 minutes)

### In Render Dashboard:

- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Deployment settings:
  - [ ] Name: `online-learning-api`
  - [ ] Runtime: Node
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `node src/index.js`
  - [ ] Region: Oregon (or nearest)
  - [ ] Plan: Free

### Environment Variables Added:

```
NODE_ENV = production
PORT = 5000
MONGODB_URI = mongodb+srv://bhuvan_admin:PASSWORD@cluster.mongodb.net/bhuvan
JWT_SECRET = (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-specific-password
FRONTEND_URL = https://yourdomain.com
LOG_LEVEL = info
```

- [ ] Environment variables added
- [ ] Deployment triggered
- [ ] ✅ Backend live (wait for green status)
- [ ] Backend URL copied: `https://your-api.onrender.com`

### Backend Testing:

```bash
# Test backend is responding
curl https://your-api.onrender.com/api/health

# Should return 200 OK
```

- [ ] Render dashboard showing "running" status
- [ ] No errors in logs
- [ ] Health check endpoint responds

---

## Phase 4: Frontend Deployment (30 minutes)

### In Vercel Dashboard:

- [ ] New Project created
- [ ] GitHub repository imported
- [ ] Build settings:
  - [ ] Framework: React
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `build`
  - [ ] Install Command: `npm install`

### Environment Variables:

```
REACT_APP_API_BASE_URL = https://your-api.onrender.com
```

- [ ] Environment variable added
- [ ] Deployment triggered
- [ ] ✅ Frontend live (watch for deployment)
- [ ] Frontend URL copied: `https://your-project.vercel.app`

### Frontend Testing:

- [ ] Frontend loads without errors
- [ ] Login page displays
- [ ] Try login with test account
- [ ] Check browser Network tab (API calls should go to Render backend)

---

## Phase 5: Domain Setup (30 minutes)

### Purchase Domain:

- [ ] Domain purchased on Namecheap (~$11)
- [ ] Domain name: `yourdomain.com`

### Connect Domain to Vercel:

In Vercel Project → Settings → Domains:

- [ ] Click "Add"
- [ ] Enter domain: `yourdomain.com`
- [ ] Vercel shows nameservers:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

### Update Namecheap Nameservers:

1. Log in to Namecheap
2. Go to your domain
3. Click "Manage" 
4. Go to "Nameservers" section
5. Select "Custom DNS"
6. Enter nameservers from Vercel
7. Click checkmark to save

- [ ] Nameservers updated

### Wait for DNS Propagation:

- [ ] Visit https://whatsmydns.net and check domain status
- [ ] Look for: `yourdomain.com` → points to Vercel IP
- [ ] Usually takes 5-30 minutes (up to 48 hours maximum)

### Verify Domain:

- [ ] `yourdomain.com` loads frontend ✅
- [ ] `https://yourdomain.com` redirects from http ✅
- [ ] SSL certificate working (green lock) ✅

---

## Phase 6: API Subdomain (Optional but Recommended)

### Add API Subdomain:

In Vercel Project → Settings → Domains:

- [ ] Add domain: `api.yourdomain.com`
- [ ] Point to Render backend URL

### Update Frontend:

Update [frontend/.env.production](frontend/.env.production):

```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

- [ ] Redeploy frontend on Vercel
- [ ] Wait for new deployment to complete

---

## Phase 7: Final Configuration

### Update Backend:

Render → Environment Variables:

- [ ] Update: `FRONTEND_URL = https://yourdomain.com`
- [ ] Update: `CORS` origin if needed

### Restart Backend:

- [ ] Render → Manual Deploy (or push to GitHub to auto-trigger)

### Run Database Seed Script:

Option 1: Via Render Shell (if available)
```bash
node seed-admin.js
```

Option 2: Connect locally and run:
```bash
MONGODB_URI="your-connection-string" node seed-admin.js
```

- [ ] Admin account created
- [ ] Default courses/classes seeded
- [ ] Test data added

---

## Phase 8: Feature Testing

### Authentication:

- [ ] Sign up as new user works ✅
- [ ] Login with email/password works ✅
- [ ] JWT token stored in localStorage ✅
- [ ] Logout clears token ✅

### Student Dashboard:

- [ ] "My Classes" tab loads classes ✅
- [ ] "My Fee" tab shows fees ✅
- [ ] Click class card opens class detail ✅

### Class Details:

- [ ] Materials load and display ✅
- [ ] Student list hidden from students ✅
- [ ] "My Attendance" tab shows attendance ✅
- [ ] Attendance percentage calculates correctly ✅

### Attendance System:

- [ ] Create a class (as teacher)
- [ ] Start live class (if Zoom integrated)
- [ ] Wait 5 minutes from class start time
- [ ] Check if attendance auto-marked ✅

### Email Service:

- [ ] Notifications sending to email ✅
- [ ] Check spam folder if not received

### File Uploads:

- [ ] Upload PDF material ✅
- [ ] Verify file stored in backend
- [ ] Download material works ✅

### Admin Dashboard:

- [ ] Login as admin user
- [ ] View all classes ✅
- [ ] View all students ✅
- [ ] View attendance data ✅

---

## Phase 9: Performance & Monitoring

### Check Performance:

- [ ] Frontend loads in <3 seconds
- [ ] API responses in <1 second
- [ ] Database queries optimized
- [ ] No memory leaks

### Setup Monitoring:

Render Dashboard → Your Service:

- [ ] View Logs (check for errors)
- [ ] Monitor memory usage
- [ ] Monitor CPU usage
- [ ] Setup email alerts for crashes

Vercel Dashboard → Analytics:

- [ ] View page performance
- [ ] Check for 4xx/5xx errors
- [ ] Monitor API response times

---

## Phase 10: Security Final Check

### Security Checklist:

- [ ] HTTPS/SSL working on domain ✅
- [ ] No sensitive data in logs ✅
- [ ] JWT_SECRET is strong (32+ chars) ✅
- [ ] `.env` file not committed to Git ✅
- [ ] CORS properly configured ✅
- [ ] Admin password changed from seed ✅
- [ ] Rate limiting enabled ✅
- [ ] Input validation working ✅
- [ ] No console.log() in production code ✅

### Backups:

- [ ] MongoDB backups configured in Atlas
- [ ] Test backup restoration works
- [ ] Backup retention set to 30 days minimum

---

## 🎯 Go-Live Checklist

Before announcing your site is live:

- [ ] All features tested on production domain
- [ ] No error messages exposed to users
- [ ] Admin account secured with strong password
- [ ] Monitoring alerts configured
- [ ] Team trained on how to use system
- [ ] FAQ/help docs prepared for users
- [ ] Support email/contact configured
- [ ] Analytics enabled (optional)
- [ ] Social media links updated
- [ ] Email list notified of launch

---

## 📞 Support & Troubleshooting

### If Login Fails:

1. Check backend logs in Render
2. Verify JWT_SECRET in environment
3. Check MONGODB_URI connection string
4. Verify user exists in MongoDB

### If Attendance Not Recording:

1. Check system time on server
2. Verify class start time is correct
3. Check backend logs for errors
4. Test with manual attendance endpoint

### If Emails Not Sending:

1. Verify EMAIL_USER is Gmail address
2. Use Gmail App Password (2FA required)
3. Check Gmail forwarding rules aren't blocking
4. Check spam folder for test emails

### If Site Loads Slowly:

1. Upgrade from free tier Render
2. Enable caching in Vercel
3. Optimize database queries
4. Check file upload sizes

### If Database Connection Fails:

1. Check MONGODB_URI format
2. Verify IP whitelist in MongoDB Atlas
3. Check username/password
4. Test connection string locally

---

## ✅ Launch Day Timeline

| Time | Task | Person |
|------|------|--------|
| 8:00 AM | Final testing | QA |
| 9:00 AM | Check all monitoring | DevOps |
| 9:30 AM | Verify backups | DevOps |
| 10:00 AM | Announce launch | Marketing |
| 10:30 AM | Monitor errors | DevOps |
| 11:00 AM | Support ready | Support |
| 2:00 PM | Verify no issues | QA |
| 5:00 PM | End-of-day review | Team |

---

## 🎉 Congratulations!

Your platform is now live! Here's what to do next:

- [ ] Monitor logs for errors
- [ ] Gather user feedback
- [ ] Document any issues
- [ ] Plan Phase 2 features
- [ ] Setup analytics
- [ ] Create user onboarding guide
- [ ] Share feedback form with users
- [ ] Schedule regular updates

**Keep improving! 🚀**

---

## 📞 Quick Reference

**Production URLs:**
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com
- Render Dashboard: https://render.com
- Vercel Dashboard: https://vercel.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

**Emergency Contacts:**
- Render Support: support@render.com
- Vercel Support: support@vercel.com
- MongoDB Support: support@mongodb.com
- Namecheap Support: support@namecheap.com

**Common Commands:**
```bash
# Check if domain is live
nslookup yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443

# Test API endpoint
curl https://api.yourdomain.com/health
```

---

**Last Updated:** Today  
**Status:** ✅ Ready for Deployment  
**Next Review:** Weekly for first month  
