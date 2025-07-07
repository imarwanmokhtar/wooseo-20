
-- Add subscription type and lifetime access columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bulk_editor_subscription_type TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS bulk_editor_lifetime_access BOOLEAN DEFAULT false;

-- Update the existing logic to handle null subscription_end as unlimited access
-- This will be handled in the application logic where null = unlimited access for active subscriptions

-- Add a function to check bulk editor access that handles the new logic
CREATE OR REPLACE FUNCTION public.check_bulk_editor_access(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT 
        bulk_editor_subscription,
        bulk_editor_subscription_end,
        bulk_editor_lifetime_access
    INTO user_record
    FROM public.users 
    WHERE id = user_id_param;
    
    -- If user not found, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- If user has lifetime access, return true
    IF user_record.bulk_editor_lifetime_access = true THEN
        RETURN TRUE;
    END IF;
    
    -- If user has active subscription
    IF user_record.bulk_editor_subscription = true THEN
        -- If subscription_end is null, it means unlimited access
        IF user_record.bulk_editor_subscription_end IS NULL THEN
            RETURN TRUE;
        END IF;
        
        -- If subscription hasn't expired
        IF user_record.bulk_editor_subscription_end > now() THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Update the expire_subscriptions function to handle the new logic
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update expired bulk editor subscriptions (but not lifetime users)
  UPDATE public.users 
  SET 
    bulk_editor_subscription = false,
    bulk_editor_subscription_end = NULL
  WHERE 
    bulk_editor_subscription = true 
    AND bulk_editor_lifetime_access = false  -- Don't expire lifetime users
    AND bulk_editor_subscription_end IS NOT NULL 
    AND bulk_editor_subscription_end < now();
    
  -- Log the number of expired subscriptions
  RAISE NOTICE 'Expired subscriptions updated at %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
