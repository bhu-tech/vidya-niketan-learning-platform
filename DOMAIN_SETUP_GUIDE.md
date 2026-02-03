# 🌐 Domain Setup Guide for vidyaniketanhapur.in

## 🎯 Final Setup:
- **Main Website:** https://vidyaniketanhapur.in → Netlify
- **With WWW:** https://www.vidyaniketanhapur.in → Netlify
- **API Backend:** https://api.vidyaniketanhapur.in → Render

---

## 📋 Step-by-Step Setup

### **STEP 1: Configure Domain on Netlify (Frontend)**

1. **Go to Netlify Dashboard:**
   - Visit: https://app.netlify.com
   - Click on your site: `lucky-churros-038b55`

2. **Add Custom Domain:**
   - Click **"Domain settings"**
   - Click **"Add custom domain"**
   - Enter: `vidyaniketanhapur.in`
   - Click **"Verify"** and **"Add domain"**

3. **Also Add WWW Subdomain:**
   - Click **"Add domain alias"**
   - Enter: `www.vidyaniketanhapur.in`
   - Click **"Add domain"**

4. **Get Netlify DNS Settings:**
   Netlify will show you DNS records to add. You'll see something like:

   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: lucky-churros-038b55.netlify.app
   ```

   **Write these down!** You'll need them in Step 3.

5. **Enable HTTPS:**
   - Netlify will automatically provision SSL certificate (takes 1-2 hours)

---

### **STEP 2: Configure Custom Domain on Render (Backend)**

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Click on your service: `vidya-niketan-learning-platform`

2. **Add Custom Domain:**
   - Click **"Settings"** tab
   - Scroll to **"Custom Domain"** section
   - Click **"Add Custom Domain"**
   - Enter: `api.vidyaniketanhapur.in`
   - Click **"Save"**

3. **Get Render DNS Settings:**
   Render will show you a CNAME record:

   ```
   Type: CNAME
   Name: api
   Value: vidya-niketan-learning-platform.onrender.com
   ```

   **Write this down!** You'll need it in Step 3.

---

### **STEP 3: Configure DNS at Your Domain Registrar**

**Where did you buy vidyaniketanhapur.in?** (GoDaddy/Namecheap/Hostinger/Other?)

**For ANY registrar, add these DNS records:**

| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | `75.2.60.5` (from Netlify) | 3600 |
| CNAME | www | `lucky-churros-038b55.netlify.app` | 3600 |
| CNAME | api | `vidya-niketan-learning-platform.onrender.com` | 3600 |

**Common Registrar Instructions:**

#### **GoDaddy:**
1. Login → My Products → DNS → Manage Zones
2. Click your domain → Add Record
3. Add all 3 records above

#### **Namecheap:**
1. Domain List → Manage → Advanced DNS
2. Add New Record
3. Add all 3 records above

#### **Hostinger:**
1. Domains → Manage → DNS / Name Servers
2. Manage DNS records
3. Add all 3 records above

**⏱️ DNS propagation takes 1-24 hours (usually 1-2 hours)**

---

### **STEP 4: Update Environment Variables**

#### **On Render:**
1. Go to Render Dashboard → Environment tab
2. Update these variables:

```
FRONTEND_URL=https://vidyaniketanhapur.in
GOOGLE_CALLBACK_URL=https://api.vidyaniketanhapur.in/api/auth/google/callback
```

3. Click **"Save Changes"** (will auto-redeploy)

#### **On Netlify:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Add:

```
REACT_APP_API_URL=https://api.vidyaniketanhapur.in/api
```

3. Click **"Save"**
4. Go to **"Deploys"** → Click **"Trigger deploy"** → **"Deploy site"**

---

### **STEP 5: Update Code (Already Done in Next Steps)**

I'll update the code files with the new domain now.

---

## ✅ **Verification Checklist (After 1-2 Hours)**

- [ ] https://vidyaniketanhapur.in loads your website
- [ ] https://www.vidyaniketanhapur.in redirects to main site
- [ ] Green padlock (SSL) appears in browser
- [ ] Login/Signup works
- [ ] API calls work (check browser console - no CORS errors)

---

## 🔧 **Troubleshooting**

### **DNS Not Working?**
- Wait 1-2 hours for DNS propagation
- Check DNS: https://dnschecker.org → Enter `vidyaniketanhapur.in`

### **SSL Certificate Not Working?**
- Wait up to 24 hours for Netlify/Render to provision
- Both services provide FREE SSL automatically

### **CORS Errors?**
- Make sure environment variables are updated on both Netlify and Render
- Make sure both services redeployed after variable changes

---

## 📞 **Need Help?**
- Netlify Support: https://answers.netlify.com
- Render Support: https://render.com/docs
- DNS Checker: https://dnschecker.org

---

## 🎉 **Next Steps After Setup:**
1. Update Google OAuth callback URL in Google Console
2. Update Zoom callback URL in Zoom App settings
3. Update email templates with new domain
4. Share your new professional URL with students!
