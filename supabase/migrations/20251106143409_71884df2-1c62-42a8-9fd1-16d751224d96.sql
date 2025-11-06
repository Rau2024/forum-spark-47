-- Create junction table for many-to-many relationship between posts and categories
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, category_id)
);

-- Enable RLS
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Post categories are viewable by everyone" 
ON public.post_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authors can add categories to their posts" 
ON public.post_categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_id 
    AND posts.author_id = auth.uid()
  )
);

CREATE POLICY "Authors can remove categories from their posts" 
ON public.post_categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_id 
    AND posts.author_id = auth.uid()
  )
);

-- Migrate existing data from posts.category_id to post_categories
INSERT INTO public.post_categories (post_id, category_id)
SELECT id, category_id 
FROM public.posts 
WHERE category_id IS NOT NULL;

-- Remove category_id column from posts table
ALTER TABLE public.posts DROP COLUMN category_id;