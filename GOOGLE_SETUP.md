# Google OAuth Setup Guide

## Getting Google OAuth Credentials

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a Project" → "New Project"
3. Enter project name: "Online Learning Platform"
4. Click "Create"

### Step 2: Enable Google+ API
1. Search for "Google+ API"
2. Click "Enable"
3. Wait for activation

### Step 3: Create OAuth Credentials
1. Go to "Credentials" in left sidebar
2. Click "Create Credentials" → "OAuth Client ID"
3. Select "Web Application"
4. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:3000` (frontend)
5. Click "Create"
6. Copy Client ID and Client Secret

### Step 4: Add to Backend .env
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## User Consent Screen Setup

1. Go to "OAuth consent screen"
2. Select "External" user type
3. Fill in app information:
   - App name: "Online Learning Platform"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - email
   - profile
   - openid
5. Save

## Testing Google Sign-In

1. Start frontend: `npm start`
2. Go to login page
3. Click "Sign in with Google"
4. Use test Google account
5. Should redirect to dashboard

## Troubleshooting

### "Redirect URI mismatch"
- Ensure URLs match exactly in Google Console
- No trailing slashes

### "Invalid Client ID"
- Copy ID without quotes
- Check credentials file permissions

### "CORS error"
- Add frontend URL to authorized origins
- Clear browser cache and cookies

## Production Deployment

1. Update redirect URIs for production domain
2. Change to "Internal" user type if within organization
3. Move secrets to production environment variables
4. Never commit credentials to version control
