-- Drop the existing public SELECT policy on user_roles
DROP POLICY IF EXISTS "User roles are viewable by everyone" ON public.user_roles;

-- Create a restricted policy: users can view their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add admin-only policy for role management
CREATE POLICY "Admins view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));