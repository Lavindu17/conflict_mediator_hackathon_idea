import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const setupDatabase = async () => {
  console.log('Setting up CoupleBot Resolve database...');

  const queries = [
    `CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_code text UNIQUE NOT NULL,
      status text DEFAULT 'waiting' NOT NULL,
      partner_a_ready boolean DEFAULT false NOT NULL,
      partner_b_ready boolean DEFAULT false NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      CONSTRAINT valid_status CHECK (status IN ('waiting', 'active', 'advice_ready', 'completed'))
    )`,

    `CREATE TABLE IF NOT EXISTS messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
      role text NOT NULL,
      content text NOT NULL,
      created_at timestamptz DEFAULT now() NOT NULL,
      CONSTRAINT valid_role CHECK (role IN ('partner_a', 'partner_b', 'bot_to_a', 'bot_to_b', 'bot_general'))
    )`,

    `CREATE TABLE IF NOT EXISTS session_context (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
      partner_role text NOT NULL,
      conversation_history jsonb DEFAULT '[]'::jsonb NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      CONSTRAINT valid_partner_role CHECK (partner_role IN ('partner_a', 'partner_b')),
      CONSTRAINT unique_session_partner UNIQUE (session_id, partner_role)
    )`,

    `CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`,
    `CREATE INDEX IF NOT EXISTS idx_session_context_session_id ON session_context(session_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_session_code ON sessions(session_code)`,

    `ALTER TABLE sessions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE messages ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE session_context ENABLE ROW LEVEL SECURITY`,

    `DROP POLICY IF EXISTS "Anyone can create sessions" ON sessions`,
    `CREATE POLICY "Anyone can create sessions" ON sessions FOR INSERT TO anon WITH CHECK (true)`,

    `DROP POLICY IF EXISTS "Anyone can read sessions" ON sessions`,
    `CREATE POLICY "Anyone can read sessions" ON sessions FOR SELECT TO anon USING (true)`,

    `DROP POLICY IF EXISTS "Anyone can update sessions" ON sessions`,
    `CREATE POLICY "Anyone can update sessions" ON sessions FOR UPDATE TO anon USING (true) WITH CHECK (true)`,

    `DROP POLICY IF EXISTS "Anyone can insert messages" ON messages`,
    `CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT TO anon WITH CHECK (true)`,

    `DROP POLICY IF EXISTS "Anyone can read messages" ON messages`,
    `CREATE POLICY "Anyone can read messages" ON messages FOR SELECT TO anon USING (true)`,

    `DROP POLICY IF EXISTS "Anyone can insert session context" ON session_context`,
    `CREATE POLICY "Anyone can insert session context" ON session_context FOR INSERT TO anon WITH CHECK (true)`,

    `DROP POLICY IF EXISTS "Anyone can read session context" ON session_context`,
    `CREATE POLICY "Anyone can read session context" ON session_context FOR SELECT TO anon USING (true)`,

    `DROP POLICY IF EXISTS "Anyone can update session context" ON session_context`,
    `CREATE POLICY "Anyone can update session context" ON session_context FOR UPDATE TO anon USING (true) WITH CHECK (true)`,
  ];

  for (const query of queries) {
    const { error } = await supabase.rpc('exec_sql', { sql: query });
    if (error) {
      console.error('Error executing query:', query);
      console.error(error);
    }
  }

  console.log('Database setup complete!');
};

setupDatabase().catch(console.error);
