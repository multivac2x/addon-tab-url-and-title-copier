-- Supabase Database Setup for Tab URL & Title Copier Extension
-- Run these commands in your Supabase SQL editor

-- Create the link_batches table
CREATE TABLE IF NOT EXISTS link_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  links JSONB NOT NULL
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_link_batches_user_id ON link_batches(user_id);

-- Create an index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_link_batches_created_at ON link_batches(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE link_batches ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only access their own link batches
CREATE POLICY "Users can only access their own link batches"
ON link_batches
FOR ALL
USING (auth.uid() = user_id);

-- Optional: Create a policy for anonymous users (if using anonymous auth)
-- This allows anonymous users to access their own data
CREATE POLICY "Anonymous users can access their own data"
ON link_batches
FOR ALL
USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'aud' = 'authenticated'
);

-- Create a view for easier querying (optional)
CREATE OR REPLACE VIEW user_link_batches AS
SELECT 
  id,
  user_id,
  created_at,
  jsonb_array_length(links) as link_count,
  links
FROM link_batches
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Grant necessary permissions
GRANT ALL ON link_batches TO authenticated;
GRANT ALL ON link_batches TO anon;
GRANT SELECT ON user_link_batches TO authenticated;
GRANT SELECT ON user_link_batches TO anon;

-- Example of inserting test data (optional - for testing)
-- INSERT INTO link_batches (user_id, links) VALUES (
--   auth.uid(),
--   '[
--     {"url": "https://www.example.com", "title": "Example Domain"},
--     {"url": "https://www.google.com", "title": "Google"}
--   ]'::jsonb
-- );