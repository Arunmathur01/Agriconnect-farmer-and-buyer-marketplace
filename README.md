# Agriconnect — Farmer & Buyer Marketplace (MERN)

Tech Stack
- Frontend: React (Vite), React Router, Tailwind CSS, Axios, React Query, Socket.io client
- Backend: Node.js, Express, Mongoose, JWT (jsonwebtoken), bcrypt, multer, Socket.io, Cloudinary
- Database: MongoDB Atlas
- Image Storage: Cloudinary

Structure
/agriconnect
  /backend
  /frontend
  README.md
  .env.example

Quick Start
1) Prerequisites: Node 18+, MongoDB Atlas, Cloudinary account (free tier available)
2) Env files: 
   - backend/.env - Add Cloudinary credentials:
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
   - frontend/.env (see .env.example)
3) Install:
  cd backend && npm install
  cd ../frontend && npm install
4) Run dev:
  Backend: cd backend && npm run dev (http://localhost:4000)
  Frontend: cd frontend && npm run dev (http://localhost:5173)

Cloudinary Setup:
1. Sign up for free at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to backend/.env file

MVP
- Auth (JWT), Roles: Farmer, Buyer, Admin, Expert
- Listings CRUD with image upload
- Marketplace & bidding (real-time via Socket.io)
- Orders and payment stub
- Dashboards and notifications
- Real-time Chat & Video Calls with WebRTC
- Expert consultation system
- Bilingual UI (English/Hindi)

License
MIT

