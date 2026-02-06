# 🔐 Google OAuth Setup Guide

## Step-by-Step Instructions

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click on the project dropdown (top left)
- Click "New Project"
- Name it: "Online Learning Platform" (or any name you prefer)
- Click "Create"

### 3. Enable Required APIs
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" or "Google Identity Services"
- Click on it and click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" (unless you have a Google Workspace)
- Click "Create"
- Fill in:
  - **App name**: Online Learning Platform
  - **User support email**: Your email
  - **Developer contact information**: Your email
- Click "Save and Continue"
- Skip "Scopes" (click "Save and Continue")
- Skip "Test users" (click "Save and Continue")
- Click "Back to Dashboard"

### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Choose Application type: **Web application**
- Name: "Online Learning Web Client"

### 6. Add Authorized JavaScript Origins

**For Development:**
```
http://localhost:3000
```

**For Production (add ALL of these):**
```
https://lucky-churros-038b55.netlify.app
https://vidyaniketanhapur.in
https://www.vidyaniketanhapur.in
```

### 7. Add Authorized Redirect URIs

**For Development:**
```
http://localhost:5000/api/auth/google/callback
```

**For Production:**
```
https://your-backend-url.onrender.com/api/auth/google/callback
```
*Replace `your-backend-url` with your actual backend domain*

### 8. Get Your Credentials
- Click "Create"
- Copy the **Client ID** and **Client Secret**
- Paste them in `backend/.env`:

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

### 9. Restart Your Backend
```bash
# Stop the backend (Ctrl+C in the terminal)
# Then restart it:
cd backend
npm run dev
```

## 📸 Visual Guide

### What the OAuth Consent Screen Looks Like:
![OAuth Setup](https://developers.google.com/identity/images/oauth-consent-screen.png)

### Authorized JavaScript Origins Example:
```
Origin 1: http://localhost:3000
Origin 2: https://lucky-churros-038b55.netlify.app
Origin 3: https://vidyaniketanhapur.in
Origin 4: https://www.vidyaniketanhapur.in
```

### Authorized Redirect URIs Example:
```
URI 1: http://localhost:5000/api/auth/google/callback
URI 2: https://your-backend-url.onrender.com/api/auth/google/callback
```

## ⚠️ Important Notes

1. **Must include BOTH development and production URLs** in the same OAuth client
2. **JavaScript Origins** = Where the user initiates login (Frontend URLs)
3. **Redirect URIs** = Where Google sends the user after login (Backend callback URLs)
4. **Don't forget the `/api/auth/google/callback` path** in redirect URIs
5. **Use `http://` for localhost** (not https)
6. **Use `https://` for production** (always)

## 🧪 Testing

After setup:

1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. You should see the Google login popup
4. After signing in, you'll be redirected back to your app

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- The redirect URI in your code doesn't match what's in Google Console
- Check that you added: `http://localhost:5000/api/auth/google/callback`
- Make sure there are no trailing slashes

### Error: "Origin not allowed"
- The frontend URL is not in "Authorized JavaScript origins"
- Add: `http://localhost:3000`

### Error: "invalid_client"
- Client ID or Secret is wrong
- Double-check you copied them correctly to `.env`
- Make sure there are no extra spaces

### Google login page doesn't appear
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart the backend server
- Check browser console for errors

## 🌐 Production Deployment

When deploying to production:

1. Add your production URLs to the same OAuth client
2. Update `GOOGLE_CALLBACK_URL` in your production environment variables
3. Don't create a separate OAuth client - use the same one for dev and production

### Example Production Environment Variables:
```env
GOOGLE_CLIENT_ID=same_as_development
GOOGLE_CLIENT_SECRET=same_as_development
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback
```

## ✅ Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Added localhost:3000 to JavaScript origins
- [ ] Added Netlify URL to JavaScript origins
- [ ] Added localhost:5000/api/auth/google/callback to redirect URIs
- [ ] Added production backend URL to redirect URIs
- [ ] Copied Client ID to backend/.env
- [ ] Copied Client Secret to backend/.env
- [ ] Restarted backend server
- [ ] Tested Google Sign-In on localhost

---

Need help? Check the [official Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
