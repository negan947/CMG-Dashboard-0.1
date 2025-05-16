-- Add agency_id and created_by_user_id to tasks table if they don't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks'
        AND column_name = 'agency_id'
) THEN
ALTER TABLE tasks
ADD COLUMN agency_id INTEGER REFERENCES agencies(id);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tasks'
        AND column_name = 'created_by_user_id'
) THEN
ALTER TABLE tasks
ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id);
END IF;
END $$;
-- Create communication_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    agency_id INTEGER NOT NULL REFERENCES agencies(id),
    communication_type VARCHAR(20) NOT NULL CHECK (
        communication_type IN (
            'email_sent',
            'email_received',
            'call_made',
            'call_received',
            'meeting',
            'internal_note'
        )
    ),
    summary TEXT NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    communication_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add indexes
CREATE INDEX IF NOT EXISTS idx_communication_logs_client_id ON communication_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_agency_id ON communication_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_timestamp ON communication_logs(communication_timestamp);
-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_communication_logs_updated_at ON communication_logs;
CREATE TRIGGER trigger_communication_logs_updated_at BEFORE
UPDATE ON communication_logs FOR EACH ROW EXECUTE FUNCTION update_timestamp();
-- Add RLS policies
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
-- Policy for select (view logs)
CREATE POLICY communication_logs_select_policy ON communication_logs FOR
SELECT USING (
        -- Allow users to see logs for agencies they belong to
        EXISTS (
            SELECT 1
            FROM agency_team_members
            WHERE user_id = auth.uid()
                AND agency_id = communication_logs.agency_id
        )
    );
-- Policy for insert (create logs)
CREATE POLICY communication_logs_insert_policy ON communication_logs FOR
INSERT WITH CHECK (
        -- Allow users to create logs for agencies they belong to
        EXISTS (
            SELECT 1
            FROM agency_team_members
            WHERE user_id = auth.uid()
                AND agency_id = communication_logs.agency_id
        )
    );
-- Policy for update (modify logs)
CREATE POLICY communication_logs_update_policy ON communication_logs FOR
UPDATE USING (
        -- Allow users to update logs for agencies they belong to
        EXISTS (
            SELECT 1
            FROM agency_team_members
            WHERE user_id = auth.uid()
                AND agency_id = communication_logs.agency_id
        )
    ) WITH CHECK (
        -- Allow users to update logs for agencies they belong to
        EXISTS (
            SELECT 1
            FROM agency_team_members
            WHERE user_id = auth.uid()
                AND agency_id = communication_logs.agency_id
        )
    );
-- Policy for delete (remove logs)
CREATE POLICY communication_logs_delete_policy ON communication_logs FOR DELETE USING (
    -- Allow users to delete logs for agencies they belong to and that they created
    EXISTS (
        SELECT 1
        FROM agency_team_members
        WHERE user_id = auth.uid()
            AND agency_id = communication_logs.agency_id
    )
    AND created_by_user_id = auth.uid()
);