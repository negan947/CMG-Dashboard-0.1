-- Agency Settings Table
CREATE TABLE IF NOT EXISTS public.agency_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL,
    general_settings JSONB DEFAULT '{}',
    billing_settings JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    team_settings JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    integration_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_agency_id FOREIGN KEY (agency_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL,
    user_id UUID,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'invited',
    can_manage_clients BOOLEAN DEFAULT FALSE,
    can_manage_invoices BOOLEAN DEFAULT FALSE,
    can_manage_team BOOLEAN DEFAULT FALSE,
    can_access_reports BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_agency_id FOREIGN KEY (agency_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE
    SET NULL
);
-- API Keys Table for Integrations
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL,
    name TEXT NOT NULL,
    key_value TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_agency_id FOREIGN KEY (agency_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
-- Create Row Level Security Policies
-- Agency Settings RLS
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency users can view their own settings" ON public.agency_settings FOR
SELECT USING (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE user_id = auth.uid()
                AND agency_id = agency_settings.agency_id
        )
    );
CREATE POLICY "Agency owners and admins can update their own settings" ON public.agency_settings FOR
UPDATE USING (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE user_id = auth.uid()
                AND agency_id = agency_settings.agency_id
                AND role IN ('owner', 'admin')
        )
    );
CREATE POLICY "Agency owners and admins can insert their own settings" ON public.agency_settings FOR
INSERT WITH CHECK (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE user_id = auth.uid()
                AND agency_id = agency_settings.agency_id
                AND role IN ('owner', 'admin')
        )
    );
-- Team Members RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency users can view their team members" ON public.team_members FOR
SELECT USING (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members AS tm
            WHERE tm.user_id = auth.uid()
                AND tm.agency_id = team_members.agency_id
        )
    );
CREATE POLICY "Agency owners and admins with team management permissions can update team members" ON public.team_members FOR
UPDATE USING (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members AS tm
            WHERE tm.user_id = auth.uid()
                AND tm.agency_id = team_members.agency_id
                AND tm.role IN ('owner', 'admin')
                AND tm.can_manage_team = TRUE
        )
    );
CREATE POLICY "Agency owners and admins with team management permissions can insert team members" ON public.team_members FOR
INSERT WITH CHECK (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members AS tm
            WHERE tm.user_id = auth.uid()
                AND tm.agency_id = team_members.agency_id
                AND tm.role IN ('owner', 'admin')
                AND tm.can_manage_team = TRUE
        )
    );
CREATE POLICY "Agency owners and admins with team management permissions can delete team members" ON public.team_members FOR DELETE USING (
    agency_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.team_members AS tm
        WHERE tm.user_id = auth.uid()
            AND tm.agency_id = team_members.agency_id
            AND tm.role IN ('owner', 'admin')
            AND tm.can_manage_team = TRUE
    )
);
-- API Keys RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agency owners and admins can view their API keys" ON public.api_keys FOR
SELECT USING (
        agency_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.team_members
            WHERE user_id = auth.uid()
                AND agency_id = api_keys.agency_id
                AND role IN ('owner', 'admin')
        )
    );
CREATE POLICY "Agency owners and admins can manage their API keys" ON public.api_keys FOR ALL USING (
    agency_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.team_members
        WHERE user_id = auth.uid()
            AND agency_id = api_keys.agency_id
            AND role IN ('owner', 'admin')
    )
);
-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_agency_settings_modtime BEFORE
UPDATE ON public.agency_settings FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_team_members_modtime BEFORE
UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION update_modified_column();