
-- Create affiliate system tables
CREATE TYPE affiliate_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'cancelled');

-- Affiliates table
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    affiliate_code VARCHAR(20) UNIQUE NOT NULL,
    status affiliate_status DEFAULT 'pending',
    commission_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% default commission
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Referrals table (tracks when someone signs up via affiliate link)
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_user_id) -- A user can only be referred once
);

-- Commissions table (tracks earnings from purchases)
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
    referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
    purchase_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    status commission_status DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliates
CREATE POLICY "Users can view their own affiliate record" ON public.affiliates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affiliate record" ON public.affiliates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate record" ON public.affiliates
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Affiliates can view their referrals" ON public.referrals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.affiliates 
            WHERE affiliates.id = referrals.affiliate_id 
            AND affiliates.user_id = auth.uid()
        )
    );

-- RLS Policies for commissions
CREATE POLICY "Affiliates can view their commissions" ON public.commissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.affiliates 
            WHERE affiliates.id = commissions.affiliate_id 
            AND affiliates.user_id = auth.uid()
        )
    );

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if it already exists
        SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = code) INTO exists_check;
        
        -- If it doesn't exist, break the loop
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle referral tracking during signup
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
    referral_code_param TEXT;
    affiliate_record RECORD;
BEGIN
    -- Check if there's a referral code in the user metadata
    referral_code_param := NEW.raw_user_meta_data ->> 'referral_code';
    
    IF referral_code_param IS NOT NULL THEN
        -- Find the affiliate with this code
        SELECT * INTO affiliate_record 
        FROM public.affiliates 
        WHERE affiliate_code = referral_code_param 
        AND status = 'active';
        
        IF FOUND THEN
            -- Create the referral record
            INSERT INTO public.referrals (affiliate_id, referred_user_id, referral_code)
            VALUES (affiliate_record.id, NEW.id, referral_code_param);
            
            -- Update affiliate referral count
            UPDATE public.affiliates 
            SET total_referrals = total_referrals + 1,
                updated_at = NOW()
            WHERE id = affiliate_record.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for referral tracking
CREATE TRIGGER on_auth_user_created_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_referral_signup();

-- Function to create commission when purchase is made
CREATE OR REPLACE FUNCTION create_commission(
    purchase_user_id UUID,
    purchase_amount DECIMAL,
    description TEXT DEFAULT 'Purchase commission'
)
RETURNS UUID AS $$
DECLARE
    referral_record RECORD;
    affiliate_record RECORD;
    commission_id UUID;
    commission_amount DECIMAL;
BEGIN
    -- Find if this user was referred by someone
    SELECT r.*, a.commission_rate, a.id as affiliate_id
    INTO referral_record
    FROM public.referrals r
    JOIN public.affiliates a ON r.affiliate_id = a.id
    WHERE r.referred_user_id = purchase_user_id
    AND a.status = 'active';
    
    IF FOUND THEN
        -- Calculate commission
        commission_amount := purchase_amount * referral_record.commission_rate;
        
        -- Create commission record
        INSERT INTO public.commissions (
            affiliate_id, 
            referral_id, 
            purchase_amount, 
            commission_amount, 
            commission_rate,
            description
        ) VALUES (
            referral_record.affiliate_id,
            referral_record.id,
            purchase_amount,
            commission_amount,
            referral_record.commission_rate,
            description
        ) RETURNING id INTO commission_id;
        
        -- Update affiliate total earnings
        UPDATE public.affiliates 
        SET total_earnings = total_earnings + commission_amount,
            updated_at = NOW()
        WHERE id = referral_record.affiliate_id;
        
        RETURN commission_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);
CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX idx_commissions_affiliate_id ON public.commissions(affiliate_id);
