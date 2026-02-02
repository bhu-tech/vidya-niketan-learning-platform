@echo off
echo ===================================
echo Online Learning Platform Setup
echo ===================================
echo.

echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Next Steps:
echo 1. Configure backend/.env with OAuth credentials
echo 2. Start MongoDB: mongod
echo 3. Run backend: cd backend && npm run dev
echo 4. Run frontend (new terminal): cd frontend && npm start
echo.
echo Read README.md and QUICKSTART.md for detailed instructions
echo.
