/*
  # Add Email and Scenario Fields

  1. Changes to sessions table
    - Add `partner_a_email` and `partner_b_email` fields
    - Add scenario-related fields for both partners:
      - `partner_a_feeling` (how they feel about the situation)
      - `partner_a_when_happened` (when the incident occurred)
      - `partner_b_feeling`
      - `partner_b_when_happened`
    - Add progress tracking fields:
      - `partner_a_scenario_completed` (boolean)
      - `partner_b_scenario_completed` (boolean)
      - `partner_a_chat_started` (boolean)
      - `partner_b_chat_started` (boolean)
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add email fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_email'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_email'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_email text;
  END IF;
END $$;

-- Add scenario fields for partner A
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_feeling'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_feeling text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_when_happened'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_when_happened text;
  END IF;
END $$;

-- Add scenario fields for partner B
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_feeling'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_feeling text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_when_happened'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_when_happened text;
  END IF;
END $$;

-- Add progress tracking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_scenario_completed'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_scenario_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_scenario_completed'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_scenario_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_chat_started'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_chat_started boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_chat_started'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_chat_started boolean DEFAULT false;
  END IF;
END $$;