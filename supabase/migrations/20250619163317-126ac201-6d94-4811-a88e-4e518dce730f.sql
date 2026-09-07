
-- Create a function to grant free bulk editor access to test users
CREATE OR REPLACE FUNCTION public.grant_bulk_editor_access(user_email TEXT, days_duration INTEGER DEFAULT 30)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    new_end_date TIMESTAMPTZ;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Calculate new subscription end date
    new_end_date := now() + (days_duration || ' days')::INTERVAL;
    
    -- Update the user's bulk editor subscription
    UPDATE public.users 
    SET 
        bulk_editor_subscription = true,
        bulk_editor_subscription_end = new_end_date
    WHERE id = target_user_id;
    
    RETURN 'Successfully granted ' || days_duration || ' days of bulk editor access to ' || user_email || ' (expires: ' || new_end_date || ')';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to revoke bulk editor access
CREATE OR REPLACE FUNCTION public.revoke_bulk_editor_access(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN 'User not found with email: ' || user_email;
    END IF;
    
    -- Remove bulk editor subscription
    UPDATE public.users 
    SET 
        bulk_editor_subscription = false,
        bulk_editor_subscription_end = NULL
    WHERE id = target_user_id;
    
    RETURN 'Successfully revoked bulk editor access for ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to list all users with bulk editor access
CREATE OR REPLACE FUNCTION public.list_bulk_editor_users()
RETURNS TABLE(
    email TEXT,
    subscription_active BOOLEAN,
    subscription_end TIMESTAMPTZ,
    days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email,
        u.bulk_editor_subscription,
        u.bulk_editor_subscription_end,
        CASE 
            WHEN u.bulk_editor_subscription_end IS NOT NULL AND u.bulk_editor_subscription = true
            THEN EXTRACT(days FROM (u.bulk_editor_subscription_end - now()))::INTEGER
            ELSE NULL
        END as days_remaining
    FROM public.users u
    WHERE u.bulk_editor_subscription = true
    ORDER BY u.bulk_editor_subscription_end DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing expire_subscriptions function to handle test access properly
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update expired bulk editor subscriptions (including test access)
  UPDATE public.users 
  SET 
    bulk_editor_subscription = false,
    bulk_editor_subscription_end = NULL
  WHERE 
    bulk_editor_subscription = true 
    AND bulk_editor_subscription_end IS NOT NULL 
    AND bulk_editor_subscription_end < now();
    
  -- Log the number of expired subscriptions
  RAISE NOTICE 'Expired subscriptions updated at %', now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
