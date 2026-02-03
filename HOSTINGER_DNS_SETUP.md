# 🌐 Hostinger DNS Setup for vidyaniketanhapur.in

## 📋 Step-by-Step Instructions

### **STEP 1: Access Hostinger DNS Settings**

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Navigate to Domains:**
   - Click **"Domains"** in the top menu
   - Find **"vidyaniketanhapur.in"**
   - Click **"Manage"** button next to it

3. **Open DNS/Nameservers:**
   - Click on **"DNS / Name Servers"** section
   - OR look for **"Manage DNS records"**

---

### **STEP 2: Add DNS Records**

You need to add **3 DNS records**. Here's what to add:

#### **Record 1: Main Domain (A Record)**
```
Type: A
Name: @ (or leave blank, or vidyaniketanhapur.in)
Points to: 75.2.60.5
TTL: 3600 (or Auto/Default)
```

**What this does:** Points your main domain to Netlify

---

#### **Record 2: WWW Subdomain (CNAME)**
```
Type: CNAME
Name: www
Points to: lucky-churros-038b55.netlify.app
TTL: 3600 (or Auto/Default)
```

**What this does:** Points www.vidyaniketanhapur.in to Netlify

---

#### **Record 3: API Subdomain (CNAME)**
```
Type: CNAME
Name: api
Points to: vidya-niketan-learning-platform.onrender.com
TTL: 3600 (or Auto/Default)
```

**What this does:** Points api.vidyaniketanhapur.in to your Render backend

---

### **STEP 3: Remove Conflicting Records (If Any)**

⚠️ **IMPORTANT:** Hostinger might have default records that conflict.

**Check for and DELETE these if they exist:**
- Any existing A record for `@` pointing to Hostinger's IP
- Any existing CNAME for `www` pointing to Hostinger
- Any parking page records

**Keep these (DON'T delete):**
- MX records (for email, if you have any)
- TXT records (for verification)

---

### **STEP 4: Save and Wait**

1. **Click "Save" or "Add Record"** for each DNS record
2. **Wait for DNS propagation:** 30 minutes to 24 hours (usually 1-2 hours)

---

### **STEP 5: Configure Netlify**

1. **Go to Netlify:**
   - Visit: https://app.netlify.com
   - Click on your site: **lucky-churros-038b55**

2. **Add Custom Domain:**
   - Click **"Domain settings"** (or "Domain management")
   - Click **"Add custom domain"** or **"Add domain alias"**
   - Enter: `vidyaniketanhapur.in`
   - Click **"Verify"** then **"Add domain"**
   
3. **Netlify will show a warning** - ignore it, you've already set up DNS

4. **Add WWW Domain:**
   - Click **"Add domain alias"**
   - Enter: `www.vidyaniketanhapur.in`
   - Click **"Add domain"**

5. **Add Environment Variable:**
   - Go to **"Site settings"** → **"Environment variables"**
   - Click **"Add a variable"**
   - Key: `REACT_APP_API_URL`
   - Value: `https://api.vidyaniketanhapur.in/api`
   - Click **"Create variable"**

6. **Trigger Redeploy:**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

7. **Enable HTTPS:**
   - Go back to **"Domain settings"**
   - Scroll to **"HTTPS"** section
   - Click **"Verify DNS configuration"**
   - Wait for SSL certificate (1-24 hours, usually instant)

---

### **STEP 6: Configure Render**

1. **Go to Render:**
   - Visit: https://dashboard.render.com
   - Click: **vidya-niketan-learning-platform**

2. **Add Custom Domain:**
   - Click **"Settings"** tab
   - Scroll to **"Custom Domain"**
   - Click **"Add Custom Domain"**
   - Enter: `api.vidyaniketanhapur.in`
   - Click **"Save"**

3. **Update Environment Variables:**
   - Click **"Environment"** tab
   - Find or add: `FRONTEND_URL`
   - Update value to: `https://vidyaniketanhapur.in`
   - Find: `GOOGLE_CALLBACK_URL`
   - Update to: `https://api.vidyaniketanhapur.in/api/auth/google/callback`
   - Click **"Save Changes"**

4. **Wait for Redeploy:**
   - Render will automatically redeploy (2-3 minutes)
   - Wait for status to show **"Live"**

---

## ✅ **Verification (After 1-2 Hours)**

### **Check DNS Propagation:**
1. Go to: https://dnschecker.org
2. Enter: `vidyaniketanhapur.in`
3. Select **"A"** record type
4. Should show: `75.2.60.5` globally

### **Check WWW:**
1. Go to: https://dnschecker.org
2. Enter: `www.vidyaniketanhapur.in`
3. Select **"CNAME"** record type
4. Should show: `lucky-churros-038b55.netlify.app`

### **Check API:**
1. Go to: https://dnschecker.org
2. Enter: `api.vidyaniketanhapur.in`
3. Select **"CNAME"** record type
4. Should show: `vidya-niketan-learning-platform.onrender.com`

### **Test Your Website:**
- [ ] Visit https://vidyaniketanhapur.in
- [ ] Should load your website
- [ ] Green padlock (SSL) should appear
- [ ] Try login/signup
- [ ] Check browser console (F12) - should have NO CORS errors

---

## 🎯 **Quick Reference - DNS Records**

Copy these exact values into Hostinger:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 75.2.60.5 | 3600 |
| CNAME | www | lucky-churros-038b55.netlify.app | 3600 |
| CNAME | api | vidya-niketan-learning-platform.onrender.com | 3600 |

---

## 🔧 **Troubleshooting**

### **"DNS not configured" on Netlify?**
- Wait 1-2 hours for DNS propagation
- Click "Verify DNS configuration" again

### **SSL not working?**
- Wait up to 24 hours
- Make sure DNS is fully propagated first
- Netlify auto-provisions Let's Encrypt SSL

### **Website not loading?**
- Clear browser cache (Ctrl + Shift + Delete)
- Try incognito mode
- Check DNS with dnschecker.org

### **Login not working / CORS errors?**
- Make sure Render redeployed with new FRONTEND_URL
- Check environment variables are saved
- Wait for both services to fully redeploy

---

## 📞 **Support Links**
- Hostinger DNS Help: https://support.hostinger.com/en/articles/1583227-how-to-manage-dns-records
- Netlify Custom Domain: https://docs.netlify.com/domains-https/custom-domains/
- Render Custom Domain: https://render.com/docs/custom-domains

---

## 🎉 **Success Checklist**

After setup is complete:

- [x] Code updated with domain (already done ✅)
- [ ] Hostinger DNS records added
- [ ] Netlify custom domain configured
- [ ] Netlify redeployed with new env variable
- [ ] Render custom domain configured
- [ ] Render redeployed with new env variables
- [ ] DNS propagated (wait 1-2 hours)
- [ ] SSL certificates issued (automatic)
- [ ] Website accessible at https://vidyaniketanhapur.in
- [ ] Login/signup working
- [ ] No CORS errors in console

**Your professional learning platform will be live! 🚀**
