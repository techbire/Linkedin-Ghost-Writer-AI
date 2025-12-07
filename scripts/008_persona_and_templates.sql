-- Create table for user personas (profile data)
CREATE TABLE IF NOT EXISTS public.user_personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Profile Info
    full_name TEXT,
    headline TEXT,
    profile_url TEXT,
    avatar_url TEXT,
    location TEXT,
    
    -- Current Position
    current_position JSONB,
    
    -- Skills and Expertise
    top_skills TEXT[],
    
    -- Professional Background
    recent_roles JSONB[],
    education JSONB[],
    
    -- Metadata
    scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create table for writing templates
CREATE TABLE IF NOT EXISTS public.writing_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Person Info
    person_name TEXT, -- Name of the person whose posts were analyzed
    
    -- Template Structure
    general_template TEXT,
    opening_pattern TEXT,
    credibility_pattern TEXT,
    engagement_pattern TEXT,
    content_structure TEXT,
    cta_pattern TEXT,
    common_elements TEXT[],
    example_template TEXT,
    
    -- Source Info
    source_url TEXT,
    posts_analyzed INTEGER,
    
    -- Metadata
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for user_personas
CREATE POLICY "Users can view their own persona"
    ON public.user_personas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own persona"
    ON public.user_personas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own persona"
    ON public.user_personas
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own persona"
    ON public.user_personas
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for writing_templates
CREATE POLICY "Users can view their own templates"
    ON public.writing_templates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
    ON public.writing_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON public.writing_templates
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON public.writing_templates
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_personas_user_id ON public.user_personas(user_id);
CREATE INDEX idx_writing_templates_user_id ON public.writing_templates(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_personas_updated_at
    BEFORE UPDATE ON public.user_personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writing_templates_updated_at
    BEFORE UPDATE ON public.writing_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
