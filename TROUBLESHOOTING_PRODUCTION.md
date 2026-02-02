# 🔧 Production Troubleshooting Guide

## Common Issues & Solutions

---

## 1. Login/Authentication Issues

### Issue: "Invalid credentials" even with correct password

**Symptoms:**
- Email and password are correct
- Get "Invalid credentials" error
- Works locally but not on production

**Debugging:**
```bash
# Check in Render logs
# Look for JWT errors or database connection issues

# Verify MongoDB connection
# Test connection string format:
# mongodb+srv://username:password@cluster.mongodb.net/dbname

# Check if password contains special characters
# Some characters need URL encoding:
# @ = %40, # = %23, ! = %21, etc.
```

**Solutions:**
1. **Check MongoDB connection string:**
   ```
   Format: mongodb+srv://bhuvan_admin:PASSWORD@cluster.mongodb.net/bhuvan
   - Verify username is correct
   - Verify password is URL-encoded if special characters
   - Verify database name matches
   - Verify cluster name matches
   ```

2. **Check JWT Secret:**
   ```
   - Render → Environment Variables
   - Verify JWT_SECRET is set
   - Verify it's not empty or has no spaces
   - Must be same as backend
   ```

3. **Restart backend:**
   ```
   Render Dashboard → Your Service → Manual Deploy
   ```

4. **Check user exists in database:**
   ```
   MongoDB Atlas → Collections → Users
   Verify user record exists with hashed password
   ```

---

### Issue: "Token expired" immediately after login

**Symptoms:**
- Login works
- Get redirected to dashboard
- Immediately logged out
- Token showing as expired

**Debugging:**
```javascript
// Check token expiration in frontend
localStorage.getItem('token')
// Decode JWT to see expiration:
// jwt.io - paste token to see payload
```

**Solutions:**
1. **Check JWT_SECRET is consistent:**
   ```
   - JWT_SECRET in Render env must match backend
   - If changed recently, all old tokens are invalid
   - Users need to login again
   ```

2. **Check system time on server:**
   ```
   If server time is ahead, tokens expire immediately
   Contact Render support if time is wrong
   ```

3. **Increase token expiration (if needed):**
   ```javascript
   // backend/src/controllers/authController.js
   // Change from '24h' to '7d' for 7 days
   jwt.sign(payload, secret, { expiresIn: '7d' })
   ```

4. **Clear browser localStorage:**
   ```javascript
   // In browser console:
   localStorage.clear()
   // Refresh page and login again
   ```

---

## 2. Attendance Issues

### Issue: Attendance not marking automatically

**Symptoms:**
- Create a class, wait 5 minutes
- Student joins after 5 minutes
- Attendance still shows as "0%"
- No error messages

**Debugging:**
```bash
# Check Render logs for attendance marking
# Look for: "Marking attendance" messages

# Check attendance database records
# MongoDB Atlas → Collections → Attendances

# Verify class start time
# Should be within last 5 minutes
```

**Solutions:**
1. **Check class start time:**
   ```
   - Class should have been created with correct time
   - Should be: Date.now() (current time)
   - Backend validates: joinTime <= classStartTime + 5min
   ```

2. **Check if joinTime is being sent:**
   ```javascript
   // frontend/src/dashboards/TeacherDashboard.jsx
   // When creating class, should include joinTime: new Date()
   ```

3. **Verify attendance route is accessible:**
   ```bash
   # Test in postman or curl
   curl -X POST https://api.yourdomain.com/api/attendance/mark/CLASS_ID \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json"
   ```

4. **Check database for attendance records:**
   ```javascript
   // MongoDB: db.attendances.find({ classId: "..." })
   // Should show records with isPresent: true
   ```

5. **Verify 5-minute logic:**
   ```javascript
   // backend/src/routes/attendanceRoutes.js
   // Current time - class start time should be > 5 minutes
   // Compare in milliseconds: (now - classStart) > (5 * 60 * 1000)
   ```

---

### Issue: Attendance showing for wrong class

**Symptoms:**
- Student joins Class A
- Attendance marked for Class B
- Wrong class attendance percentage

**Solutions:**
1. **Verify classId is passed correctly:**
   ```javascript
   // Check class detail page has correct classId
   // URL should have class ID: /class/CLASS_ID
   ```

2. **Check attendance query filters:**
   ```javascript
   // Should filter by both classId and studentId
   Attendance.find({ classId, studentId })
   ```

