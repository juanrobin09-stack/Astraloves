/*
  # Create Demo Dating Profiles System

  1. New Tables
    - `demo_dating_profiles`
      - `id` (uuid, primary key)
      - `name` (text) - Profile name
      - `age` (integer) - Profile age
      - `city` (text) - City location
      - `photo_url` (text) - Photo URL from Unsplash
      - `bio` (text) - Short bio
      - `interests` (text[]) - Array of 3 interests
      - `subscription_type` (text) - free, premium, or elite
      - `is_online` (boolean) - Online status
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `demo_dating_profiles` table
    - Add policy for authenticated users to read all profiles

  3. Data
    - Insert 10 demo profiles with varied subscription types
*/

CREATE TABLE IF NOT EXISTS demo_dating_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  city text NOT NULL,
  photo_url text NOT NULL,
  bio text NOT NULL,
  interests text[] NOT NULL,
  subscription_type text NOT NULL CHECK (subscription_type IN ('free', 'premium', 'elite')),
  is_online boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE demo_dating_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demo profiles"
  ON demo_dating_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert 10 demo profiles
INSERT INTO demo_dating_profiles (name, age, city, photo_url, bio, interests, subscription_type, is_online)
VALUES
  ('Sophie', 24, 'Paris', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Passionnée de photo et de voyages ✈️', ARRAY['Photographie', 'Voyages', 'Café'], 'free', true),
  ('Lucas', 27, 'Lyon', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Développeur le jour, musicien la nuit 🎸', ARRAY['Musique', 'Tech', 'Gaming'], 'free', true),
  ('Emma', 25, 'Marseille', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Amoureuse de la mer et du soleil 🌊', ARRAY['Surf', 'Yoga', 'Nature'], 'free', false),
  ('Thomas', 29, 'Bordeaux', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Chef cuisinier en quête de nouvelles saveurs 👨‍🍳', ARRAY['Cuisine', 'Vin', 'Gastronomie'], 'premium', true),
  ('Chloé', 26, 'Toulouse', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'Architecte et passionnée d''art moderne 🎨', ARRAY['Architecture', 'Art', 'Design'], 'premium', true),
  ('Alexandre', 30, 'Nice', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'Entrepreneur dans la tech, toujours en mouvement 🚀', ARRAY['Startup', 'Innovation', 'Sport'], 'premium', false),
  ('Léa', 28, 'Nantes', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'Avocate passionnée de justice et de littérature 📚', ARRAY['Droit', 'Lecture', 'Théâtre'], 'elite', true),
  ('Maxime', 31, 'Strasbourg', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'Pilote privé avec l''envie d''explorer le monde 🛩️', ARRAY['Aviation', 'Aventure', 'Luxe'], 'elite', true),
  ('Charlotte', 27, 'Lille', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', 'Médecin et marathonienne dans l''âme 🏃‍♀️', ARRAY['Médecine', 'Running', 'Bien-être'], 'elite', true),
  ('Julien', 32, 'Montpellier', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', 'Investisseur et collectionneur d''art passionné 💎', ARRAY['Finance', 'Art', 'Investissement'], 'elite', false)
ON CONFLICT DO NOTHING;
