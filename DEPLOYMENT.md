# 🚀 Deployment Guide

## Deployment Options

### Option 1: Heroku (Backend) + Netlify (Frontend)

#### Backend Deployment (Heroku)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Create Procfile**
   ```
   web: node src/index.js
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set PORT=5000
   heroku config:set MONGODB_URI=your_mongodb_atlas_url
   heroku config:set JWT_SECRET=your_secret_key
   heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
   heroku config:set GOOGLE_CALLBACK_URL=https://your-app-name.herokuapp.com/api/auth/google/callback
   heroku config:set ZOOM_CLIENT_ID=your_zoom_client_id
   heroku config:set ZOOM_CLIENT_SECRET=your_zoom_client_secret
   heroku config:set ZOOM_ACCOUNT_ID=your_zoom_account_id
   heroku config:set REACT_APP_API_URL=https://your-app-name.herokuapp.com/api
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment (Netlify)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to netlify.com
   - Drag & drop the `build/` folder
   - Or connect GitHub repository

3. **Configure Netlify**
   - Set environment variable:
     ```
     REACT_APP_API_URL=https://your-app-name.herokuapp.com/api
     ```
   - Add redirect rules in `_redirects` file

4. **Create netlify.toml**
   ```toml
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

#### Update OAuth Credentials

1. **Google Console**
   - Add Netlify URL to authorized origins
   - Add Heroku callback URL to redirect URIs

2. **Zoom Marketplace**
   - Update redirect URI to Heroku app
   - Add Netlify frontend URL

---

### Option 2: AWS (Backend) + Vercel (Frontend)

#### Backend on AWS EC2

1. **Create EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.micro (free tier)

2. **Connect & Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   ```

3. **Deploy Backend**
   ```bash
   git clone your-repo
   cd backend
   npm install
   npm start
   ```

4. **Use PM2 for Process Management**
   ```bash
   sudo npm install -g pm2
   pm2 start src/index.js
   pm2 startup
   pm2 save
   ```

#### Frontend on Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Vercel**
   - Go to vercel.com
   - Import from GitHub
   - Set build command: `npm run build`
   - Set environment variables

3. **Deploy**
   - Automatic deployment on push

---

### Option 3: Docker Deployment

#### Create Dockerfile (Backend)

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb:27017
      - PORT=5000
    depends_on:
      - mongodb
    
  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Run Docker Compose

```bash
docker-compose up -d
```

---

### Option 4: Railway.app Deployment

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login & Initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables
   # Add all .env variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

---

## Database Setup

### MongoDB Atlas (Cloud)

1. Go to mongodb.com/cloud/atlas
2. Create account and project
3. Create cluster (M0 free tier)
4. Create database user
5. Get connection string
6. Add to MONGODB_URI in .env

### Self-Hosted MongoDB

```bash
# Ubuntu/Debian
sudo apt install mongodb

# macOS
brew install mongodb-community

# Start service
sudo systemctl start mongod

# Connection string
mongodb://localhost:27017/online-learning
```

---

## Performance Optimization

### Backend

1. **Enable Caching**
   ```javascript
   app.use(require('express-cache-controller')());
   ```

2. **Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

3. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use(limiter);
   ```

### Frontend

1. **Code Splitting**
   ```javascript
   const StudentDashboard = lazy(() => import('./dashboards/StudentDashboard'));
   ```

2. **Image Optimization**
   - Use WebP format
   - Lazy load images
   - Compress before upload

3. **Bundle Analysis**
   ```bash
   npm install --save-dev source-map-explorer
   npm run build
   npx source-map-explorer 'build/static/js/*.js'
   ```

---

## SSL Certificate

### Heroku (Automatic)
- Free SSL provided

### AWS/Custom Server

```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Nginx configuration
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

---

## Monitoring & Logging

### Backend Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'online-learning' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Server error' });
});
```

### Error Tracking (Sentry)

```javascript
const Sentry = require("@sentry/node");

Sentry.init({ 
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV 
});

app.use(Sentry.Handlers.errorHandler());
```

---

## Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple backend instances
- Redis for session management

### Vertical Scaling
- Upgrade server resources
- Database optimization
- Query optimization

### CDN (Content Delivery Network)
- Cloudflare for DNS + CDN
- Serve static files globally
- Reduce latency

---

## Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --out /backup/

# Scheduled backup (cron)
0 2 * * * /usr/bin/mongodump --out /backup/$(date +\%Y-\%m-\%d)

# Upload to S3
aws s3 sync /backup/ s3://your-bucket/backups/
```

### Application Backup

```bash
# Daily git backup
0 3 * * * cd /app && git pull origin main
```

---

## Troubleshooting Deployment

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process or change port |
| CORS error | Add frontend URL to allowed origins |
| MongoDB connection fails | Check connection string and credentials |
| Zoom API error | Verify credentials and scopes |
| Google OAuth fails | Update redirect URIs |

### Check Logs

```bash
# Heroku
heroku logs --tail

# AWS EC2
sudo journalctl -u service-name -f

# Docker
docker logs container-name
```

---

## Post-Deployment Checklist

- [ ] Update Google OAuth redirect URIs
- [ ] Update Zoom OAuth redirect URI
- [ ] Test login with email/password
- [ ] Test Google login
- [ ] Create test classes
- [ ] Upload test PDF
- [ ] Test Zoom meeting creation
- [ ] Test PDF download
- [ ] Check admin panel
- [ ] Verify email notifications (if added)
- [ ] Test on mobile
- [ ] Monitor error logs
- [ ] Set up automatic backups
- [ ] Enable HTTPS
- [ ] Add security headers

---

## Maintenance

### Regular Tasks

- Update dependencies monthly: `npm outdated`
- Monitor disk space
- Check database size
- Review error logs
- Test backup restoration
- Update security patches

### Health Checks

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});
```

---

Happy deploying! 🚀
