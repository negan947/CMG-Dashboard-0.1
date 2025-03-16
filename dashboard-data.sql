-- Get the first agency ID or create a new one if none exists
DO $$
DECLARE v_agency_id INTEGER;
BEGIN
SELECT id INTO v_agency_id
FROM agencies
LIMIT 1;
IF v_agency_id IS NULL THEN
INSERT INTO agencies (name, slug, created_at, updated_at)
VALUES (
        'CMG Agency',
        'cmg-agency',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
RETURNING id INTO v_agency_id;
END IF;
-- Insert metrics data
INSERT INTO metrics (
        agency_id,
        metric_name,
        current_value,
        previous_value,
        change_percentage,
        period,
        created_at,
        updated_at
    )
VALUES (
        v_agency_id,
        'Objectives',
        78,
        72,
        8.33,
        'last week',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        v_agency_id,
        'New Leads',
        24,
        18,
        33.33,
        'last week',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        v_agency_id,
        'Inquiry Success Rate',
        65,
        58,
        12.07,
        'last week',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        v_agency_id,
        'Overview',
        92,
        85,
        8.24,
        'last week',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
-- Insert client categories
INSERT INTO client_categories (name, color, created_at)
VALUES ('E-commerce', '#4f46e5', CURRENT_TIMESTAMP),
    ('SaaS', '#0ea5e9', CURRENT_TIMESTAMP),
    ('Healthcare', '#10b981', CURRENT_TIMESTAMP),
    ('Finance', '#f59e0b', CURRENT_TIMESTAMP),
    ('Education', '#ef4444', CURRENT_TIMESTAMP);
-- Insert sample clients if needed
IF NOT EXISTS (
    SELECT 1
    FROM clients
    LIMIT 1
) THEN
INSERT INTO clients (name, slug, agency_id, created_at, updated_at)
VALUES (
        'Acme E-commerce',
        'acme-ecommerce',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'SaaS Company',
        'saas-company',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Health Services',
        'health-services',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Financial Group',
        'financial-group',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Tech Academy',
        'tech-academy',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Retail Store',
        'retail-store',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Cloud Platform',
        'cloud-platform',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Medical Center',
        'medical-center',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Investment Firm',
        'investment-firm',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'Online School',
        'online-school',
        v_agency_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
END IF;
-- Map clients to categories
INSERT INTO client_category_mapping (client_id, category_id, created_at)
SELECT c.id,
    cc.id,
    CURRENT_TIMESTAMP
FROM clients c
    CROSS JOIN client_categories cc
WHERE (
        c.name LIKE '%E-commerce%'
        AND cc.name = 'E-commerce'
    )
    OR (
        c.name LIKE '%SaaS%'
        OR c.name LIKE '%Cloud%'
        AND cc.name = 'SaaS'
    )
    OR (
        c.name LIKE '%Health%'
        OR c.name LIKE '%Medical%'
        AND cc.name = 'Healthcare'
    )
    OR (
        c.name LIKE '%Financial%'
        OR c.name LIKE '%Investment%'
        AND cc.name = 'Finance'
    )
    OR (
        c.name LIKE '%Academy%'
        OR c.name LIKE '%School%'
        AND cc.name = 'Education'
    ) ON CONFLICT DO NOTHING;
-- Add more mappings to ensure all categories have clients
INSERT INTO client_category_mapping (client_id, category_id, created_at)
SELECT c.id,
    cc.id,
    CURRENT_TIMESTAMP
FROM clients c,
    client_categories cc
WHERE (
        c.name = 'Retail Store'
        AND cc.name = 'E-commerce'
    )
    OR (
        c.name = 'Cloud Platform'
        AND cc.name = 'SaaS'
    )
    OR (
        c.name = 'Medical Center'
        AND cc.name = 'Healthcare'
    )
    OR (
        c.name = 'Investment Firm'
        AND cc.name = 'Finance'
    )
    OR (
        c.name = 'Online School'
        AND cc.name = 'Education'
    ) ON CONFLICT DO NOTHING;
-- Insert client activity trend data (last 30 days)
FOR i IN 0..29 LOOP
INSERT INTO client_activity (
        client_id,
        activity_date,
        activity_count,
        created_at
    )
SELECT id,
    CURRENT_DATE - (i || ' days')::INTERVAL,
    FLOOR(RANDOM() * 30) + 20,
    CURRENT_TIMESTAMP
FROM clients ON CONFLICT DO NOTHING;
END LOOP;
END $$;