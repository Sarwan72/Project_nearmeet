-- 002_create_user_profiles.sql
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    age INT CHECK (age >= 18 OR age IS NULL),
    gender VARCHAR(50),
    gender_custom VARCHAR(50),
    avatar VARCHAR(500),
    location VARCHAR(255),
    has_location_permission BOOLEAN DEFAULT FALSE,
    dating_radius INT DEFAULT 25 CHECK (dating_radius >= 5 AND dating_radius <= 100),
    bio TEXT DEFAULT '',
    occupation VARCHAR(100) DEFAULT '',
    education VARCHAR(100) DEFAULT '',
    knowing_languages TEXT[] DEFAULT '{}',
    height VARCHAR(50) DEFAULT '',
    drinking VARCHAR(50) DEFAULT 'Prefer not to say',
    smoking VARCHAR(50) DEFAULT 'Prefer not to say',
    exercise VARCHAR(50) DEFAULT 'Prefer not to say',
    pets VARCHAR(50) DEFAULT 'Prefer not to say',
    weekend_activity TEXT DEFAULT '',
    personality_type VARCHAR(50) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_age ON user_profiles(age);
CREATE INDEX IF NOT EXISTS idx_user_profiles_gender ON user_profiles(gender);
