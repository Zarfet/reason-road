-- Improve security of handle_new_user() function
-- Adds explicit NULL validation and warning comment for SECURITY DEFINER usage

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- SECURITY: Explicitly validate the user context to prevent NULL insertions
    IF new.id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add security warning comment for developers
COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER: This function bypasses RLS for automatic profile creation on user signup. Review carefully before modifying. Any changes to this function will execute with elevated privileges.';