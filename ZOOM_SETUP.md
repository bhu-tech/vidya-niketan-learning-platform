# Zoom API Setup Guide

## Getting Zoom OAuth Credentials

### Step 1: Create Zoom App
1. Go to https://marketplace.zoom.us/
2. Click "Develop" → "Build App"
3. Select "OAuth" app type
4. Fill in app information
5. Accept terms and create

### Step 2: Configure OAuth Settings
1. In app settings, go to "OAuth Information"
2. Add Redirect URL: `http://localhost:5000/api/auth/google/callback`
3. Copy and save:
   - Client ID
   - Client Secret
   - Account ID

### Step 3: Add to Backend .env
```env
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id
```

### Step 4: Enable Zoom Scopes
In app settings, enable:
- `meeting:write`
- `meeting:read`

### Testing
```bash
# Verify Zoom credentials work
curl -X POST https://zoom.us/oauth/token \
  -H "Authorization: Basic [base64(CLIENT_ID:CLIENT_SECRET)]" \
  -d "grant_type=account_credentials&account_id=ACCOUNT_ID"
```

## Creating Meetings Programmatically

When teacher creates a meeting:
1. Backend calls Zoom API with meeting details
2. Zoom returns meeting ID and URLs
3. Join URL stored in database
4. Students access via join URL

## Troubleshooting

### "401 Unauthorized"
- Check credentials in .env
- Verify account_id format

### "Meeting creation failed"
- Ensure Zoom app has write permissions
- Check API rate limits (15 requests/minute)

### "Invalid redirect URI"
- Must match exactly in Zoom settings
- Include protocol (http/https)
