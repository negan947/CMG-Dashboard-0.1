-- Create the user_dashboard_widgets table
CREATE TABLE IF NOT EXISTS public.user_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    widget_type VARCHAR NOT NULL,
    widget_config JSONB NOT NULL DEFAULT '{}',
    grid_position JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_widgets_user_id ON public.user_dashboard_widgets(user_id);
-- Enable RLS
ALTER TABLE public.user_dashboard_widgets ENABLE ROW LEVEL SECURITY;
-- Create policies for row-level security
-- Allow users to select only their own dashboard widgets
CREATE POLICY "Users can view their own dashboard widgets" ON public.user_dashboard_widgets FOR
SELECT USING (auth.uid() = user_id);
-- Allow users to insert their own dashboard widgets
CREATE POLICY "Users can insert their own dashboard widgets" ON public.user_dashboard_widgets FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Allow users to update their own dashboard widgets
CREATE POLICY "Users can update their own dashboard widgets" ON public.user_dashboard_widgets FOR
UPDATE USING (auth.uid() = user_id);
-- Allow users to delete their own dashboard widgets
CREATE POLICY "Users can delete their own dashboard widgets" ON public.user_dashboard_widgets FOR DELETE USING (auth.uid() = user_id);
-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to update updated_at on update
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_user_dashboard_widgets_updated_at'
) THEN CREATE TRIGGER set_user_dashboard_widgets_updated_at BEFORE
UPDATE ON public.user_dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END IF;
END $$;