# CoupleBot Resolve - Setup Instructions

## Quick Start Guide

### Step 1: Set Up the Database

The database needs to be configured before the app can work. Follow these steps:

1. **Open Supabase Dashboard**
   - Go to: https://yiixkivwuqjxkrfkznsd.supabase.co
   - Log in to your Supabase account

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New query" button

3. **Run the Schema**
   - Open the `schema.sql` file in this project
   - Copy ALL the contents
   - Paste into the SQL Editor in Supabase
   - Click "Run" (or press Ctrl/Cmd + Enter)

4. **Verify Setup**
   - You should see "Success. No rows returned" message
   - In the left sidebar, click on "Table Editor"
   - You should now see three tables: `sessions`, `messages`, and `session_context`

### Step 2: Start the Development Server

Once the database is set up, you can start the app:

```bash
npm run dev
```

The app will be available at the URL shown in the terminal.

## What the App Does

**CoupleBot Resolve** is a conflict mediation app for couples where:

1. **Session Creation**: One partner creates a unique session code
2. **Private Entry**: Both partners join using the code and select their roles
3. **Private Chats**: Each partner chats privately with an AI mediator bot
4. **Smart Mediation**: The bot listens to both sides separately
5. **Personalized Advice**: When ready, the bot provides custom advice to each partner

### Key Privacy Features

- Partners NEVER see each other's messages
- Each partner gets separate, personalized advice
- All conversations are private and secure
- The bot acts as a neutral third party

## Environment Variables

The following are already configured in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `EXPO_PUBLIC_GEMINI_API_KEY` - Google Gemini AI API key for chatbot functionality

## Testing the Database Connection

To verify your database is set up correctly:

```bash
node setup-db-simple.js
```

This will tell you if the database is ready or if you need to run the schema.

## Architecture Overview

### Database Tables

1. **sessions**: Stores session metadata and status
2. **messages**: Stores all chat messages with role-based filtering
3. **session_context**: Maintains conversation history for AI context

### App Flow

1. Home Screen → Enter or create session code
2. Role Selection → Choose Partner A or Partner B
3. Chat Screen → Private conversation with AI mediator
4. Automatic Mediation → Bot analyzes both perspectives
5. Personalized Advice → Each partner receives tailored guidance

## Troubleshooting

### "Could not find the table" Error

This means the database schema hasn't been set up yet. Follow Step 1 above.

### API Key Issues

The Gemini API key is already configured. If you see API errors, check that the key is valid at https://ai.google.dev/

### Connection Errors

Make sure your Supabase project is active and the credentials in `.env` are correct.

## Tech Stack

- **Frontend**: React Native with Expo
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 1.5 Flash
- **Real-time**: Supabase Realtime subscriptions
- **Navigation**: Expo Router

## Support

For issues or questions, check:
- Supabase Dashboard for database status
- Browser console for error messages
- Terminal output for server logs