3. **Verify database relationships:**
   ```javascript
   // MongoDB: Check that attendance has correct classId
   db.attendances.find({ studentId: "..." })
   // All should have correct classId
   ```

---

## 3. Database Connection Issues

### Issue: "Cannot connect to MongoDB"

**Symptoms:**
- Login page shows error
- API returns 500 error
- Render logs show database connection error

**Debugging:**
```bash
# Check MongoDB Atlas status
# Atlas Dashboard → Clusters → Cluster status

# Verify connection string
# Format: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Check IP whitelist
# Atlas Dashboard → Network Access
```

**Solutions:**
1. **Verify connection string format:**
   ```
   mongodb+srv://bhuvan_admin:PASSWORD@cluster.mongodb.net/bhuvan
   - Check for typos in cluster name
   - Check password is correct
   - URL encode special characters if needed
   - Verify database name exists
   ```

2. **Check IP whitelist:**
   ```
   MongoDB Atlas → Network Access
   - Should show 0.0.0.0/0 (allow all)
   - If restricted, add Render's IP address
   - Contact Render support for their IP range
   ```

3. **Verify database user:**
   ```
   MongoDB Atlas → Database Access
   - User should exist (bhuvan_admin)
   - Should have "Read and write to any database" role
   - Password should not have expired
   ```

4. **Test connection locally:**
   ```bash
   # Create test file: test-connection.js
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
     .then(() => console.log('Connected!'))
     .catch(err => console.log('Error:', err));
   
   # Run: MONGODB_URI="..." node test-connection.js
   ```

5. **Restart MongoDB cluster:**
   ```
   MongoDB Atlas → Clusters → Click cluster
   - Stop cluster
   - Wait 1 minute
   - Start cluster
   ```

---

## 4. Frontend Issues

### Issue: API calls return 404 - Not Found

**Symptoms:**
- Frontend loads but can't login
- Browser console shows 404 errors
- Network tab shows requests to wrong URL

**Debugging:**
```javascript
// Browser console - check what URL is being called
// Should be: https://api.yourdomain.com/api/...
// Check console logs to see actual URLs
```

**Solutions:**
1. **Check API base URL in frontend:**
   ```
   Vercel Dashboard → Project → Settings → Environment Variables
   REACT_APP_API_BASE_URL should be: https://api.yourdomain.com
   ```

2. **Verify API_BASE_URL is being used:**
   ```javascript
   // frontend/src/utils/api.js
   // Should use: process.env.REACT_APP_API_BASE_URL
   // Not hardcoded localhost
   ```

3. **Redeploy frontend after changing env vars:**
   ```
   Vercel automatically redeploys on git push
   Or: Vercel Dashboard → Deployments → Redeploy
   ```

4. **Clear browser cache:**
   ```
   Browser DevTools → Application → Clear Storage
   Or: Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   ```

5. **Verify backend is running:**
   ```bash
   # Test backend directly
   curl https://api.yourdomain.com/api/health
   # Should return 200 OK
   ```

---

### Issue: "CORS error" in browser console

**Symptoms:**
- Frontend shows error in console
- Error mentions "CORS", "origin", "Access-Control"
- API call is blocked by browser

**Debugging:**
```javascript
// Browser console shows:
// "Access to XMLHttpRequest... blocked by CORS policy"
// Check what origin is being rejected
```

**Solutions:**
1. **Verify backend CORS configuration:**
   ```javascript
   // backend/src/index.js
   // Should include FRONTEND_URL in allowedOrigins
   allowedOrigins: [
     'https://yourdomain.com',
     'https://www.yourdomain.com'
   ]
   ```

2. **Update FRONTEND_URL in Render:**
   ```
   Render Dashboard → Environment → FRONTEND_URL
   Should be: https://yourdomain.com (without /api)
   ```

3. **Restart backend:**
   ```
   Render Dashboard → Manual Deploy
   ```

4. **Check if API subdomain is working:**
   ```bash
   # Test API subdomain
   curl https://api.yourdomain.com/api/health
   # Should not return CORS error
   ```

---

## 5. Email Issues

### Issue: Emails not sending

**Symptoms:**
- No emails received after signup/notification
- Render logs show email errors
- Error mentions Gmail or SMTP

**Debugging:**
```bash
# Check Render logs for email-related errors
# Look for keywords: "email", "nodemailer", "SMTP", "Gmail"

# Verify Gmail credentials
# Test sending manually
```

