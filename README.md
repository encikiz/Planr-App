# Planr - Project Management Application

A modern project management application with team collaboration features, built with Node.js, Express, and MongoDB. Planr helps teams organize projects, track tasks, and collaborate effectively.

![Dashboard](frontend/assets/screenshot/dashboard.jpg)

## Live Demo

The application is deployed and available at:
[https://planr-app.vercel.app](https://planr-app.vercel.app)

You can log in with Google or use the guest access option to explore the application.

## Screenshots

### Login Screen
![Login Screen](frontend/assets/screenshot/login.jpg)

### Dashboard
![Dashboard](frontend/assets/screenshot/dashboard.jpg)

### Projects Management
![Projects](frontend/assets/screenshot/projects.jpg)

### Tasks Management
![Tasks](frontend/assets/screenshot/tasks.jpg)

### Milestones Tracking
![Milestones](frontend/assets/screenshot/milestones.jpg)

### Team Management
![Teams](frontend/assets/screenshot/teams.jpg)

### Team Members
![Team Members](frontend/assets/screenshot/team-members.jpg)

## Recent Updates

- **Consolidated Authentication**: Unified authentication system using Passport.js with Google OAuth and JWT tokens for both browser and API access
- **Environment-Aware Configuration**: Optimized for both development and production (Vercel) environments with appropriate session handling
- **Template Support**: Added backend support for team and project templates with API endpoints
- **Standardized API Routes**: Consistent API structure across the application with proper error handling
- **View-Only Guest Access**: Secure guest mode with read-only permissions to protect data integrity
- **Removed Mock Data**: All data now comes directly from MongoDB instead of static sample data
- **Improved Error Handling**: Better error handling and logging throughout the application

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (connection string required)
- Google OAuth credentials (for authentication)

### Installation

1. Clone the repository

2. Install dependencies for the backend:
   ```
   cd backend
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret_at_least_32_chars_long
   PORT=5000
   NODE_ENV=development
   ```

   **Notes:**
   - The `SESSION_SECRET` should be at least 32 characters long for security
   - At minimum, you need the `MONGODB_URI` to run the application locally
   - Without Google OAuth credentials, you can still use the guest login option
   - A sample `.env.example` file is provided as a template

### Running the Application Locally

#### Prerequisites Check

Before running the application, ensure:
1. You have Node.js installed (v16 or higher)
2. MongoDB Atlas account is set up and connection string is available
3. Google OAuth credentials are configured with the correct callback URL:
   - For local development: `http://localhost:5000/api/auth/google/callback`

#### Method 1: Using Startup Script (Recommended for Windows)

The repository includes a simple PowerShell script that automatically starts the application:

```powershell
# Run the PowerShell script
.\start-planr.ps1
```

This script:
- Checks for Node.js installation
- Verifies the backend directory and server.js file exist
- Starts the application server
- Shows the application status and URL

#### Method 2: Using npm

```bash
# From the root directory
npm start
```

#### Method 3: Manual Start

```bash
# Navigate to the backend directory
cd backend

# Start the server
node server.js
```

#### Method 4: Using Nodemon for Development (Auto-restart on file changes)

If you have nodemon installed globally or as a dev dependency:

```bash
# Navigate to the backend directory
cd backend

# Start with nodemon for auto-restart on file changes
npx nodemon server.js
```

The application will be available at http://localhost:5000

#### Quick Start Guide

1. Clone the repository
2. Create a `.env` file in the root directory with your MongoDB connection string
3. Run the application using one of the methods above
4. Access the application at http://localhost:5000

For more comprehensive setup instructions, refer to the `LOCAL_SETUP.md` file in the repository.

#### Verifying the Application is Running

1. Open your browser and navigate to http://localhost:5000
2. You should see the login page:

   ![Login Screen](frontend/assets/screenshot/login.jpg)

3. You can log in with Google or continue as a guest
4. After logging in, you'll see the dashboard:

   ![Dashboard](frontend/assets/screenshot/dashboard.jpg)

5. The server console will show logs of requests and database connections

### Troubleshooting

If you encounter issues starting or running the application, follow these steps:

#### Environment Setup Issues

1. **Verify Node.js Installation**:
   ```bash
   node --version
   ```
   Ensure it shows v16.0.0 or higher. If not, download and install from [nodejs.org](https://nodejs.org/).

2. **Check .env File**:
   - Ensure the `.env` file exists in the root directory
   - Verify it contains all required variables (see template below)
   - Make sure there are no spaces around the equal signs
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   SESSION_SECRET=your_secure_session_secret_key_at_least_32_chars
   PORT=5000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=development
   ```

3. **Verify Dependencies**:
   ```bash
   cd backend
   npm list --depth=0
   ```
   If any dependencies are missing, run:
   ```bash
   npm install
   ```

#### Runtime Issues

1. **MongoDB Connection Error**:
   - Verify your MongoDB Atlas connection string is correct
   - Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings
   - Try connecting to MongoDB Atlas using MongoDB Compass to verify credentials
   - Check for any network restrictions that might block MongoDB connections

2. **Google OAuth Issues**:
   - Verify your Google OAuth credentials in the Google Cloud Console
   - Ensure the callback URL is correctly set to `http://localhost:5000/api/auth/google/callback`
   - Check that the OAuth consent screen is properly configured
   - Verify that the required scopes (email, profile) are enabled

3. **Port Already in Use**:
   If you see an error like "Port 5000 is already in use", either:
   - Close the application using port 5000
   - Change the PORT value in your .env file:
     ```
     PORT=5001
     ```
   - Then update any references to the port in your code or documentation

4. **Session or Authentication Issues**:
   - Ensure SESSION_SECRET is at least 32 characters long
   - Clear browser cookies and try again
   - Check browser console for any CORS or cookie-related errors

#### Debugging Tips

1. **Enable Verbose Logging**:
   Add the following to your .env file:
   ```
   DEBUG=true
   ```

2. **Check Server Logs**:
   The server logs in the terminal will show:
   - MongoDB connection status
   - Session configuration
   - Authentication attempts
   - API requests and responses
   - Error messages

3. **Browser Developer Tools**:
   - Open your browser's developer tools (F12 in most browsers)
   - Check the Console tab for JavaScript errors
   - Check the Network tab for failed API requests
   - Check the Application tab for cookies and local storage

For more detailed troubleshooting guidance, refer to the `TROUBLESHOOTING.md` file.

## Features

### Project Management
![Projects](frontend/assets/screenshot/projects.jpg)

- Create and manage projects with detailed information
- Track project progress and status
- Organize projects by teams and categories
- Set project deadlines and priorities

### Task Management
![Tasks](frontend/assets/screenshot/tasks.jpg)

- Create tasks with descriptions, assignees, and due dates
- Track task status (To Do, In Progress, Completed)
- Organize tasks by priority and category
- Filter and sort tasks by various criteria

### Team Collaboration
![Teams](frontend/assets/screenshot/teams.jpg)

- Create and manage teams
- Assign team members to projects and tasks
- Track team member contributions and workload
- Team-specific dashboards and reports

### User Management
![Team Members](frontend/assets/screenshot/team-members.jpg)

- User profiles with roles and permissions
- User authentication via Google OAuth
- Guest access for demonstration purposes
- User activity tracking

### UI/UX
- Dark mode support for reduced eye strain
- Responsive design for mobile and desktop
- Intuitive dashboard with key metrics
- Modern, clean interface with smooth transitions

## Project Structure

### Backend

- `/backend` - Server-side code (Node.js/Express)
  - `/config` - Configuration files
    - `passport.js` - Google OAuth authentication configuration with environment awareness
    - `session.js` - Environment-aware session configuration (express-session/iron-session)
  - `/models` - MongoDB models for data storage
    - User, Project, Task, Milestone, Team models
  - `/routes` - API routes for handling HTTP requests
    - `auth.js` - Authentication routes (login, logout, Google OAuth, guest access)
    - `projects.js` - Project management routes
    - `tasks.js` - Task management routes
    - `milestones.js` - Milestone management routes
    - `users.js` - User management routes (team members)
    - `teams.js` - Team management routes
    - `templates.js` - Template routes for projects and teams
    - `settings.js` - User and application settings routes
    - `members.js` - Compatibility layer that redirects to users routes
  - `/middleware` - Express middleware
    - `auth.js` - Authentication middleware with dual session/JWT support
  - `/utils` - Utility functions
    - `jwt.js` - JWT token generation and verification
    - `jwt-auth.js` - JWT authentication middleware
    - `vercel-auth.js` - Vercel-specific authentication handlers
    - `api-optimization.js` - API optimization utilities
  - `server.js` - Main server file with Express configuration

### Frontend

- `/frontend` - Client-side code (HTML/CSS/JavaScript)
  - `/assets` - Static assets
    - `/css` - Stylesheets
    - `/js` - JavaScript files
    - `/images` - Image files
  - `/pages` - HTML pages for different sections of the application

## Architecture and Design

### Authentication

![Login Screen](frontend/assets/screenshot/login.jpg)

The application uses a comprehensive authentication system with multiple layers:

- **Primary Authentication**: Passport.js with Google OAuth for user login
- **Guest Access**: Simplified authentication for demonstration purposes (view-only)
- **Session Management**:
  - **Development Environment**: Uses Express session for easier debugging
  - **Production/Vercel Environment**: Uses Iron Session for better compatibility with serverless environments
- **API Authentication**: JWT tokens for secure API access
- **Dual Verification**: Requests are authenticated via both session and JWT when available

### API Structure

All API routes follow a consistent pattern:

- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management endpoints (team members)
- `/api/projects/*` - Project management endpoints
- `/api/tasks/*` - Task management endpoints
- `/api/milestones/*` - Milestone management endpoints
- `/api/teams/*` - Team management endpoints
- `/api/templates/*` - Template endpoints for teams and projects
- `/api/settings/*` - User and application settings endpoints

**Note**: The application previously had references to `/api/members` endpoints, but these have been standardized to use `/api/users` for all user/team member related functionality. A compatibility layer redirects any `/api/members` requests to the corresponding `/api/users` endpoints.

### Environment Configuration

The application is environment-aware and adapts its behavior based on:

- `NODE_ENV` - Development or production mode
- `VERCEL` - Whether running on Vercel serverless platform

## Deployment

### Vercel Deployment

The application is configured for deployment on Vercel with:

- Serverless functions for the backend
- Static file hosting for the frontend
- Environment variables for configuration

#### Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Sign up/Login to Vercel**:
   - Go to [Vercel](https://vercel.com/) and sign up or log in with your GitHub account

3. **Import Your GitHub Repository**:
   - Click on "Add New..." → "Project"
   - Select your GitHub account
   - Find and select your repository
   - Click "Import"

4. **Configure Project Settings**:
   - **Project Name**: Choose a name for your project
   - **Framework Preset**: Select "Other"
   - **Root Directory**: Leave as `.` (the root of your repository)

5. **Environment Variables**:
   Add the following environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   SESSION_SECRET=your_secure_session_secret_key_at_least_32_chars
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=production
   VERCEL=1
   JWT_SECRET=your_secure_jwt_secret_key
   ```

6. **Deploy**:
   - Click "Deploy"
   - Wait for the build and deployment to complete

7. **After First Deployment**:
   - Copy your deployment URL (e.g., `https://your-app.vercel.app`)
   - Add it as a new environment variable:
     ```
     PRODUCTION_URL=https://your-app.vercel.app
     ```
   - Update your Google OAuth credentials with the new callback URL:
     ```
     https://your-app.vercel.app/api/auth/google/callback
     ```
   - Trigger a new deployment for these changes to take effect

The `vercel.json` file contains the deployment configuration, which handles routing and serverless function settings.

## GitHub Repository Setup

When pushing this project to GitHub, follow these guidelines:

### 1. Environment Variables and Security

- **NEVER commit sensitive information** to your repository
- The `.gitignore` file is configured to exclude the `.env` file containing sensitive credentials
- Use `.env.example` as a template to show which environment variables are needed without revealing actual values
- Make sure to set up proper environment variables in your deployment platform (Vercel, Heroku, etc.)

### 2. Required Environment Variables

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
SESSION_SECRET=your_secure_session_secret_key_at_least_32_chars
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=development
PRODUCTION_URL=https://your-production-domain.com  # Only needed for production
```

### 3. GitHub Repository Options

When creating your GitHub repository:

- **Add a README file**: Yes (use the existing README.md)
- **Add .gitignore**: Yes (select Node template)
- **Choose a license**: MIT License (recommended for open-source projects)

### 4. Before Your First Push

- Ensure all sensitive credentials are removed from the codebase
- Verify the `.env` file is in your `.gitignore`
- Remove any test accounts or personal information
- Check for hardcoded URLs that might need to be environment variables

## Notes

- The application uses MongoDB for data storage
- Authentication is handled through Google OAuth with fallback options
- The server runs on port 5000 by default in development
- The frontend is served statically by the backend server
- Session handling is environment-aware for optimal performance and compatibility
