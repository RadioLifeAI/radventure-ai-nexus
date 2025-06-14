
-- ENUMS
CREATE TYPE subscription_tier AS ENUM ('Free', 'Pro', 'Plus');
CREATE TYPE event_status AS ENUM ('SCHEDULED', 'ACTIVE', 'FINISHED');
CREATE TYPE radcoin_tx_type AS ENUM ('event_reward', 'subscription_purchase', 'help_purchase', 'admin_grant', 'admin_revoke');

-- USERS & PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  country_code text,
  birthdate date,
  bio text,
  radcoin_balance integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_points_idx ON profiles(total_points);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  tier subscription_tier NOT NULL DEFAULT 'Free',
  current_period_end timestamptz,
  status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);

-- MEDICAL CASES
CREATE TABLE public.medical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  specialty text,
  modality text,
  difficulty_level integer,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX medical_cases_specialty_idx ON medical_cases(specialty);
CREATE INDEX medical_cases_modality_idx ON medical_cases(modality);
CREATE INDEX medical_cases_difficulty_idx ON medical_cases(difficulty_level);

-- CASE HISTORY
CREATE TABLE public.user_case_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  answered_at timestamptz NOT NULL DEFAULT now(),
  is_correct boolean,
  points integer DEFAULT 0,
  details jsonb,
  UNIQUE (user_id, case_id)
);

CREATE INDEX user_case_history_user_idx ON user_case_history(user_id);
CREATE INDEX user_case_history_case_idx ON user_case_history(case_id);

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status event_status NOT NULL DEFAULT 'SCHEDULED',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  prize_radcoins integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX events_status_idx ON events(status);
CREATE INDEX events_time_idx ON events(scheduled_start, scheduled_end);

-- EVENT CASES PIVOT
CREATE TABLE public.event_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE
);

CREATE INDEX event_cases_event_id_idx ON event_cases(event_id);

-- EVENT REGISTRATIONS
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX event_registrations_event_idx ON event_registrations(event_id);
CREATE INDEX event_registrations_user_idx ON event_registrations(user_id);

-- EVENT RANKINGS
CREATE TABLE public.event_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL,
  rank integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX event_rankings_event_idx ON event_rankings(event_id);

-- RADCOIN TRANSACTION LOG
CREATE TABLE public.radcoin_transactions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tx_type radcoin_tx_type NOT NULL,
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX radcoin_tx_log_user_idx ON radcoin_transactions_log(user_id);

-- ACHIEVEMENTS
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon_url text,
  criteria jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- USER ACHIEVEMENTS
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX user_achievements_user_idx ON user_achievements(user_id);

-- SYSTEM SETTINGS
CREATE TABLE public.system_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- LOOKUP: SPECIALTIES, MODALITIES...
CREATE TABLE public.medical_specialties (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);
CREATE TABLE public.imaging_modalities (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);
CREATE TABLE public.difficulties (
  id serial PRIMARY KEY,
  level integer UNIQUE NOT NULL,
  description text
);

-- Chron Rankings Aggregates
CREATE TABLE public.monthly_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_month text NOT NULL, -- 'YYYY-MM'
  category text,
  points integer NOT NULL,
  rank integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year_month, category)
);

CREATE INDEX monthly_rankings_period_idx ON monthly_rankings(year_month, category);

