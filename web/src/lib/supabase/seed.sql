-- QuitSim Seed Data
-- Run after schema.sql in Supabase SQL Editor
-- Creates demo data for development/testing

-- Note: In production, profiles are created via the auth trigger.
-- For development, you can create a test user through Supabase Auth UI
-- and then this seed populates sample plans for that user.

-- Sample plans (replace 'YOUR_USER_UUID' with an actual auth user ID)
-- To get your user ID: SELECT id FROM auth.users LIMIT 1;

-- Example insert (uncomment and replace UUID after creating a test user):

/*
INSERT INTO public.plans (user_id, name, params, result) VALUES
(
  'YOUR_USER_UUID',
  'Cold Turkey Quit',
  '{
    "incomeDropPct": 100,
    "newMonthlyIncome": 0,
    "additionalExpenses": 0,
    "savingsRate": 0,
    "investmentReturn": 7,
    "colChange": 0,
    "emergencyMonths": 6,
    "blackSwan": false
  }',
  '{
    "runwayMonths": 8,
    "quitConfidence": 32,
    "freedomDate": null,
    "monteCarlo": {"median": 9, "p10": 5, "p90": 14, "successRate": 18, "runs": []}
  }'
),
(
  'YOUR_USER_UUID',
  'Freelance Transition',
  '{
    "incomeDropPct": 100,
    "newMonthlyIncome": 4000,
    "additionalExpenses": 500,
    "savingsRate": 10,
    "investmentReturn": 7,
    "colChange": 0,
    "emergencyMonths": 6,
    "blackSwan": false
  }',
  '{
    "runwayMonths": 24,
    "quitConfidence": 62,
    "freedomDate": "2027-06-01T00:00:00.000Z",
    "monteCarlo": {"median": 28, "p10": 14, "p90": 36, "successRate": 65, "runs": []}
  }'
),
(
  'YOUR_USER_UUID',
  'FIRE Plan',
  '{
    "incomeDropPct": 100,
    "newMonthlyIncome": 0,
    "additionalExpenses": 0,
    "savingsRate": 0,
    "investmentReturn": 7,
    "colChange": -10,
    "emergencyMonths": 12,
    "blackSwan": true
  }',
  '{
    "runwayMonths": 36,
    "quitConfidence": 78,
    "freedomDate": "2027-01-01T00:00:00.000Z",
    "monteCarlo": {"median": 36, "p10": 22, "p90": 36, "successRate": 82, "runs": []}
  }'
);
*/

-- Cost of living multipliers by ZIP prefix (for future ZIP-based COL adjustment)
CREATE TABLE IF NOT EXISTS public.col_multipliers (
  zip_prefix text PRIMARY KEY,
  city text NOT NULL,
  state text NOT NULL,
  multiplier numeric(4,2) NOT NULL DEFAULT 1.00
);

INSERT INTO public.col_multipliers (zip_prefix, city, state, multiplier) VALUES
  ('802', 'Denver', 'CO', 1.05),
  ('100', 'New York', 'NY', 1.87),
  ('941', 'San Francisco', 'CA', 1.82),
  ('900', 'Los Angeles', 'CA', 1.46),
  ('606', 'Chicago', 'IL', 1.07),
  ('770', 'Houston', 'TX', 0.96),
  ('852', 'Phoenix', 'AZ', 0.97),
  ('191', 'Philadelphia', 'PA', 1.02),
  ('782', 'San Antonio', 'TX', 0.87),
  ('921', 'San Diego', 'CA', 1.42),
  ('752', 'Dallas', 'TX', 1.01),
  ('787', 'Austin', 'TX', 1.10),
  ('322', 'Jacksonville', 'FL', 0.95),
  ('462', 'Indianapolis', 'IN', 0.92),
  ('432', 'Columbus', 'OH', 0.93),
  ('281', 'Charlotte', 'NC', 0.98),
  ('981', 'Seattle', 'WA', 1.49),
  ('372', 'Nashville', 'TN', 1.01),
  ('201', 'Washington', 'DC', 1.52),
  ('021', 'Boston', 'MA', 1.48),
  ('331', 'Miami', 'FL', 1.27),
  ('303', 'Atlanta', 'GA', 1.06),
  ('554', 'Minneapolis', 'MN', 1.05),
  ('972', 'Portland', 'OR', 1.30),
  ('273', 'Raleigh', 'NC', 1.00)
ON CONFLICT (zip_prefix) DO NOTHING;
