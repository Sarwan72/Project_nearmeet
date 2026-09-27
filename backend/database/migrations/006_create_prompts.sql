-- 006_create_prompts.sql
CREATE TABLE IF NOT EXISTS profile_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES profile_prompts(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_user_prompts_user ON user_prompts(user_id);