**Solutions:**
1. **Verify Gmail App Password:**
   ```
   - Must enable 2-Factor Authentication on Google Account
   - Go to: myaccount.google.com/apppasswords
   - App: Mail, Device: Windows Computer (or your OS)
   - Get 16-character password (without spaces)
   - Use this as EMAIL_PASSWORD in .env
   ```

2. **Update Render environment variables:**
   ```
   EMAIL_USER: your-email@gmail.com (full email)
   EMAIL_PASSWORD: 16-character-app-password (no spaces)
   ```

3. **Verify email template:**
   ```javascript
   // backend/src/utils/emailTemplates.js
   // Check template is not empty
   // Check HTML is valid
   ```

4. **Test email locally first:**
   ```bash
   # Create test file: test-email.js
   require('dotenv').config();
   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransport({
     service: 'Gmail',
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD
     }
   });
   
   transporter.sendMail({
     from: process.env.EMAIL_USER,
     to: 'test@example.com',
     subject: 'Test',
     html: '<h1>Hello</h1>'
   }, (err, info) => {
     if (err) console.log('Error:', err);
     else console.log('Sent:', info.response);
   });
   ```

5. **Check spam folder:**
   ```
   - Sometimes emails go to spam
   - Add noreply@yourdomain.com to contacts
   - Check Gmail filters
   ```

6. **Verify EMAIL_USER is not in recovery/limited:**
   ```
   - Gmail might limit sending if unusual activity
   - Login to Gmail account directly to verify
   - Allow "Less secure apps" if needed (not recommended)
   - Use App Password instead
   ```

---

## 6. File Upload Issues

### Issue: PDF uploads failing

**Symptoms:**
- Upload button greyed out or not working
- Error message about file size or type
- File not appearing after upload

**Debugging:**
```bash
# Check Render logs for upload errors
# Check uploads folder exists

# Verify file was saved
# MongoDB: Check Material record has file path
```

**Solutions:**
1. **Check file size limit:**
   ```javascript
   // Should be 10MB: 10 * 1024 * 1024
   // Browser shows: "File too large"
   ```

2. **Verify file type:**
   ```javascript
   // Only PDF allowed: application/pdf
   // If trying to upload non-PDF, will fail
   ```

3. **Check uploads folder exists:**
   ```
   backend/uploads/pdfs/ directory must exist
   If missing, create it manually
   ```

4. **Verify write permissions:**
   ```bash
   # Render should have permission to write to uploads/
   # Check Render logs for permission errors
   ```

5. **Test file upload locally:**
   ```bash
   # Test with small PDF file first
   # Should save to backend/uploads/pdfs/
   ```

---

## 7. Performance Issues

### Issue: Site loading slowly

**Symptoms:**
- Pages take > 3 seconds to load
- Dashboard feels sluggish
- Database queries slow

**Solutions:**
1. **Upgrade from free tier:**
   ```
   Free tier Render/Vercel have rate limits
   Upgrade to Hobby/Pro for better performance
   ```

2. **Check database size:**
   ```
   MongoDB Atlas Dashboard
   If approaching 512MB limit, upgrade tier
   ```

3. **Optimize database queries:**
   ```javascript
   // Add indexes for frequently queried fields
   db.users.createIndex({ email: 1 })
   db.classes.createIndex({ teacher: 1 })
   db.attendances.createIndex({ class: 1, student: 1 })
   ```

4. **Enable frontend caching:**
   ```
   Vercel auto-caches static assets
   No additional setup needed
   ```

5. **Check Render memory usage:**
   ```
   Render Dashboard → Metrics
   If approaching 512MB, needs upgrade
   ```

6. **Monitor API response times:**
   ```
   Vercel Dashboard → Analytics → Response times
   If > 1 second, database or query optimization needed
   ```

---

## 8. Deployment Issues

### Issue: "Build failed" on Vercel

**Symptoms:**
- Vercel shows red X
- Can't deploy frontend
- Build error in logs

**Debugging:**
```bash
# Check Vercel build logs
# Look for specific error messages
```

**Solutions:**
1. **Check build command:**
   ```
   Vercel → Settings → Build settings
   Should be: npm run build
   ```

2. **Verify dependencies:**
   ```bash
   # Make sure all packages in code are in package.json
   npm install missing-package
   # Commit and push again
   ```

3. **Check Node version:**
   ```
   Vercel → Settings → Node version
   Should be 18.x or higher
   ```

4. **Clear build cache:**
   ```
   Vercel → Deployments → Right-click → Clear Cache
   Then redeploy
   ```

---

### Issue: "Build failed" on Render

