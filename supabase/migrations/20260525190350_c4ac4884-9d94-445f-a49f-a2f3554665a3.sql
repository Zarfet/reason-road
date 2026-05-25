
-- has_role is used inside RLS policies and needs EXECUTE for the calling role.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
