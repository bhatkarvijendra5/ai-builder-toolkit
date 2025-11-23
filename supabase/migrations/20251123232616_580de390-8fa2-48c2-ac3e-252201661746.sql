-- Create contact_submissions table to store contact form data
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert contact submissions
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Create policy to allow only admins to read contact submissions (you can modify this later)
CREATE POLICY "Only admins can read contact submissions"
ON public.contact_submissions
FOR SELECT
USING (false); -- Set to false for now, you can update this when you add admin functionality