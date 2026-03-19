-- 0003_dynamic_currencies.sql

-- 1. Ensure Profiles has currency column (Safety Fix)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'currency') THEN
    ALTER TABLE public.profiles ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;
END $$;

-- 2. Create Currencies Table (Dynamic Management)
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Seed initial currencies
INSERT INTO public.currencies (code, name, symbol)
VALUES 
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('GBP', 'British Pound', '£'),
  ('KWD', 'Kuwaiti Dinar', 'KD'),
  ('AED', 'UAE Dirham', 'DH'),
  ('SAR', 'Saudi Riyal', 'SR')
ON CONFLICT (code) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Anyone can view active currencies" ON public.currencies;
CREATE POLICY "Anyone can view active currencies" ON public.currencies FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all currencies" ON public.currencies;
CREATE POLICY "Admins can manage all currencies" ON public.currencies FOR ALL USING (public.is_admin());
