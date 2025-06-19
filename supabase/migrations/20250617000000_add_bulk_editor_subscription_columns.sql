
-- Add bulk editor subscription columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bulk_editor_subscription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_editor_subscription_end TIMESTAMPTZ;

-- Create index for efficient querying of expired subscriptions
CREATE INDEX IF NOT EXISTS idx_users_bulk_subscription_end 
ON public.users(bulk_editor_subscription_end) 
WHERE bulk_editor_subscription = true;
