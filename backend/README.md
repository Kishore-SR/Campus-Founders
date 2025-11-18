# Campus Founders Backend API

This is the backend API for the Campus Founders platform, built to run on Vercel serverless functions.

## Environment Variables

The following environment variables must be set in your Vercel project:

- `MONGODB_URI`: MongoDB connection string (must start with `mongodb://` or `mongodb+srv://`)
- `JWT_SECRET_KEY`: Secret key for JWT token generation and validation
- `STREAM_API_KEY`: GetStream.io API key for chat functionality
- `STREAM_API_SECRET`: GetStream.io API secret for chat functionality

## Deployment Instructions

### 1. Set Up Environment Variables

Use our automated setup script to configure Vercel environment variables:

```bash
npm run setup-vercel
```

This script will:

- Validate and format your MongoDB URI
- Generate a secure JWT secret key (or use an existing one)
- Configure your GetStream API credentials
- Upload all environment variables to Vercel

**IMPORTANT**: The MongoDB URI must be in the correct format. It must start with `mongodb://` or `mongodb+srv://` and should not be wrapped in quotes.

### 2. Validate Your Environment

Run the environment validation script to check if everything is set up correctly:

```bash
npm run validate-env
```

### 3. Test Database Connection

Test your MongoDB connection:

```bash
npm run test-db
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

### 5. Verify Deployment

After deployment, visit the health check endpoint to verify that all environment variables are set correctly:

```
https://your-app.vercel.app/api/health
```

## Troubleshooting

### MongoDB Connection Issues

If you're experiencing MongoDB connection issues:

1. Run the MongoDB connection test:

   ```bash
   npm run test-db
   ```

2. Check that your MongoDB URI is correctly formatted:

   - Must start with `mongodb://` or `mongodb+srv://`
   - Should not be wrapped in quotes
   - Make sure the username and password are URL-encoded

3. Verify that your MongoDB Atlas IP whitelist includes Vercel's IP ranges or is set to allow connections from anywhere (0.0.0.0/0).

### JWT Issues

If you're experiencing authentication issues:

1. Make sure `JWT_SECRET_KEY` is set and is the same across deployments
2. Check that your frontend is correctly sending the JWT token in requests

### GetStream.io Issues

If chat functionality is not working:

1. Verify that `STREAM_API_KEY` and `STREAM_API_SECRET` are set correctly
2. Make sure your GetStream.io account is active and not in a suspended state
