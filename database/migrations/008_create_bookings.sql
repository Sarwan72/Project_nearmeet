-- 008_create_bookings.sql
DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'booked', 'rejected', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pair_status AS ENUM ('unpaired', 'paired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    status booking_status DEFAULT 'pending',
    paired_with_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pair_status pair_status DEFAULT 'unpaired',
    table_name VARCHAR(100) DEFAULT '',
    guest_count INT DEFAULT 2,
    booking_date TIMESTAMPTZ,
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON booking_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_bookings_pair_status ON booking_requests(pair_status);
