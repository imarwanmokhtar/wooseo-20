
-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits)
  VALUES (NEW.id, NEW.email, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for other tables that reference users
ALTER TABLE public.woocommerce_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own credentials" ON public.woocommerce_credentials;
CREATE POLICY "Users can manage own credentials" 
  ON public.woocommerce_credentials 
  FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own templates" ON public.prompt_templates;
CREATE POLICY "Users can manage own templates" 
  ON public.prompt_templates 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Ensure bulk generation jobs are also protected
ALTER TABLE public.bulk_generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own jobs" ON public.bulk_generation_jobs;
CREATE POLICY "Users can manage own jobs" 
  ON public.bulk_generation_jobs 
  FOR ALL 
  USING (auth.uid() = user_id);
