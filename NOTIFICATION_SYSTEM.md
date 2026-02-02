# 📢 Notification System Documentation

## Overview

A complete class-wise notification system that allows:
- **Admin** to send notifications to any class
- **Teachers** to send notifications to their classes
- **Students** to view latest 5 notifications for each class
- All notifications have read status tracking and priority levels

---

## Features

### 1. **Admin Dashboard Notifications** 
- Admin can send notifications to any class in the system
- View all notifications sent by admin
- See read/unread count per notification
- Delete notifications
- Set priority levels (Low, Medium, High)

### 2. **Teacher Dashboard Notifications**
- Teachers can send notifications to their own classes
- View all notifications sent by them
- Track student read status
- Delete their own notifications
- Separate tab for notification management

### 3. **Student Notifications in Class Detail**
- Students see last 5 notifications for each class
- Expandable notification cards
- Shows sender (Admin/Teacher) information
- Auto-refresh every 30 seconds
- Mark individual notifications as read
- Real-time read status tracking

### 4. **Class-Wise Organization**
- All notifications are tied to specific classes
- Students only see notifications from classes they're enrolled in
- Teachers only manage notifications for their own classes

---

## Database Schema

### Notification Model

```javascript
{
  type: 'admin' | 'teacher' | 'system',
  
  sender: {
    id: ObjectId (User),
    name: String,
    role: 'admin' | 'teacher'
  },
  
  title: String (required, max 100 chars),
  message: String (required, max 500 chars),
  
  class: ObjectId (Class, required),
  
  recipients: [ObjectId (User)],
  
  readBy: [
    {
      student: ObjectId (User),
      readAt: Date
    }
  ],
  
  priority: 'low' | 'medium' | 'high' (default: medium),
  
  data: Object,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ class: 1, createdAt: -1 }` - For efficient notification retrieval
- `{ recipients: 1 }` - For finding notifications a student received

---

## API Endpoints

### Create Notification
**POST** `/api/notifications/create`

**Auth:** Required (Admin or Teacher)

**Request Body:**
```json
{
  "title": "Assignment Due",
  "message": "Please submit your math homework by Friday",
  "classId": "60d5ec49c1234567890abcde",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "notification": { ...notification object },
  "message": "Notification sent successfully to all class students"
}
```

**Rules:**
- Teachers can only send to their own classes
- Admins can send to any class
- All students in the class become recipients
- Returns 403 if student tries to send

---

### Get Class Notifications (Latest 5) - Students
**GET** `/api/notifications/class/:classId/latest`

**Auth:** Required

**Response:**
```json
[
  {
    _id: "...",
    type: "teacher",
    title: "Class Update",
    message: "Next class will be on Wednesday...",
    sender: { id, name, role },
    priority: "medium",
    createdAt: "2024-02-01T10:00:00Z",
    readBy: [...]
  }
]
```

**Rules:**
- Returns only last 5 notifications
- Sorted by newest first
- Students must be enrolled in the class
- Teachers/Admins get authorization check

---

### Get All Class Notifications - Teachers/Admins
**GET** `/api/notifications/class/:classId`

**Auth:** Required (Teacher of class or Admin)

**Response:**
```json
[
  { ...notification objects }
]
```

**Rules:**
- Teachers can only view notifications for their own classes
- Admins can view all notifications
- Returns full notification data with recipient details
- Sorted by newest first

---

### Mark Notification as Read
**PUT** `/api/notifications/:notificationId/read`

**Auth:** Required (Student must be recipient)

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Delete Notification
**DELETE** `/api/notifications/:notificationId`

**Auth:** Required (Creator or Admin)

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### Get Dashboard Notifications
**GET** `/api/notifications/dashboard/all`

**Auth:** Required (Admin or Teacher)

**Response:**
```json
[
  { ...notification objects sent by user }
]
```

---

## Frontend Components

### 1. AdminNotificationPanel Component

**Location:** `frontend/src/components/AdminNotificationPanel.jsx`

**Props:** `{ user }`

**Features:**
- Form to send notifications to any class
- List of all sent notifications
- Delete functionality
- Read status display
- Priority color coding

**Usage in AdminDashboard:**
```jsx
{activeTab === 'notifications' && (
  <AdminNotificationPanel user={user} />
)}
```

---

### 2. TeacherNotificationPanel Component

**Location:** `frontend/src/components/TeacherNotificationPanel.jsx`

**Props:** `{ myClasses }`

**Features:**
- Form to send notifications to teacher's classes
- List of all sent notifications by teacher
- Delete functionality
- Read status display
- Priority selection

**Usage in TeacherDashboard:**
```jsx
{activeTab === 'notifications' && (
  <TeacherNotificationPanel myClasses={myClasses} />
)}
```

---

### 3. StudentNotifications Component

**Location:** `frontend/src/components/StudentNotifications.jsx`

**Props:** `{ classId, className }`

**Features:**
- Display last 5 notifications for a class
- Expandable notification cards
- Show sender information
- Mark individual notifications as read
- Auto-refresh every 30 seconds
- Shows read count vs total recipients

**Usage in ClassDetail:**
```jsx
{activeTab === 'notifications' && (
  <StudentNotifications classId={classId} className={classData.title} />
)}
```

---

## Frontend API Calls

### notificationAPI

