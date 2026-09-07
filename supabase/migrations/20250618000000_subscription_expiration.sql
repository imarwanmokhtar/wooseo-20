
-- Create function to expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update expired bulk editor subscriptions
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

-- Create a function to be called by cron
CREATE OR REPLACE FUNCTION public.handle_cron_expire_subscriptions()
RETURNS void AS $$
BEGIN
  PERFORM public.expire_subscriptions();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every hour
SELECT cron.schedule('expire-subscriptions', '0 * * * *', 'SELECT public.handle_cron_expire_subscriptions();');
