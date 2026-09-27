-- 003_create_user_preferences.sql
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dating_intention VARCHAR(100) DEFAULT 'Long-term relationship',
    preferred_age_min INT DEFAULT 18 CHECK (preferred_age_min >= 18),
    preferred_age_max INT DEFAULT 60 CHECK (preferred_age_max >= preferred_age_min),
    preferred_distance INT DEFAULT 50 CHECK (preferred_distance >= 5 AND preferred_distance <= 100),
    gender_preference TEXT[] DEFAULT '{"Everyone"}',
    relationship_values TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_intention ON user_preferences(dating_intention);