**Symptoms:**
- Render shows build error
- Backend won't start
- Red status

**Solutions:**
1. **Check start command:**
   ```
   Render → Service → Settings
   Start Command should be: node src/index.js
   ```

2. **Verify environment variables:**
   ```
   All required env vars must be set
   Missing any will cause startup failure
   ```

3. **Check logs for specific error:**
   ```
   Render → Logs
   Usually shows exact error (e.g., module not found)
   ```

4. **Verify dependencies:**
   ```bash
   npm install
   npm list
   # Make sure all dependencies listed
   ```

---

## 9. Network/DNS Issues

### Issue: Domain doesn't resolve

**Symptoms:**
- yourdomain.com shows "ERR_NAME_NOT_RESOLVED"
- "Domain not found" error
- DNS not working

**Debugging:**
```bash
# Check DNS status
nslookup yourdomain.com

# Check from different DNS servers
nslookup yourdomain.com 8.8.8.8

# Check if nameservers set correctly
dig yourdomain.com

# Check propagation
# https://whatsmydns.net
```

**Solutions:**
1. **Wait for DNS propagation:**
   ```
   - Takes 5-30 minutes usually
   - Up to 48 hours maximum
   - Use whatsmydns.net to check progress
   ```

2. **Verify nameservers at registrar:**
   ```
   Namecheap → Your Domains → Manage
   Should show: ns1.vercel-dns.com, ns2.vercel-dns.com
   ```

3. **Verify domain added to Vercel:**
   ```
   Vercel Project → Settings → Domains
   Should show yourdomain.com with green checkmark
   ```

4. **Check domain hasn't expired:**
   ```
   Namecheap → Your Domains → Expiration date
   If expired, renewals or domain will be released
   ```

---

### Issue: SSL/HTTPS not working

**Symptoms:**
- Red warning instead of green lock
- "Not secure" warning
- Certificate error

**Solutions:**
1. **Wait for certificate provisioning:**
   ```
   - Vercel auto-provisions SSL
   - Takes 5-30 minutes after domain setup
   - Check: Vercel Settings → Domains → SSL status
   ```

2. **Verify domain is added to Vercel:**
   ```
   Vercel Settings → Domains
   Should show domain with green checkmark
   ```

3. **Clear browser cache:**
   ```
   Browser cache might have old non-HTTPS version
   Clear cache and refresh
   ```

4. **Force HTTPS redirect:**
   ```javascript
   // backend/src/index.js add:
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       }
       next();
     });
   }
   ```

---

## 10. Monitoring & Alerts

### Issue: Service went down, didn't notice

**Symptoms:**
- Users reported site is down
- You didn't get any notification
- Render/Vercel crashed silently

**Solutions:**

1. **Setup Render error alerts:**
   ```
   Render → Your Service → Settings → Alerts
   - Email notification on deploy failed
   - Email notification on error threshold
   ```

2. **Setup Vercel analytics:**
   ```
   Vercel → Analytics
   - View error rates
   - Monitor performance
   ```

3. **Setup external monitoring (UptimeRobot):**
   ```
   https://uptimerobot.com
   - Free tier checks every 5 minutes
   - Alerts if site goes down
   - Confirms back when up
   ```

4. **Setup log monitoring:**
   ```
   Render → Logs
   - Regularly check for errors
   - Use grep to find specific issues: 'ERROR', 'Fatal', etc.
   ```

---

## Escalation Path

**If you're stuck:**

1. **Check Render Docs:**
   https://render.com/docs

2. **Check Vercel Docs:**
   https://vercel.com/docs

3. **Check MongoDB Docs:**
   https://docs.mongodb.com

4. **Check our custom docs:**
   - [DEPLOYMENT_SETUP.md](DEPLOYMENT_SETUP.md)
   - [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)
   - [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)

5. **Community forums:**
   - GitHub Discussions
   - Stack Overflow
   - Discord communities

6. **Paid support:**
   - Render Pro Support
   - Vercel Premium Support
   - MongoDB Premium Support

---

## Quick Reference Commands

```bash
# Test backend connectivity
curl https://api.yourdomain.com/api/health

# Test DNS resolution
nslookup yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443

# Check MongoDB connection (locally)
MONGODB_URI="..." node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log('Error:', e))"

# Decode JWT token
# Use: https://jwt.io or node command

# Check port availability
lsof -i :5000  # Unix/Mac
netstat -ano | findstr :5000  # Windows
```

---

**Still stuck? Review the logs first - they usually have the answer! 🔍**