```javascript
// Create notification
notificationAPI.create({
  title: "...",
  message: "...",
  classId: "...",
  priority: "medium"
})

// Get last 5 notifications for class (students)
notificationAPI.getClassNotifications(classId)

// Get all notifications for class (teachers/admins)
notificationAPI.getAllClassNotifications(classId)

// Mark as read
notificationAPI.markAsRead(notificationId)

// Delete notification
notificationAPI.delete(notificationId)

// Get dashboard notifications (admin/teacher)
notificationAPI.getDashboardNotifications()
```

---

## User Flows

### Admin Sending Notification

1. Admin goes to Dashboard → Notifications tab
2. Clicks "Send Notification"
3. Selects class from dropdown
4. Fills title (max 100 chars) and message (max 500 chars)
5. Selects priority (Low/Medium/High)
6. Clicks "Send to Class"
7. All students in class receive notification
8. Admin can see read count updating

### Teacher Sending Notification

1. Teacher goes to Dashboard → Notifications tab
2. Clicks "Send Notification"
3. Selects one of their classes
4. Fills title and message
5. Selects priority
6. Clicks "Send to All Students"
7. All students in that class receive notification

### Student Viewing Notifications

1. Student views a class detail page
2. Clicks "Notifications" tab
3. Sees last 5 notifications from newest first
4. Can expand any notification to read full message
5. Clicks "Mark as Read" to mark individual notification
6. Sender info shows if from Admin or Teacher
7. Can see read count (e.g., "3 of 20 students read")

---

## Styling

### CSS Files

1. **NotificationPanel.css** - Styles for Admin/Teacher panels
   - Form styling
   - Notification item cards
   - Priority badges
   - Responsive design

2. **StudentNotifications.css** - Styles for student notification display
   - Expandable cards
   - Animation effects
   - Read/unread states
   - Mobile responsive

### Color Coding

**Priority Colors:**
- 🔴 High: `#e74c3c` (Red)
- 🟡 Medium: `#f39c12` (Orange)
- 🟢 Low: `#27ae60` (Green)

---

## Authorization Rules

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| Send notification | ❌ | ✅ Own classes only | ✅ Any class |
| View sent notifications | ❌ | ✅ Own only | ✅ All |
| View class notifications | ✅ Enrolled | ✅ All | ✅ All |
| Delete notification | ❌ | ✅ Own only | ✅ All |
| Mark as read | ✅ Own | ❌ | ❌ |

---

## Limitations & Notes

1. **Last 5 Only:** Students see only last 5 notifications to avoid clutter
2. **Auto Refresh:** Student notifications auto-refresh every 30 seconds
3. **Character Limits:** 
   - Title: 100 characters
   - Message: 500 characters
4. **Recipients:** All students in class auto-receive notifications
5. **No Notifications to Teachers:** Notifications go only to students
6. **Read Tracking:** Individual read tracking per student per notification

---

## Future Enhancements

1. **Search & Filter**
   - Filter by priority
   - Filter by date range
   - Search in message content

2. **Email Notifications**
   - Send email to students when notification created
   - Optional notification preference

3. **Scheduled Notifications**
   - Send at specific time
   - Recurring notifications

4. **Rich Text Editor**
   - Bold, italic, underline
   - Lists, links, images
   - Better formatting

5. **Notification Categories**
   - Announcement
   - Assignment
   - Reminder
   - Important

6. **Bulk Operations**
   - Send to multiple classes
   - Template notifications
   - Notification scheduling

---

## Troubleshooting

### Notifications Not Appearing

1. Check if student is enrolled in the class
2. Verify notification created successfully (check backend logs)
3. Try refreshing the page
4. Check browser console for errors

### Can't Send Notification

1. Verify you're teacher/admin (students can't send)
2. If teacher, check you own the class
3. Ensure title and message are filled
4. Ensure class is selected

### Read Status Not Updating

1. Ensure you're marked as a recipient
2. Try clicking "Mark as Read" button
3. Refresh page to see updated count
4. Check if notification was deleted

---

## Database Queries

### Find all notifications for a class
```javascript
Notification.find({ class: classId }).sort({ createdAt: -1 })
```

### Find notifications a student hasn't read
```javascript
Notification.find({
  recipients: studentId,
  "readBy.student": { $ne: studentId }
})
```

### Find all notifications sent by a teacher
```javascript
Notification.find({ "sender.id": teacherId, type: "teacher" })
```

### Get notification with read count
```javascript
Notification.aggregate([
  { $match: { _id: notificationId } },
  {
    $project: {
      title: 1,
      message: 1,
      readCount: { $size: "$readBy" },
      totalRecipients: { $size: "$recipients" }
    }
  }
])
```

---

## Testing

### Test as Admin
1. Create account with admin role
2. Go to AdminDashboard
3. Go to Notifications tab
4. Send notification to a class
5. Verify students can see it

### Test as Teacher
1. Create account with teacher role
2. Create a class
3. Add students to class
4. Go to TeacherDashboard
5. Go to Notifications tab
6. Send notification
7. Verify students see it in ClassDetail

### Test as Student
1. Create account with student role
2. Enroll in a class
3. Teacher sends notification
4. Check ClassDetail for Notifications tab
5. See last 5 notifications
6. Expand and mark as read
7. Verify teacher sees increased read count

---

**Documentation Version:** 1.0  
**Last Updated:** February 1, 2026  
**Status:** Complete ✅
