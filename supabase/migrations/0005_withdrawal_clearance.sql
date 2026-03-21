-- Migration: 0005_withdrawal_clearance.sql
-- Goal: Update withdrawal status and formalize clearance code tables.

-- 1. Update withdrawals table status constraint
-- We need to drop the old constraint and add a new one including 'awaiting_payment'
ALTER TABLE public.withdrawals 
DROP CONSTRAINT IF EXISTS withdrawals_status_check;

ALTER TABLE public.withdrawals 
ADD CONSTRAINT withdrawals_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'awaiting_payment'));

-- 2. Create Withdrawal Code Settings (for admin instructions)
CREATE TABLE IF NOT EXISTS public.withdrawal_code_settings (
    id TEXT PRIMARY KEY DEFAULT 'fixed_settings',
    payment_details TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Withdrawal Code Submissions (user submitted codes)
CREATE TABLE IF NOT EXISTS public.withdrawal_code_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    withdrawal_id UUID REFERENCES public.withdrawals(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(withdrawal_id) -- One submission per withdrawal
);

-- 4. Enable RLS
ALTER TABLE public.withdrawal_code_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_code_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Settings: Everyone can view, only admins can manage
DROP POLICY IF EXISTS "Anyone can view withdrawal code settings" ON public.withdrawal_code_settings;
CREATE POLICY "Anyone can view withdrawal code settings" ON public.withdrawal_code_settings
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage withdrawal code settings" ON public.withdrawal_code_settings;
CREATE POLICY "Admins can manage withdrawal code settings" ON public.withdrawal_code_settings
FOR ALL USING (public.is_admin());

-- Submissions: Users can view/create their own, admins can manage all
DROP POLICY IF EXISTS "Users can view their own code submissions" ON public.withdrawal_code_submissions;
CREATE POLICY "Users can view their own code submissions" ON public.withdrawal_code_submissions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own code submissions" ON public.withdrawal_code_submissions;
CREATE POLICY "Users can create their own code submissions" ON public.withdrawal_code_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all code submissions" ON public.withdrawal_code_submissions;
CREATE POLICY "Admins can manage all code submissions" ON public.withdrawal_code_submissions
FOR ALL USING (public.is_admin());

-- 6. Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_withdrawal_code_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    -- If submission is approved, automatically update the linked withdrawal to 'pending'
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        UPDATE public.withdrawals 
        SET status = 'pending' 
        WHERE id = NEW.withdrawal_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_code_update ON public.withdrawal_code_submissions;
CREATE TRIGGER on_withdrawal_code_update
    BEFORE UPDATE ON public.withdrawal_code_submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_withdrawal_code_update();

-- 7. Seed initial settings if not exists
INSERT INTO public.withdrawal_code_settings (id, payment_details)
VALUES ('fixed_settings', 'Please pay the clearance fee to the following wallet address:\n\nUSDT (TRC20): TYourWalletAddressHere\n\nAfter payment, enter your transaction ID or the code provided by support.')
ON CONFLICT (id) DO NOTHING;
