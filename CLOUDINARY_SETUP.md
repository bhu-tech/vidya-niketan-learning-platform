# Cloudinary Setup Guide

## What is Cloudinary?
Cloudinary is a cloud storage service for images and files. We're using it to permanently store PDFs and thumbnails instead of Render's temporary /tmp directory.

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a **FREE account** using:
   - Email: vidyaniketanfoundation2025@gmail.com
   - Or sign in with Google

## Step 2: Get Your Credentials

After signing up, you'll be taken to the Dashboard:

1. Look for the **Account Details** section (usually at the top)
2. You'll see three important values:
   - **Cloud Name** (e.g., `dxxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123`)

3. Click the **"Eye" icon** next to API Secret to reveal it

## Step 3: Add to Render Environment Variables

1. Go to https://dashboard.render.com
2. Click on your **backend service** (vidya-niketan-backend or similar)
3. Go to **Environment** tab
4. Click **"Add Environment Variable"** and add these three:

```
CLOUDINARY_CLOUD_NAME = [paste your Cloud Name]
CLOUDINARY_API_KEY = [paste your API Key]
CLOUDINARY_API_SECRET = [paste your API Secret]
```

5. Click **"Save Changes"** - Render will automatically redeploy

## Step 4: Verify It's Working

After Render finishes deploying (2-3 minutes):

1. Go to your website: https://vidyaniketanhapur.in
2. Login as teacher/admin
3. Go to any class
4. Try uploading a NEW material with a PDF and thumbnail
5. The upload should work and thumbnail should be visible
6. Check Cloudinary dashboard - you should see the files under:
   - **Media Library** → **vidya-niketan** folder

## Free Tier Limits

Cloudinary Free Plan includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ Up to 25,000 transformations/month
- ✅ More than enough for your school!

## Troubleshooting

**If upload fails:**
1. Check Render logs for errors
2. Verify environment variables are set correctly (no extra spaces)
3. Make sure API Secret is visible (click eye icon)

**If thumbnails don't show:**
1. They might be from old uploads (before Cloudinary)
2. Upload NEW materials - they should work
3. Old materials will need to be re-uploaded

## What Happens to Old Files?

Old files in /tmp are lost when server restarts. You'll need to:
- Re-upload important materials
- New uploads will be permanent in Cloudinary

---

**Need Help?** Check Cloudinary dashboard at: https://cloudinary.com/console
