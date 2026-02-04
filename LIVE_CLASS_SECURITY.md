# Live Class Security Implementation

## Overview
Comprehensive security system for live classes to prevent unauthorized access and link sharing.

## Security Layers

### 1. **Password Protection**
- Each live class gets a unique password generated from class ID
- Password is automatically included in meeting URL
- Generated using SHA256 hash for consistency

### 2. **Lobby/Waiting Room**
- All participants (students) must wait in lobby
- Teacher (moderator) approves each participant individually
- Provides final control over who can join

### 3. **One-Time Join Tokens**
- Students must request a join token before accessing meeting
- Token is valid for only 2 minutes
- Token is consumed (deleted) after successful use
- Cannot be reused or shared

### 4. **Duplicate Join Prevention**
- System tracks active sessions in database
- Students cannot join if they already have an active session
- Session is automatically cleared when student leaves
- Prevents same student from joining multiple times

## Implementation Details

### Backend Changes

#### 1. **Models** ([backend/src/models/Attendance.js](backend/src/models/Attendance.js))
Added fields to Attendance model:
```javascript
activeSession: Boolean  // Tracks if student currently in meeting
joinToken: String       // One-time token for joining (indexed)
tokenExpiry: Date       // Token expiration timestamp
```

#### 2. **Jitsi Configuration** ([backend/src/utils/jitsi.js](backend/src/utils/jitsi.js))
- Added `isModerator` parameter to `getJitsiEmbedConfig()`
- Enabled lobby: `lobbyEnabled: true`, `enableLobbyChat: true`
- Password support in configuration
- Moderators bypass lobby automatically

#### 3. **API Endpoints** ([backend/src/routes/classRoutes.js](backend/src/routes/classRoutes.js))

**POST /:id/request-join-token**
- Validates class is live
- Checks user is enrolled
- Prevents duplicate active sessions
- Generates crypto-random 64-character token
- Sets 2-minute expiry
- Returns token to frontend

**GET /:id/jitsi-config?token=xxx**
- Teachers (moderators) don't need token
- Students must provide valid token in query parameter
- Validates token exists and hasn't expired
- Consumes token after validation (one-time use)
- Passes `isModerator` flag to Jitsi config
- Returns meeting configuration

**POST /:id/end-session**
- Clears active session for student
- Called when student leaves meeting
- Resets joinToken and activeSession fields

### Frontend Changes

#### **JitsiMeeting Component** ([frontend/src/components/JitsiMeeting.jsx](frontend/src/components/JitsiMeeting.jsx))

Flow:
1. Request join token from backend (students only)
2. Fetch Jitsi config with token in query parameter
3. Open meeting in popup window with password
4. Monitor window state
5. Call end-session endpoint when window closes or component unmounts

Error Handling:
- "Join token required" - Student forgot to request token
- "Invalid or expired join token" - Token was used or expired
- "Join token has expired" - Token older than 2 minutes
- "You already have an active session" - Duplicate join attempt
- "This class is not currently live" - Class not started

## User Flow

### For Teachers:
1. Click "Start Live" button
2. System generates password and creates Jitsi room
3. Click "Join Live Class"
4. Opens directly as moderator (bypasses lobby)
5. Approve students from lobby as they join

### For Students:
1. Wait for teacher to start live class
2. Click "Join Live Class"
3. System requests join token (2-min validity)
4. System fetches meeting config with token
5. Opens meeting window with password
6. Enters lobby/waiting room
7. Teacher approves from lobby
8. Joins the meeting
9. Session tracked to prevent duplicate joins

## Security Benefits

✅ **Cannot Share Meeting Links**: Even if URL is shared, outsiders need:
   - Valid join token (expires in 2 minutes)
   - Enrollment in the class
   - Teacher approval from lobby

✅ **Cannot Share Passwords**: Password alone is insufficient without token

✅ **Prevents Duplicate Joins**: Same student cannot join twice

✅ **Teacher Control**: Final approval through lobby system

✅ **Time-Limited Access**: Tokens expire quickly

✅ **Dashboard-Only Access**: Must go through proper flow in website

## Testing Checklist

- [ ] Teacher can start live class
- [ ] Teacher joins directly as moderator
- [ ] Student can request join token
- [ ] Student receives valid token
- [ ] Token works within 2 minutes
- [ ] Token expires after 2 minutes
- [ ] Token cannot be reused
- [ ] Student waits in lobby
- [ ] Teacher sees student in lobby
- [ ] Teacher can approve student
- [ ] Student cannot join twice (duplicate prevention)
- [ ] Session clears when student leaves
- [ ] Unauthorized users cannot join

## Deployment

### Backend (Render)
```bash
git add backend/
git commit -m "Add comprehensive live class security"
git push
```
Backend will auto-deploy on Render.

### Frontend (Netlify)
```bash
git add frontend/
git commit -m "Update JitsiMeeting with token-based security"
git push
```
Frontend will auto-deploy on Netlify.

## Configuration

No additional environment variables required. Uses existing:
- `REACT_APP_API_URL` - Frontend API endpoint
- MongoDB connection - Backend database

## Technical Notes

- Uses `crypto.randomBytes(32)` for secure token generation
- Tokens are 64-character hexadecimal strings
- Session tracking uses MongoDB upsert operations
- Lobby feature is native to Jitsi Meet
- Meeting opens in popup window (bypasses iframe restrictions)

## Maintenance

### Clear Stale Sessions
If sessions get stuck (e.g., browser crash), run:
```javascript
// In MongoDB or backend script
await Attendance.updateMany(
  { activeSession: true },
  { activeSession: false, joinToken: null, tokenExpiry: null }
);
```

### Adjust Token Expiry
Change in [backend/src/routes/classRoutes.js](backend/src/routes/classRoutes.js):
```javascript
tokenExpiry: Date.now() + 2 * 60 * 1000  // 2 minutes
// Change to 5 minutes:
tokenExpiry: Date.now() + 5 * 60 * 1000
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify class is live (`isLive: true`)
3. Check token hasn't expired
4. Ensure user is enrolled in class
5. Verify teacher started the meeting first
