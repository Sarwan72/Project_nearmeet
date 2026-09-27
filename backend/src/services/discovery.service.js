import { query } from "../config/database.js";
export class DiscoveryService {
    /**
     * Discovery algorithm in pure parameterized PostgreSQL
     */
    static async getDiscoveryUsers(userId) {
        // 1. Fetch requesting user's preferences
        const prefRes = await query(`SELECT * FROM user_preferences WHERE user_id = $1`, [userId]);
        const pref = prefRes.rows[0];
        const ageMin = pref?.preferred_age_min || 18;
        const ageMax = pref?.preferred_age_max || 65;
        const genderPrefs = pref?.gender_preference || ["Everyone"];
        const intention = pref?.dating_intention || "All";
        // 2. Fetch user's own interests for shared score calculation
        const myInterestsRes = await query(`SELECT interest_id FROM user_interests WHERE user_id = $1`, [userId]);
        const myInterestIds = myInterestsRes.rows.map((r) => r.interest_id);
        // 3. Build parameterized query
        let sql = `
      SELECT u.id, u.full_name, u.created_at,
             up.avatar, up.age, up.gender, up.gender_custom,
             up.location, up.bio, up.occupation, up.education,
             up.knowing_languages, up.height, up.drinking, up.smoking,
             up.exercise, up.pets, up.weekend_activity, up.personality_type,
             p.dating_intention, p.relationship_values,
             COALESCE(
               (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', pht.id, 'image_url', pht.image_url, 'position', pht.position))
                FROM user_photos pht
                WHERE pht.user_id = u.id),
               '[]'
             ) AS photos,
             COALESCE(
               (SELECT ARRAY_AGG(i.name)
                FROM user_interests ui
                JOIN interests i ON i.id = ui.interest_id
                WHERE ui.user_id = u.id),
               '{}'
             ) AS interests,
             COALESCE(
               (SELECT JSON_AGG(JSON_BUILD_OBJECT('question', pp.question, 'answer', upr.answer))
                FROM user_prompts upr
                JOIN profile_prompts pp ON pp.id = upr.prompt_id
                WHERE upr.user_id = u.id),
               '[]'
             ) AS prompts,
             COALESCE(
               (SELECT COUNT(*)
                FROM user_interests ui
                WHERE ui.user_id = u.id AND ui.interest_id = ANY($2::uuid[])),
               0
             ) AS shared_interests_count
      FROM users u
      INNER JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN user_preferences p ON p.user_id = u.id
      WHERE u.id != $1
        AND u.is_onboarded = TRUE
        -- Exclude blocked users in either direction
        AND NOT EXISTS (
          SELECT 1 FROM blocked_users bu
          WHERE (bu.blocker_id = $1 AND bu.blocked_id = u.id)
             OR (bu.blocker_id = u.id AND bu.blocked_id = $1)
        )
        -- Exclude already liked profiles
        AND NOT EXISTS (
          SELECT 1 FROM likes l
          WHERE l.liker_id = $1 AND l.liked_id = u.id
        )
    `;
        const params = [userId, myInterestIds];
        // Filter by age range
        params.push(ageMin);
        sql += ` AND (up.age >= $${params.length} OR up.age IS NULL)`;
        params.push(ageMax);
        sql += ` AND (up.age <= $${params.length} OR up.age IS NULL)`;
        // Filter by gender if not "Everyone"
        if (!genderPrefs.includes("Everyone") && genderPrefs.length > 0) {
            params.push(genderPrefs);
            sql += ` AND (up.gender = ANY($${params.length}::text[]) OR up.gender IS NULL)`;
        }
        sql += ` ORDER BY shared_interests_count DESC, u.created_at DESC LIMIT 30`;
        const res = await query(sql, params);
        return res.rows.map((row) => {
            const sharedCount = parseInt(row.shared_interests_count, 10) || 0;
            const compatibility = Math.min(99, Math.max(60, 65 + sharedCount * 8));
            return {
                id: row.id,
                _id: row.id, // compatibility
                fullName: row.full_name,
                avatar: row.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.id}`,
                profilePic: row.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.id}`,
                age: row.age || 25,
                gender: row.gender || "Prefer not to say",
                genderCustom: row.gender_custom,
                location: row.location || "Nearby",
                bio: row.bio || "Looking to meet exciting people at offline spots.",
                occupation: row.occupation,
                education: row.education,
                knowingLanguages: row.knowing_languages || [],
                height: row.height,
                lifestyle: {
                    drinking: row.drinking,
                    smoking: row.smoking,
                    exercise: row.exercise,
                    pets: row.pets,
                },
                datingIntention: row.dating_intention || "Long-term relationship",
                relationshipValues: row.relationship_values || [],
                weekendActivity: row.weekend_activity,
                personalityType: row.personality_type,
                interests: row.interests || [],
                photos: row.photos || [],
                prompts: row.prompts || [],
                compatibilityScore: compatibility,
                sharedInterestsCount: sharedCount,
            };
        });
    }
}
