USpeak Pro - Corporate Communication Skills Platform

A comprehensive B2B platform for corporate teams to manage employee communication skills training, track progress, and generate insights across organizations.

Features
--------
Core Functionality
- Corporate Account Management - Multi-tenant architecture for companies
- Employee Management - CRUD operations with custom attributes
- License Assignment - USpeak Pro license management
- Learning Assignments - Custom training paths and progress tracking
- Advanced Analytics - Individual and aggregate performance insights
- Bulk Operations - CSV/Excel uploads for employee data
- Audit Logging - Complete compliance and traceability

Technical Features
- Next.js 15 with TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication with role-based access control
- Responsive Design with Tailwind CSS
- Form Validation with React Hook Form + Zod
- Modern UI Components with Radix UI

Tech Stack
----------
Frontend: Next.js 15, React 18, TypeScript
Styling: Tailwind CSS, Radix UI Components
Database: MongoDB with Mongoose
Authentication: JWT, bcryptjs
Forms: React Hook Form, Zod validation
Icons: Lucide React

Prerequisites
-------------
- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn package manager

MongoDB Setup
-------------
Option 1: Local MongoDB Installation
macOS (using Homebrew):
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb/brew/mongodb-community
  brew services list | grep mongodb

Windows:
  1. Download MongoDB Community Server from mongodb.com
  2. Run the installer and follow the setup wizard
  3. Start MongoDB service from Windows Services

Linux (Ubuntu/Debian):
  wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  sudo systemctl start mongod
  sudo systemctl enable mongod

Option 2: MongoDB Atlas (Cloud):
  1. Go to mongodb.com/atlas
  2. Create a free account
  3. Create a new cluster
  4. Get your connection string
  5. Update your .env.local file with the Atlas connection string

Option 3: Docker (Recommended for Development):
  ./start-mongodb.sh
  # Or manually with Docker Compose
  docker-compose up -d

What's Included:
- MongoDB 7.0 running on port 27017
- Mongo Express web UI on port 8081 (admin/password123)
- Automatic database initialization with collections and indexes
- Persistent data storage using Docker volumes

Docker Commands:
  docker-compose up -d
  docker-compose logs -f mongodb
  docker-compose down
  docker-compose down -v

Verify MongoDB Connection:
  mongosh
  ps aux | grep mongod

Quick Start
-----------
1. Clone the Repository
   git clone <repository-url>
   cd U-Speak-main
2. Install Dependencies
   npm install
3. Environment Configuration
   cp env.example .env.local
   # Update .env.local with your configuration
4. Database Setup
   Ensure MongoDB is running and accessible at your configured URI.
5. Run the Development Server
   npm run dev
   # Open http://localhost:3000 in your browser

Database Schema
---------------
Database: uspeek-pro
Collections:
- assignmentemployees
- assignmentinstances
- assignmentmasters
- assignmentworkreports
- auditlogs
- corporateaccounts
- customattributedefinitions
- employeeattributevalues
- employeeprofiles
- employeescorehistories
- instanceworkreports
- lessonactivities
- licenses
- users
- videouploadactivities

Authentication Flow
-------------------
1. Registration: Corporate admins create accounts
2. Login: JWT-based authentication
3. Role-based Access: Admin vs Employee permissions
4. Route Protection: Middleware-based security
5. Token Management: Secure storage and validation

User Interface
--------------
Authentication Pages:
- Login Form: Corporate admin sign-in
- Registration Form: New company account creation
- Responsive Design: Works on desktop and mobile
Dashboard (Protected Routes):
- Employee management
- License assignment
- Progress tracking
- Analytics and reporting

Security Features
-----------------
- Password Hashing: bcryptjs with salt rounds
- JWT Tokens: Secure authentication
- Route Protection: Middleware-based security
- Input Validation: Zod schema validation
- Audit Logging: Complete action tracking
- Role-based Access: Granular permissions

API Endpoints
-------------
Authentication:
- POST /api/auth/login - User login
- POST /api/auth/register - Corporate account creation
Protected Routes:
- All other routes require valid JWT token
- User context available in request headers

Deployment
----------
Production Considerations:
1. Environment Variables: Secure production secrets
2. Database: Use MongoDB Atlas or production instance
3. JWT Secret: Generate strong, unique secret
4. HTTPS: Enable SSL/TLS encryption
5. Rate Limiting: Implement API rate limiting
Build Commands:
  npm run build
  npm start

Testing
-------
  npm run lint
  npm run build

License
-------
This project is proprietary software for USpeak Pro platform.

Support
-------
For technical support or questions, please contact the development team.

Note: This is a corporate B2B platform. Ensure proper security measures and compliance with data protection regulations (GDPR, etc.) before production deployment.
