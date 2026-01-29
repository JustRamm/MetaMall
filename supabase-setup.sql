-- =====================================================
-- MetaMall Multiplayer - Supabase RLS Policies Setup
-- =====================================================
-- Run this script in your Supabase SQL Editor to enable
-- proper permissions for multiplayer functionality
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Allow anyone to read user profiles (for displaying usernames)
CREATE POLICY "Public read access for users"
ON public.users FOR SELECT
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- =====================================================
-- USER PRESENCE TABLE POLICIES
-- =====================================================

-- Allow anyone to read all presence data (to see other players)
CREATE POLICY "Public read access for presence"
ON public.user_presence FOR SELECT
USING (true);

-- Allow users to insert their own presence
CREATE POLICY "Users can insert own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own presence
CREATE POLICY "Users can update own presence"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own presence
CREATE POLICY "Users can delete own presence"
ON public.user_presence FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- CHAT MESSAGES TABLE POLICIES
-- =====================================================

-- Allow anyone to read chat messages
CREATE POLICY "Public read access for chat"
ON public.chat_messages FOR SELECT
USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

-- Allow anyone to read products
CREATE POLICY "Public read access for products"
ON public.products FOR SELECT
USING (true);

-- Only admins can modify products (add admin check as needed)
-- For now, we'll allow authenticated users to insert for testing
CREATE POLICY "Authenticated users can manage products"
ON public.products FOR ALL
USING (auth.role() = 'authenticated');

-- =====================================================
-- CART ITEMS TABLE POLICIES
-- =====================================================

-- Users can only see their own cart items
CREATE POLICY "Users can read own cart"
ON public.cart_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can add items to their own cart
CREATE POLICY "Users can insert own cart items"
ON public.cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update own cart items"
ON public.cart_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
ON public.cart_items FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- ORDERS TABLE POLICIES
-- =====================================================

-- Users can only see their own orders
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER ACTIVITY TABLE POLICIES
-- =====================================================

-- Allow anyone to read activity (for analytics)
CREATE POLICY "Public read access for activity"
ON public.user_activity FOR SELECT
USING (true);

-- Allow users to insert their own activity
CREATE POLICY "Users can insert own activity"
ON public.user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for user_presence table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Enable realtime for cart_items (for shared shopping)
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on user_presence for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen 
ON public.user_presence(last_seen DESC);

-- Index on chat_messages for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON public.chat_messages(created_at DESC);

-- Index on user_activity for analytics
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at 
ON public.user_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id 
ON public.user_activity(user_id);

-- =====================================================
-- FUNCTIONS FOR CLEANUP
-- =====================================================

-- Function to clean up stale presence records (older than 1 minute)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_presence
  WHERE last_seen < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup every minute (requires pg_cron extension)
-- Uncomment if you have pg_cron enabled:
-- SELECT cron.schedule('cleanup-presence', '* * * * *', 'SELECT cleanup_stale_presence()');

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

GRANT ALL ON public.user_presence TO authenticated;
GRANT SELECT ON public.user_presence TO anon;

GRANT ALL ON public.chat_messages TO authenticated;
GRANT SELECT ON public.chat_messages TO anon;

GRANT SELECT ON public.products TO anon, authenticated;

GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.user_activity TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything is set up correctly:

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_presence', 'chat_messages', 'products', 'cart_items', 'orders');

-- Check policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- 1. For production, replace 'true' in public read policies
--    with more restrictive conditions
-- 
-- 2. Add admin role checks for product management
-- 
-- 3. Consider rate limiting for chat messages
-- 
-- 4. Monitor presence table size and adjust cleanup interval
-- 
-- 5. For anonymous users (no auth), you may need to adjust
--    policies to use session-based identification
-- 
-- =====================================================
