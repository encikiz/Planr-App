# Running Planr App Locally

This guide provides step-by-step instructions for setting up and running the Planr application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB Atlas** account (for database)
- **Google OAuth credentials** (optional, for authentication)

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/encikiz/Planr-App.git
cd Planr-App
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
SESSION_SECRET=your_secure_session_secret_key_at_least_32_chars
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=development
```

**Important Notes:**
- Replace the `MONGODB_URI` with your actual MongoDB connection string
- The `SESSION_SECRET` should be at least 32 characters long for security
- Google OAuth credentials are required for Google login functionality
- If you don't have Google OAuth credentials, you can still use guest login

### 4. Start the Application

#### Method 1: Using PowerShell Script (Windows)

The repository includes a PowerShell script that makes it easy to start the application:

```powershell
# Run the PowerShell script
.\start-planr.ps1
```

This will display a menu with options to:
- Start the server
- Start with nodemon (auto-restart on file changes)
- Check prerequisites
- Open the application in browser
- Exit

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

#### Method 4: Development Mode with Auto-Restart

If you have nodemon installed:

```bash
# Navigate to the backend directory
cd backend

# Start with nodemon
npx nodemon server.js
```

### 5. Access the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:5000
```

You should see the login page. You can log in with Google (if configured) or continue as a guest.

## Verifying the Setup

After starting the application:

1. You should see console output indicating:
   - "MongoDB Connected" - Confirms database connection
   - "Server running on http://localhost:5000" - Confirms server is running

2. The browser should display the login page
3. After logging in, you should see the dashboard with project data

## Troubleshooting Common Issues

### MongoDB Connection Issues

If you see "MongoDB Connection Error":
- Verify your MongoDB connection string in the `.env` file
- Ensure your MongoDB Atlas account is active
- Check if your IP address is whitelisted in MongoDB Atlas

### Port Already in Use

If you see "Port 5000 is already in use":
- Close any other applications using port 5000
- Change the PORT value in your `.env` file to another port (e.g., 5001)

### Missing Dependencies

If you encounter errors about missing modules:
```bash
cd backend
npm install
```

### Authentication Issues

If login doesn't work:
- For Google login: Verify your Google OAuth credentials
- Ensure the callback URL in Google Developer Console is set to:
  `http://localhost:5000/api/auth/google/callback`
- Try using guest login as an alternative

### Environment Variables

If the application can't find environment variables:
- Make sure the `.env` file is in the root directory (not in the backend folder)
- Check for typos in variable names
- Ensure there are no spaces around the equal signs

## Additional Resources

For more detailed troubleshooting, refer to the `TROUBLESHOOTING.md` file in the repository.

## Next Steps

After successfully running the application locally, you can:
- Explore the features of the application
- Create projects, tasks, and milestones
- Add team members
- Customize the application to your needs
