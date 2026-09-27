-- 009_create_pair_requests.sql
DO $$ BEGIN
    CREATE TYPE pair_request_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS pair_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
    table_number VARCHAR(50) DEFAULT '',
    compatibility_score INT DEFAULT 0,
    user1_status VARCHAR(20) DEFAULT 'pending',
    user2_status VARCHAR(20) DEFAULT 'pending',
    status pair_request_status DEFAULT 'pending',
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pair_requests_vendor ON pair_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_pair_requests_user1 ON pair_requests(user1_id);
CREATE INDEX IF NOT EXISTS idx_pair_requests_user2 ON pair_requests(user2_id);
CREATE INDEX IF NOT EXISTS idx_pair_requests_status ON pair_requests(status);
