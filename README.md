# USpeak Pro - Corporate Communication Skills Platform

A comprehensive B2B platform for corporate teams to manage employee communication skills training, track progress, and generate insights across organizations.

## 🚀 Features

### Core Functionality
- **Corporate Account Management** - Multi-tenant architecture for companies
- **Employee Management** - CRUD operations with custom attributes
- **License Assignment** - USpeak Pro license management
- **Learning Assignments** - Custom training paths and progress tracking
- **Advanced Analytics** - Individual and aggregate performance insights
- **Bulk Operations** - CSV/Excel uploads for employee data
- **Audit Logging** - Complete compliance and traceability

### Technical Features
- **Next.js 15** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with role-based access control
- **Responsive Design** with Tailwind CSS
- **Form Validation** with React Hook Form + Zod
- **Modern UI Components** with Radix UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

#### macOS (using Homebrew)
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify MongoDB is running
brew services list | grep mongodb
```

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service from Windows Services

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update your `.env.local` file with the Atlas connection string

### Option 3: Docker (Recommended for Development)

#### Quick Start with Docker Compose
```bash
# Start MongoDB and Mongo Express
./start-mongodb.sh

# Or manually with Docker Compose
docker-compose up -d
```

#### What's Included
- **MongoDB 7.0** running on port 27017
- **Mongo Express** web UI on port 8081 (admin/password123)
- **Automatic database initialization** with collections and indexes
- **Persistent data storage** using Docker volumes

#### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Reset database (removes all data)
docker-compose down -v
```

### Verify MongoDB Connection
```bash
# Connect to MongoDB shell
mongosh

# Or check if the service is running
ps aux | grep mongod
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd U-Speak-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure your settings:
```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/uspeak-pro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 4. Database Setup
Ensure MongoDB is running and accessible at your configured URI.

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Collections

#### CorporateAccount
- Company information and subscription details
- Custom attribute definitions
- Account status and limits

#### User
- Authentication and role management
- Links to corporate account
- Password hashing and security

#### EmployeeProfile
- Employee-specific information
- Custom attribute values
- Department and role details

#### License
- USpeak Pro license management
- Assignment tracking
- Feature access control

#### AuditLog
- Complete action logging
- Compliance and traceability
- Security monitoring

## 🔐 Authentication Flow

1. **Registration**: Corporate admins create accounts
2. **Login**: JWT-based authentication
3. **Role-based Access**: Admin vs Employee permissions
4. **Route Protection**: Middleware-based security
5. **Token Management**: Secure storage and validation

## 📱 User Interface

### Authentication Pages
- **Login Form**: Corporate admin sign-in
- **Registration Form**: New company account creation
- **Responsive Design**: Works on desktop and mobile

### Dashboard (Protected Routes)
- Employee management
- License assignment
- Progress tracking
- Analytics and reporting

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication
- **Route Protection**: Middleware-based security
- **Input Validation**: Zod schema validation
- **Audit Logging**: Complete action tracking
- **Role-based Access**: Granular permissions

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Corporate account creation

### Protected Routes
- All other routes require valid JWT token
- User context available in request headers

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Secure production secrets
2. **Database**: Use MongoDB Atlas or production instance
3. **JWT Secret**: Generate strong, unique secret
4. **HTTPS**: Enable SSL/TLS encryption
5. **Rate Limiting**: Implement API rate limiting

### Build Commands
```bash
npm run build
npm start
```

## 🧪 Testing

```bash
npm run lint
npm run build
```

## 📝 License

This project is proprietary software for USpeak Pro platform.

## 🤝 Support

For technical support or questions, please contact the development team.

---

**Note**: This is a corporate B2B platform. Ensure proper security measures and compliance with data protection regulations (GDPR, etc.) before production deployment.
