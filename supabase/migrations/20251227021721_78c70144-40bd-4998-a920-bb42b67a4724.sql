-- Add facebook_marketplace_link column to profiles for owner identity verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS facebook_marketplace_link text;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Enable realtime for admin_notifications so admin console gets live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;