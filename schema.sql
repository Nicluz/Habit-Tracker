-- ═══════════════════════════════════════════════════
-- Habit Tracker — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ── Daily entries ──────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_entries (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid    REFERENCES auth.users NOT NULL,
  date         date    NOT NULL,

  -- Sleep
  sleep_h      integer,
  sleep_m      integer DEFAULT 0,
  wake_h       integer,
  wake_m       integer DEFAULT 0,
  sleep_quality text   CHECK (sleep_quality IN ('poor','low','fair','good','great')),
  morning_routine boolean DEFAULT false,

  -- Training
  activity     text,
  pushups      integer DEFAULT 0,
  stretching   boolean DEFAULT false,

  -- General
  day_rating   integer CHECK (day_rating BETWEEN 1 AND 10),
  screen_h     integer DEFAULT 0,
  screen_m     integer DEFAULT 0,
  social_h     integer DEFAULT 0,
  social_m     integer DEFAULT 0,
  reading      boolean DEFAULT false,
  alcohol      boolean DEFAULT false,

  -- Feelings (1–10)
  feel_physical integer CHECK (feel_physical BETWEEN 1 AND 10),
  feel_social   integer CHECK (feel_social   BETWEEN 1 AND 10),
  feel_work     integer CHECK (feel_work     BETWEEN 1 AND 10),
  feel_leisure  integer CHECK (feel_leisure  BETWEEN 1 AND 10),
  feel_inner    integer CHECK (feel_inner    BETWEEN 1 AND 10),
  feel_overall  integer CHECK (feel_overall  BETWEEN 1 AND 10),

  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),

  UNIQUE (user_id, date)
);

-- ── Custom activities ───────────────────────────────
CREATE TABLE IF NOT EXISTS custom_activities (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid    REFERENCES auth.users NOT NULL,
  name       text    NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── Training completions ────────────────────────────
CREATE TABLE IF NOT EXISTS training_completions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users NOT NULL,
  date        date NOT NULL,
  session_key text NOT NULL,           -- 'monday', 'tuesday', etc.
  UNIQUE (user_id, date)
);

-- ── Row Level Security ──────────────────────────────
ALTER TABLE daily_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;

-- daily_entries
CREATE POLICY "own entries" ON daily_entries
  FOR ALL USING (auth.uid() = user_id);

-- custom_activities
CREATE POLICY "own activities" ON custom_activities
  FOR ALL USING (auth.uid() = user_id);

-- training_completions
CREATE POLICY "own completions" ON training_completions
  FOR ALL USING (auth.uid() = user_id);

-- ── Auto-update updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
