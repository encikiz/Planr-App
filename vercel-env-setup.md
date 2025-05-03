# Vercel Environment Variables Setup

To fix the Google OAuth authentication in your Vercel deployment, you need to update the environment variables in the Vercel dashboard.

## Steps to Update Environment Variables

1. Go to the [Vercel Dashboard](https://vercel.com/)
2. Select your Planr project
3. Go to "Settings" > "Environment Variables"
4. Add or update the following environment variables:

```
MONGODB_URI=<your-mongodb-connection-string>
SESSION_SECRET=<your-session-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NODE_ENV=production
VERCEL=1
PRODUCTION_URL=https://planr-app.vercel.app
```

**Important**: Use the actual values from your local .env file, not the placeholders shown above.

5. Make sure to set these variables for the "Production" environment
6. Click "Save" to apply the changes
7. Redeploy your application

## Update Google OAuth Configuration

You also need to update your Google OAuth configuration to allow the new callback URL:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find and edit your OAuth 2.0 Client ID
4. Add the new callback URL: `https://planr-app.vercel.app/api/auth/google/callback`
5. Save the changes

After completing these steps, your Google OAuth authentication should work correctly in the Vercel deployment.
