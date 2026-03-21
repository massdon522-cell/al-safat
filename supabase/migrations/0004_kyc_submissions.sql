-- 0004_kyc_submissions.sql
-- UP MIGRATION

-- 1. Create KYC Submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('passport', 'national_id', 'drivers_license')),
  id_number TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.kyc_submissions;
CREATE POLICY "Users can view their own submissions" ON public.kyc_submissions 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.kyc_submissions;
CREATE POLICY "Users can insert their own submissions" ON public.kyc_submissions 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all submissions" ON public.kyc_submissions;
CREATE POLICY "Admins can view all submissions" ON public.kyc_submissions 
FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all submissions" ON public.kyc_submissions;
CREATE POLICY "Admins can update all submissions" ON public.kyc_submissions 
FOR UPDATE USING (public.is_admin());

-- 4. Trigger to update profile kyc_status
CREATE OR REPLACE FUNCTION public.handle_kyc_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table when a KYC submission is updated
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.profiles
    SET kyc_status = NEW.status,
        updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_kyc_submission_updated
  AFTER UPDATE ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_kyc_status_update();

-- 5. Trigger to set kyc_status to pending on new submission
CREATE OR REPLACE FUNCTION public.handle_new_kyc_submission()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET kyc_status = 'pending',
      updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_kyc_submission_created
  AFTER INSERT ON public.kyc_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_kyc_submission();
