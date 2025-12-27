-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view item photos (public bucket)
CREATE POLICY "Anyone can view item photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-photos');

-- Authenticated users can upload item photos to their own folder
CREATE POLICY "Users can upload item photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own item photos
CREATE POLICY "Users can update their own item photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own item photos
CREATE POLICY "Users can delete their own item photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'item-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);