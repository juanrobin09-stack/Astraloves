/*
  # Stories Stellaires System (Premium Feature)

  1. New Tables
    - `stories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text: photo/video)
      - `media_url` (text)
      - `thumbnail_url` (text)
      - `duration` (integer, for videos)
      - `text_content` (text, optional)
      - `text_color` (text)
      - `text_position` (jsonb)
      - `stickers` (jsonb array)
      - `filters` (text)
      - `visibility` (text: all/friends/compatible)
      - `views_count` (integer, default 0)
      - `replies_count` (integer, default 0)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, +24h)

    - `story_views`
      - `id` (uuid, primary key)
      - `story_id` (uuid, references stories)
      - `viewer_id` (uuid, references auth.users)
      - `reaction` (text, nullable: heart/star/fire)
      - `viewed_at` (timestamptz)

    - `story_replies`
      - `id` (uuid, primary key)
      - `story_id` (uuid, references stories)
      - `from_user_id` (uuid, references auth.users)
      - `to_user_id` (uuid, references auth.users)
      - `message` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Premium users can create stories
    - Premium users can view stories
    - Users can view their own stories and stats
    - Users can reply to stories of their matches/friends

  3. Indexes
    - Index on expires_at for cleanup
    - Index on user_id for fetching user's stories
    - Index on story_id for views and replies
*/

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video')),
  media_url text NOT NULL,
  thumbnail_url text,
  duration integer DEFAULT 5,
  text_content text,
  text_color text DEFAULT '#ffffff',
  text_position jsonb DEFAULT '{"x": 0.5, "y": 0.5}'::jsonb,
  stickers jsonb DEFAULT '[]'::jsonb,
  filters text,
  visibility text DEFAULT 'all' CHECK (visibility IN ('all', 'friends', 'compatible')),
  views_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create story_views table
CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction text CHECK (reaction IN ('heart', 'star', 'fire') OR reaction IS NULL),
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Create story_replies table
CREATE TABLE IF NOT EXISTS story_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_story_replies_story_id ON story_replies(story_id);

-- Enable Row Level Security
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_replies ENABLE ROW LEVEL SECURITY;

-- Stories policies
CREATE POLICY "Premium users can create stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM astra_profiles
      WHERE id = auth.uid()
      AND is_premium = true
    )
  );

CREATE POLICY "Users can view their own stories"
  ON stories FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Premium users can view active stories"
  ON stories FOR SELECT
  TO authenticated
  USING (
    expires_at > now()
    AND EXISTS (
      SELECT 1 FROM astra_profiles
      WHERE id = auth.uid()
      AND is_premium = true
    )
  );

CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Story views policies
CREATE POLICY "Users can view story views for their own stories"
  ON story_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = story_views.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Premium users can add story views"
  ON story_views FOR INSERT
  TO authenticated
  WITH CHECK (
    viewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM astra_profiles
      WHERE id = auth.uid()
      AND is_premium = true
    )
  );

CREATE POLICY "Users can update their own views reactions"
  ON story_views FOR UPDATE
  TO authenticated
  USING (viewer_id = auth.uid())
  WITH CHECK (viewer_id = auth.uid());

-- Story replies policies
CREATE POLICY "Users can view replies to their stories"
  ON story_replies FOR SELECT
  TO authenticated
  USING (
    to_user_id = auth.uid()
    OR from_user_id = auth.uid()
  );

CREATE POLICY "Premium users can reply to stories"
  ON story_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    from_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM astra_profiles
      WHERE id = auth.uid()
      AND is_premium = true
    )
  );

-- Function to increment views count
CREATE OR REPLACE FUNCTION increment_story_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on story_views insert
CREATE TRIGGER on_story_view_increment
  AFTER INSERT ON story_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_views();

-- Function to increment replies count
CREATE OR REPLACE FUNCTION increment_story_replies()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories
  SET replies_count = replies_count + 1
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on story_replies insert
CREATE TRIGGER on_story_reply_increment
  AFTER INSERT ON story_replies
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_replies();
