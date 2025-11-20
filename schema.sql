-- CoupleBot Resolve Database Schema
-- Copy this entire file and run it in the Supabase SQL Editor

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code text UNIQUE NOT NULL,
  status text DEFAULT 'waiting' NOT NULL,
  partner_a_ready boolean DEFAULT false NOT NULL,
  partner_b_ready boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'active', 'advice_ready', 'completed'))
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_role CHECK (role IN ('partner_a', 'partner_b', 'bot_to_a', 'bot_to_b', 'bot_general'))
);

-- Create session_context table
CREATE TABLE IF NOT EXISTS session_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  partner_role text NOT NULL,
  conversation_history jsonb DEFAULT '[]'::jsonb NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_partner_role CHECK (partner_role IN ('partner_a', 'partner_b')),
  CONSTRAINT unique_session_partner UNIQUE (session_id, partner_role)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_session_context_session_id ON session_context(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_code ON sessions(session_code);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_context ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert session context" ON session_context;
DROP POLICY IF EXISTS "Anyone can read session context" ON session_context;
DROP POLICY IF EXISTS "Anyone can update session context" ON session_context;

-- Create policies for public access (for demo purposes)
CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update sessions"
  ON sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert session context"
  ON session_context FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read session context"
  ON session_context FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update session context"
  ON session_context FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
