# Database Schema Documentation

## Collections & Models

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed), // optional for OAuth users
  googleId: String, // optional for Google OAuth
  profilePicture: String (URL),
  role: String (enum: 'student', 'teacher', 'admin'),
  bio: String,
  phone: String,
  enrolledClasses: [ObjectId], // array of Class IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Class Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  teacher: ObjectId, // references User
  students: [ObjectId], // array of User IDs
  zoomMeetingId: String,
  zoomMeetingLink: String,
  zoomJoinUrl: String,
  schedule: {
    date: Date,
    startTime: String (HH:MM format),
    endTime: String (HH:MM format)
  },
  materials: [ObjectId], // array of Material IDs
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Material Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  fileUrl: String, // path to uploaded PDF
  fileName: String,
  fileSize: Number,
  fileType: String (default: 'application/pdf'),
  classId: ObjectId, // references Class
  uploadedBy: ObjectId, // references User (Teacher)
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

```
User (Teacher) -----> Class <----- User (Student)
                        |
                        |
                     Material
                        |
                        └---> User (uploadedBy)
```

## Indexes for Performance

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { sparse: true })

// Class indexes
db.classes.createIndex({ teacher: 1 })
db.classes.createIndex({ students: 1 })

// Material indexes
db.materials.createIndex({ classId: 1 })
db.materials.createIndex({ uploadedBy: 1 })
```

## Sample Queries

### Get all classes for a teacher
```javascript
db.classes.find({ teacher: ObjectId("...") })
```

### Get all students in a class
```javascript
db.classes.findOne({ _id: ObjectId("...") }).students
```

### Get all materials for a class
```javascript
db.materials.find({ classId: ObjectId("...") })
```

### Change user role to teacher
```javascript
db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { role: "teacher" } }
)
```

### Add student to class
```javascript
db.classes.updateOne(
  { _id: ObjectId("...") },
  { $push: { students: ObjectId("...") } }
)
```
