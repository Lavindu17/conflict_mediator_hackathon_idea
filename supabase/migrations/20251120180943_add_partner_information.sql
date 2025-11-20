/*
  # Add Partner Information to Sessions

  1. Changes
    - Add `partner_a_name` column to store Partner A's name
    - Add `partner_a_age` column to store Partner A's age
    - Add `partner_a_gender` column to store Partner A's gender
    - Add `partner_b_name` column to store Partner B's name
    - Add `partner_b_age` column to store Partner B's age
    - Add `partner_b_gender` column to store Partner B's gender
  
  2. Notes
    - Partner information is optional initially
    - Partner A is automatically the session creator
    - Partner B is automatically the person who joins with the code
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_name'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_age'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_a_gender'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_a_gender text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_name'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_age'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_age integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'partner_b_gender'
  ) THEN
    ALTER TABLE sessions ADD COLUMN partner_b_gender text;
  END IF;
END $$;