-- ═══════════════════════════════════════════════════════════════════════
-- FIX SUPABASE STORAGE 406 ERRORS
-- ═══════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CRÉER BUCKETS SI PAS EXISTANTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Bucket avatars (photos profil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket photos (galerie photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket profiles (images profil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. SUPPRIMER ANCIENNES POLICIES (si existent)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Photo access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. CRÉER NOUVELLES POLICIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Policy 1: LECTURE PUBLIQUE pour tous les buckets
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('avatars', 'photos', 'profiles')
);

-- Policy 2: UPLOAD - Users peuvent upload leurs propres images
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('avatars', 'photos', 'profiles')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: UPDATE - Users peuvent modifier leurs propres images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('avatars', 'photos', 'profiles')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: DELETE - Users peuvent supprimer leurs propres images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('avatars', 'photos', 'profiles')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. VÉRIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Vérifier buckets publics
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('avatars', 'photos', 'profiles');

-- Vérifier policies actives
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- NOTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Structure attendue des paths:
-- avatars/USER_ID/photo1.jpg
-- avatars/USER_ID/photo2.jpg
-- photos/USER_ID/image.jpg
-- profiles/USER_ID/avatar.jpg
--
-- La policy vérifie que le USER_ID dans le path correspond à auth.uid()
-- ═══════════════════════════════════════════════════════════════════════
