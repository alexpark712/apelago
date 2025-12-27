-- Create storage bucket for seller proof screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-proofs', 'seller-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for seller proof uploads - users can upload to their own folder
CREATE POLICY "Users can upload their own proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'seller-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own uploaded proofs
CREATE POLICY "Users can view their own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'seller-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all proofs
CREATE POLICY "Admins can view all proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'seller-proofs' 
  AND public.has_role(auth.uid(), 'admin')
);