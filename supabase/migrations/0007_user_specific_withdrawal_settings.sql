-- Migration: 0007_user_specific_withdrawal_settings.sql
-- Goal: Add user-specific withdrawal instructions and payment details to profiles.

-- 1. Add columns to profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'withdrawal_instructions') THEN
    ALTER TABLE public.profiles ADD COLUMN withdrawal_instructions TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'withdrawal_payment_details') THEN
    ALTER TABLE public.profiles ADD COLUMN withdrawal_payment_details TEXT;
  END IF;
END $$;

-- 2. Update RLS (optional, already covered by profile policies but good for clarity)
-- Profiles can already be viewed/updated by the user and admins.
