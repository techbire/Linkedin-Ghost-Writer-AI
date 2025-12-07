-- Migration: Allow Multiple Writing Templates Per User
-- This updates the writing_templates table to support template history

-- Step 1: Drop the unique constraint on user_id
ALTER TABLE public.writing_templates 
DROP CONSTRAINT IF EXISTS writing_templates_user_id_key;

-- Step 2: Add is_active column to mark the currently active template
ALTER TABLE public.writing_templates 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_writing_templates_user_active 
ON public.writing_templates(user_id, is_active DESC, created_at DESC);

-- Step 4: Create a function to set only one template as active per user
CREATE OR REPLACE FUNCTION set_single_active_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If this template is being set to active, deactivate all others for this user
  IF NEW.is_active = true THEN
    UPDATE public.writing_templates
    SET is_active = false
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to maintain single active template
DROP TRIGGER IF EXISTS ensure_single_active_template ON public.writing_templates;
CREATE TRIGGER ensure_single_active_template
  BEFORE INSERT OR UPDATE ON public.writing_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_single_active_template();

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'writing_templates' 
ORDER BY ordinal_position;
