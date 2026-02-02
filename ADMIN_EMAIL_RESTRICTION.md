# 🔐 Admin Access Restriction

## Summary
Only **vidyaniketanfoundation2025@gmail.com** can create an admin account. All other emails attempting to sign up as admin will be rejected.

---

## What Changed

### 1. **Backend Configuration** (`backend/.env`)
```env
ADMIN_EMAIL=vidyaniketanfoundation2025@gmail.com
```
- Added new environment variable to specify authorized admin email

### 2. **Backend Validation** (`backend/src/routes/authRoutes.js`)
```javascript
// Restrict admin role to specific email only
if (userRole === 'admin') {
  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Only authorized email can create admin account' });
  }
}
```
- Checks if signup email matches `ADMIN_EMAIL`
- Returns 403 error if non-authorized email tries to signup as admin

### 3. **Frontend UI** (`frontend/src/pages/SignUp.jsx`)
```jsx
{formData.email === 'vidyaniketanfoundation2025@gmail.com' && (
  <option value="admin">Sign up as Admin</option>
)}
```
- Admin option only appears in dropdown when authorized email is entered
- Better UX: users don't see disabled/unavailable options

---

## How It Works

### Authorized Email Signup Flow:
```
1. Enter: vidyaniketanfoundation2025@gmail.com
2. Admin dropdown option appears
3. Select "Sign up as Admin"
4. Submit → Admin account created, auto-approved
```

### Non-Authorized Email Signup Flow:
```
1. Enter: any_other_email@example.com
2. Admin option does NOT appear
3. Only Student/Teacher available
4. If user tries to signup as admin via API → 403 error rejected
```

---

## Testing

### ✅ Test 1: Authorized Admin Signup
```
Email: vidyaniketanfoundation2025@gmail.com
Role: Admin
Expected: Admin account created, instant access to Admin Dashboard
```

### ✅ Test 2: Unauthorized Admin Attempt
```
Email: otheremail@gmail.com
Try to select Admin
Expected: Admin option not visible in dropdown
```

### ✅ Test 3: API-Level Enforcement
```
POST /api/auth/signup
{
  "email": "otheremail@gmail.com",
  "role": "admin"
}
Expected: 403 - "Only authorized email can create admin account"
```

---

## Changing Admin Email

To change the authorized admin email:

**Edit `backend/.env`:**
```env
ADMIN_EMAIL=new_admin_email@example.com
```

**Edit `frontend/src/pages/SignUp.jsx`:**
```jsx
{formData.email === 'new_admin_email@example.com' && (
  <option value="admin">Sign up as Admin</option>
)}
```

**Restart backend for changes to take effect.**

---

## Security Notes

✅ **Backend Validation:** Primary security check (email validation on server)
✅ **Frontend UI:** Convenience feature (hides unavailable option)
✅ **Environment Variable:** Easy to configure per deployment

⚠️ **Important:** Backend check is what matters. Frontend UI is just UX.

---

## Current Status

- ✅ Backend restriction implemented
- ✅ Frontend UI updated
- ✅ Admin email configured
- ✅ Ready to test

**Only `vidyaniketanfoundation2025@gmail.com` can now create admin accounts!** 🔐
