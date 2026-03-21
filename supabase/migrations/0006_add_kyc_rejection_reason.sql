-- 0006_add_kyc_rejection_reason.sql
-- UP MIGRATION

-- 1. Add kyc_rejection_reason to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'kyc_rejection_reason') THEN
    ALTER TABLE public.profiles ADD COLUMN kyc_rejection_reason TEXT;
  END IF;
END $$;

-- 2. Update the profiles kyc_status check constraint to be more flexible if needed
-- (Optional but good for future proofing)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_kyc_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_kyc_status_check 
  CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected', 'approved'));

-- 3. Update the handle_kyc_status_update function to sync admin_notes and map status
CREATE OR REPLACE FUNCTION public.handle_kyc_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table when a KYC submission is updated
  -- Map 'approved' to 'verified' for Consistency with AuthContext and Profile status
  IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.admin_notes IS DISTINCT FROM NEW.admin_notes) THEN
    UPDATE public.profiles
    SET kyc_status = CASE 
                       WHEN NEW.status = 'approved' THEN 'verified' 
                       ELSE NEW.status 
                     END,
        kyc_rejection_reason = NEW.admin_notes,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update handle_new_kyc_submission to clear previous reason if any
CREATE OR REPLACE FUNCTION public.handle_new_kyc_submission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET kyc_status = 'pending',
      kyc_rejection_reason = NULL,
      updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
