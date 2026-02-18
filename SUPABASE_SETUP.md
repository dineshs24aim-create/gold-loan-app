# Gold Loan Appraiser Tracking System - Supabase Setup Guide

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Setup Instructions

### 1. Create a Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details and wait for the database to be set up

### 2. Run the Database Schema
1. In your Supabase dashboard, navigate to the SQL Editor
2. Open the `supabase-schema.sql` file from this project
3. Copy and paste the entire SQL content into the Supabase SQL Editor
4. Click "Run" to execute the schema

This will create:
- `banks` table
- `loans` table
- Initial bank data
- Row Level Security (RLS) policies
- Helpful database views and indexes

### 3. Get Your Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys" → "anon public")

### 4. Configure Environment Variables
1. Create a `.env` file in the root of your project (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 5. Enable Email Authentication (Optional but Recommended)
1. In Supabase Dashboard, go to Authentication → Providers
2. Enable "Email" provider
3. Configure email templates if desired
4. For development, you can enable "Confirm email" to be disabled

### 6. Install Dependencies
```bash
npm install
```

### 7. Run the Application
```bash
npm run dev
```

## Authentication

The app now uses Supabase Authentication instead of localStorage:
- Users can sign up with email/password
- Email verification is optional (can be configured in Supabase)
- Passwords must be at least 6 characters
- Sessions are managed securely by Supabase

### Creating Your First User
1. Click "Don't have an account? Sign up" on the login page
2. Enter your email, create a password (min 6 chars), and choose a username
3. If email verification is enabled, check your email to verify
4. Log in with your credentials

## Database Structure

### Tables
- **banks**: Stores bank branch information
- **loans**: Stores loan appraisal records with foreign key to banks

### Features
- Row Level Security (RLS) enabled on all tables
- Automatic timestamps with triggers
- Cascading deletes (deleting a bank removes its loans)
- Optimized indexes for better query performance

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Use environment variables for all sensitive data
- RLS policies ensure users can only access their own data

## Troubleshooting

### "Invalid API key" error
- Check that your `.env` file has the correct Supabase URL and anon key
- Restart the dev server after changing `.env` file

### "Failed to fetch" errors
- Verify your Supabase project is active
- Check your internet connection
- Ensure RLS policies are set up correctly

### Authentication issues
- Make sure email provider is enabled in Supabase
- Check if email verification is required and adjust settings accordingly
- Verify the password meets minimum requirements (6 characters)

## Migration from localStorage

If you have existing data in localStorage, you'll need to:
1. Export your current data
2. Manually insert it into Supabase using the SQL Editor or Supabase Table Editor
3. Or start fresh with the new Supabase backend

## Support

For Supabase-specific issues, refer to:
- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
