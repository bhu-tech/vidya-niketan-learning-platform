# 🔒 Production Security Hardening Guide

## Critical Security Checklist

### 1. Environment Variables ✅

- [ ] Never commit `.env` file to GitHub
- [ ] Add `.env` to `.gitignore`
- [ ] All secrets stored in platform environment variables
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Rotate JWT_SECRET quarterly

**Backend .gitignore:**
```
.env
.env.local
.env.production
node_modules/
uploads/
logs/
.DS_Store
```

---

### 2. Database Security ✅

**MongoDB Atlas:**

- [ ] Enable authentication (2FA)
- [ ] Use strong database passwords (20+ characters)
- [ ] Limit IP access to production servers only
- [ ] Enable IP whitelist
- [ ] Create separate DB users for different environments
- [ ] Enable encryption at rest
- [ ] Enable audit logging
- [ ] Regular automated backups
- [ ] Test backup restoration monthly

**Database User Permissions:**
```
Production User: Full admin (readonly after setup)
Staging User: Full access to staging DB only
Development User: Full access to development DB only
```

---

### 3. Authentication Security ✅

**JWT Token Hardening:**

```javascript
// Backend: Use strong algorithms and short expiration
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { 
    algorithm: 'HS256',
    expiresIn: '24h'  // Short expiration
  }
);
```

**Password Requirements:**

```javascript
// Enforce strong passwords for signups
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
```

---

### 4. HTTPS/SSL ✅

- [ ] Vercel provides free SSL certificates automatically
- [ ] Render provides free SSL certificates automatically
- [ ] Enforce HTTPS redirects (add to backend):

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

---

### 5. CORS Security ✅

**Backend [src/index.js](src/index.js):**

```javascript
const cors = require('cors');

const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://admin.yourdomain.com'
];

// Production CORS
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
} else {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}
```

---

### 6. API Rate Limiting ✅

**Install:** `npm install express-rate-limit`

```javascript
const rateLimit = require('express-rate-limit');

// Global rate limit: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

// Strict limit for authentication: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later'
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
```

---

### 7. Input Validation ✅

**Install:** `npm install joi` or `npm install zod`

```javascript
// Validate user input before processing
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(3).max(50).required()
});

app.post('/api/auth/signup', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Process validated data
});
```

---

### 8. Helmet.js Security Headers ✅

**Install:** `npm install helmet`

```javascript
const helmet = require('helmet');

app.use(helmet());

// Additional security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:']
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));
```

---

### 9. Data Protection ✅

**Sensitive Data:**

- [ ] Never log passwords or tokens
- [ ] Mask sensitive data in logs
- [ ] Don't return passwords in API responses
- [ ] Use HTTPS for all data transmission
- [ ] Encrypt sensitive data at rest

```javascript
// Example: Don't expose password in response
User.findById(id).select('-password'); // Exclude password field
```

---

### 10. File Upload Security ✅

**Current Config (Check [backend/package.json](backend/package.json)):**

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Sanitize filename
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// File filter - allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
```

---

### 11. Logging & Monitoring ✅

**Security Events to Log:**

```javascript
// Log authentication failures
logger.warn({
  event: 'login_failed',
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});

// Log role changes
logger.info({
  event: 'role_changed',
  userId: user._id,
  oldRole: user.oldRole,
  newRole: user.newRole,
  changedBy: req.user._id
});

// Log sensitive operations
logger.info({
  event: 'attendance_marked',
  studentId: student._id,
  classId: class._id,
  ip: req.ip
});
```

---

### 12. Admin Password Security ✅

**Seed Script ([backend/seed-admin.js](backend/seed-admin.js)) Should:**

- [ ] Use bcrypt for password hashing
- [ ] Never log passwords
- [ ] Change default password on first login
- [ ] Force password change for security
- [ ] Implement admin MFA (optional but recommended)

```javascript
const bcrypt = require('bcryptjs');

// Hash password with 10 salt rounds
const hashedPassword = await bcrypt.hash('tempPassword123!', 10);

// Update: Force password change on first admin login
admin.passwordChangeRequired = true;
admin.passwordChangedAt = new Date();
```

---

### 13. Production Deployment Checklist ✅

**Before Going Live:**

- [ ] All console.log() removed from production code
- [ ] Error messages don't expose internal details
- [ ] Sensitive files not exposed (.git, .env, package-lock.json)
- [ ] Dependencies updated to latest versions
- [ ] Security vulnerabilities checked: `npm audit`
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Database backups working
- [ ] Monitoring/alerting enabled
- [ ] Admin MFA enabled
- [ ] Default credentials changed
- [ ] Firewall rules configured
- [ ] DDoS protection (Cloudflare recommended)

---

### 14. DDoS Protection (Optional) ✅

**Recommended: Use Cloudflare**

1. Sign up at https://www.cloudflare.com
2. Add your domain
3. Update nameservers at registrar
4. Enable:
   - [ ] DDoS Protection
   - [ ] Web Application Firewall
   - [ ] Rate Limiting
   - [ ] Bot Management

---

### 15. Regular Security Updates ✅

**Monthly Tasks:**

```bash
# Check for vulnerable dependencies
npm audit

# Update packages
npm update

# Check for outdated packages
npm outdated
```

**Quarterly Tasks:**

- [ ] Rotate JWT_SECRET
- [ ] Review admin access logs
- [ ] Update MongoDB admin password
- [ ] Test disaster recovery
- [ ] Security training for team

---

## 🆘 Security Response Plan

### If Compromised:

1. **Immediate Actions:**
   - [ ] Rotate all passwords
   - [ ] Rotate JWT_SECRET
   - [ ] Review access logs
   - [ ] Block suspicious IPs
   - [ ] Review recent database changes

2. **Investigation:**
   - [ ] Check logs for unauthorized access
   - [ ] Verify all user accounts
   - [ ] Check for malware
   - [ ] Review code commits

3. **Recovery:**
   - [ ] Restore from backup if needed
   - [ ] Update all dependencies
   - [ ] Patch vulnerabilities
   - [ ] Deploy security update
   - [ ] Notify users if data exposed

---

## 📊 Security Monitoring

**Set up alerts for:**

- [ ] Failed login attempts (> 5 in 15 min)
- [ ] API errors (> 10 per minute)
- [ ] Database connection failures
- [ ] Rate limit triggered
- [ ] New admin accounts created
- [ ] Role changes
- [ ] File uploads (unusual patterns)

---

## 🎓 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [JWT Best Practices](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)

---

## ✅ Final Checklist

- [ ] All environment variables in production
- [ ] HTTPS enforced
- [ ] CORS locked down
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] Helmet.js installed
- [ ] Sensitive data not logged
- [ ] Backups tested
- [ ] Monitoring set up
- [ ] Admin MFA enabled
- [ ] Team trained on security
- [ ] Regular updates scheduled

**You're ready for production! 🎉**
