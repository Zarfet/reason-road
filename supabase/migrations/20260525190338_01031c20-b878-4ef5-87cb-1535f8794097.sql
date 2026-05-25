
-- Revoke public EXECUTE on internal SECURITY DEFINER functions.
-- These are only used internally by triggers or RLS policies, never by API clients.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_rating_values() FROM PUBLIC, anon, authenticated;

-- get_shared_assessment is intentionally public: it powers anonymous shared-link viewing.
-- Ensure only the controlled access remains.
REVOKE EXECUTE ON FUNCTION public.get_shared_assessment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_assessment(uuid) TO anon, authenticated;
