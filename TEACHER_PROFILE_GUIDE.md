# Teacher Profile Management

## How Teachers Update Their Personal Information

Teachers can now update their profile information from the Teacher Dashboard through a dedicated profile edit page.

### Steps to Update Profile:

1. **Log in** as a teacher and navigate to the **Teacher Dashboard**
2. Click the **"✏️ Edit Profile"** button in the header (next to profile card)
3. You'll be taken to the **Edit Profile** page where you can update:
   - **Name** - Your full name
   - **Phone Number** - Contact number
   - **Designation** - Your job title (e.g., "Mathematics Teacher", "Physics Instructor")
   - **Profile Picture** - Upload a new profile photo
   - **Bio** - Short biography or description

4. Click **Save** to update your profile
5. Changes are saved immediately and reflected in the dashboard

### Access Points:

#### Option 1: Edit Profile Button
- Located in the Teacher Dashboard header
- Button text: "✏️ Edit Profile"
- Path: `/teacher-profile`

#### Option 2: Direct URL
- Navigate directly to: `http://localhost:3000/teacher-profile`
- (Only accessible if logged in as a teacher)

### Updated Fields in Database

The following new fields have been added to the teacher profile:
- `designation` - Teacher's job title
- `profilePicture` - URL to profile photo (stored as base64)
- `phone` - Contact number
- `bio` - Short biography

### Profile Picture Upload

- Click "Upload Photo" to select an image
- Supported formats: PNG, JPG, JPEG, GIF
- Maximum file size: Limited by browser
- Preview shows current or selected image
- Photo displays as circular in dashboard

### Display in Dashboard

Updated profile information is displayed in the Teacher Dashboard header:
- **Profile Picture** - Circular 120px image with border
- **Phone Number** - Shows phone icon and number
- **Designation** - Displayed as purple badge

### Backend Endpoint

**PUT** `/api/users/profile`

Accepts the following fields:
```json
{
  "name": "Teacher Name",
  "phone": "+1234567890",
  "designation": "Mathematics Teacher",
  "bio": "Experienced teacher...",
  "profilePicture": "base64-image-string"
}
```

Response: Updated user object with all fields

### Files Modified

1. **Frontend**
   - `frontend/src/pages/TeacherProfile.jsx` - New profile edit page
   - `frontend/src/styles/TeacherProfile.css` - Styling for profile page
   - `frontend/src/dashboards/TeacherDashboard.jsx` - Added edit button and navigate functionality
   - `frontend/src/styles/TeacherDashboard.css` - Styled edit button
   - `frontend/src/App.jsx` - Added `/teacher-profile` route

2. **Backend**
   - `backend/src/routes/userRoutes.js` - Updated PUT /profile to accept new fields
   - `backend/src/models/User.js` - Added `designation` field

### Notes

- Profile picture is converted to base64 and stored in database
- Changes are immediately reflected in Teacher Dashboard
- All fields are optional except name (if required by application logic)
- Teachers can edit their profile anytime by clicking the button
- Profile edits are saved per teacher account
