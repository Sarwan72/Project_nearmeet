import bcrypt from "bcryptjs";
import { query, withTransaction } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class UserService {
    /**
     * Fetch complete user profile with joined preferences, photos, interests, and prompts
     */
    static async getFullUserProfile(userId) {
        const userRes = await query(`SELECT id, full_name, email, role, is_onboarded, created_at, updated_at
       FROM users WHERE id = $1`, [userId]);
        if (userRes.rows.length === 0) {
            throw new ApiError(404, "User not found");
        }
        const user = userRes.rows[0];
        // Profile
        const profileRes = await query(`SELECT * FROM user_profiles WHERE user_id = $1`, [userId]);
        const profile = profileRes.rows[0] || null;
        // Preferences
        const prefRes = await query(`SELECT * FROM user_preferences WHERE user_id = $1`, [userId]);
        const preferences = prefRes.rows[0] || null;
        // Photos
        const photosRes = await query(`SELECT id, image_url, position, created_at
       FROM user_photos
       WHERE user_id = $1
       ORDER BY position ASC`, [userId]);
        const photos = photosRes.rows;
        // Interests
        const interestsRes = await query(`SELECT i.id, i.name, i.category
       FROM interests i
       INNER JOIN user_interests ui ON ui.interest_id = i.id
       WHERE ui.user_id = $1
       ORDER BY i.name ASC`, [userId]);
        const interests = interestsRes.rows;
        // Prompts
        const promptsRes = await query(`SELECT up.id, up.prompt_id, pp.question, up.answer, up.created_at, up.updated_at
       FROM user_prompts up
       INNER JOIN profile_prompts pp ON pp.id = up.prompt_id
       WHERE up.user_id = $1`, [userId]);
        const prompts = promptsRes.rows;
        return {
            user: {
                ...user,
                _id: user.id,
                fullName: user.full_name,
                isOnboarded: Boolean(user.is_onboarded),
                profile,
                preferences,
                photos,
                interests,
                prompts,
                // Legacy flat compatibility for frontend components
                avatar: profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`,
                profilePic: profile?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.id}`,
                bio: profile?.bio || "",
                location: profile?.location || "",
                age: profile?.age || null,
                gender: profile?.gender || "",
                genderCustom: profile?.gender_custom || "",
                interestedIn: preferences?.gender_preference || ["Everyone"],
                datingRadius: profile?.dating_radius || 25,
                occupation: profile?.occupation || "",
                education: profile?.education || "",
                knowingLanguages: profile?.knowing_languages || [],
                height: profile?.height || "",
                lifestyle: {
                    drinking: profile?.drinking || "Prefer not to say",
                    smoking: profile?.smoking || "Prefer not to say",
                    exercise: profile?.exercise || "Prefer not to say",
                    pets: profile?.pets || "Prefer not to say",
                },
                datingIntention: preferences?.dating_intention || "Long-term relationship",
                preferredAgeRange: {
                    min: preferences?.preferred_age_min || 18,
                    max: preferences?.preferred_age_max || 60,
                },
                preferredDistance: preferences?.preferred_distance || 50,
                relationshipValues: preferences?.relationship_values || [],
                weekendActivity: profile?.weekend_activity || "",
                personalityType: profile?.personality_type || "",
            },
        };
    }
    /**
     * Complete 8-step onboarding flow in a transaction
     */
    static async completeOnboarding(userId, data) {
        return await withTransaction(async (client) => {
            const { fullName, dateOfBirth, age, gender, genderCustom, interestedIn, avatar, photos, location, hasLocationPermission, datingRadius, bio, occupation, education, knowingLanguages, height, lifestyle, datingIntention, preferredAgeRange, preferredDistance, interests, weekendActivity, personalityType, relationshipValues, prompts, } = data;
            // 1. Update user table
            if (fullName) {
                await client.query(`UPDATE users SET full_name = $1, is_onboarded = TRUE, updated_at = NOW() WHERE id = $2`, [fullName.trim(), userId]);
            }
            else {
                await client.query(`UPDATE users SET is_onboarded = TRUE, updated_at = NOW() WHERE id = $1`, [userId]);
            }
            // 2. Upsert user_profiles
            const selectedAvatar = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`;
            await client.query(`INSERT INTO user_profiles (
          user_id, date_of_birth, age, gender, gender_custom, avatar,
          location, has_location_permission, dating_radius, bio,
          occupation, education, knowing_languages, height,
          drinking, smoking, exercise, pets, weekend_activity, personality_type,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          date_of_birth = EXCLUDED.date_of_birth,
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          gender_custom = EXCLUDED.gender_custom,
          avatar = EXCLUDED.avatar,
          location = EXCLUDED.location,
          has_location_permission = EXCLUDED.has_location_permission,
          dating_radius = EXCLUDED.dating_radius,
          bio = EXCLUDED.bio,
          occupation = EXCLUDED.occupation,
          education = EXCLUDED.education,
          knowing_languages = EXCLUDED.knowing_languages,
          height = EXCLUDED.height,
          drinking = EXCLUDED.drinking,
          smoking = EXCLUDED.smoking,
          exercise = EXCLUDED.exercise,
          pets = EXCLUDED.pets,
          weekend_activity = EXCLUDED.weekend_activity,
          personality_type = EXCLUDED.personality_type,
          updated_at = NOW()`, [
                userId,
                dateOfBirth || null,
                age ? Number(age) : null,
                gender || "",
                genderCustom || "",
                selectedAvatar,
                location || "",
                Boolean(hasLocationPermission),
                datingRadius ? Number(datingRadius) : 25,
                bio || "",
                occupation || "",
                education || "",
                Array.isArray(knowingLanguages) ? knowingLanguages : ["English"],
                height || "",
                lifestyle?.drinking || "Prefer not to say",
                lifestyle?.smoking || "Prefer not to say",
                lifestyle?.exercise || "Prefer not to say",
                lifestyle?.pets || "Prefer not to say",
                weekendActivity || "",
                personalityType || "",
            ]);
            // 3. Upsert user_preferences
            const genderPref = Array.isArray(interestedIn) ? interestedIn : ["Everyone"];
            const ageMin = preferredAgeRange?.min ? Number(preferredAgeRange.min) : 18;
            const ageMax = preferredAgeRange?.max ? Number(preferredAgeRange.max) : 60;
            const dist = preferredDistance ? Number(preferredDistance) : 50;
            const relValues = Array.isArray(relationshipValues) ? relationshipValues : [];
            await client.query(`INSERT INTO user_preferences (
          user_id, dating_intention, preferred_age_min, preferred_age_max,
          preferred_distance, gender_preference, relationship_values, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          dating_intention = EXCLUDED.dating_intention,
          preferred_age_min = EXCLUDED.preferred_age_min,
          preferred_age_max = EXCLUDED.preferred_age_max,
          preferred_distance = EXCLUDED.preferred_distance,
          gender_preference = EXCLUDED.gender_preference,
          relationship_values = EXCLUDED.relationship_values,
          updated_at = NOW()`, [
                userId,
                datingIntention || "Long-term relationship",
                ageMin,
                ageMax,
                dist,
                genderPref,
                relValues,
            ]);
            // 4. Save photos (if provided, up to 6)
            if (Array.isArray(photos) && photos.length > 0) {
                await client.query(`DELETE FROM user_photos WHERE user_id = $1`, [userId]);
                for (let i = 0; i < Math.min(photos.length, 6); i++) {
                    const photoUrl = typeof photos[i] === "string" ? photos[i] : photos[i]?.image_url;
                    if (photoUrl) {
                        await client.query(`INSERT INTO user_photos (user_id, image_url, position) VALUES ($1, $2, $3)`, [userId, photoUrl, i]);
                    }
                }
            }
            // 5. Save interests (names -> mapped to interest IDs)
            if (Array.isArray(interests) && interests.length > 0) {
                await client.query(`DELETE FROM user_interests WHERE user_id = $1`, [userId]);
                for (const name of interests) {
                    const interestName = typeof name === "string" ? name : name?.name;
                    if (interestName) {
                        // Find or insert interest
                        const intRes = await client.query(`INSERT INTO interests (name) VALUES ($1)
               ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
               RETURNING id`, [interestName]);
                        await client.query(`INSERT INTO user_interests (user_id, interest_id) VALUES ($1, $2)
               ON CONFLICT DO NOTHING`, [userId, intRes.rows[0].id]);
                    }
                }
            }
            // 6. Save prompts
            if (Array.isArray(prompts) && prompts.length > 0) {
                await client.query(`DELETE FROM user_prompts WHERE user_id = $1`, [userId]);
                for (const p of prompts) {
                    if (p.question && p.answer?.trim()) {
                        const promptRes = await client.query(`INSERT INTO profile_prompts (question) VALUES ($1)
               ON CONFLICT (question) DO UPDATE SET question = EXCLUDED.question
               RETURNING id`, [p.question]);
                        await client.query(`INSERT INTO user_prompts (user_id, prompt_id, answer)
               VALUES ($1, $2, $3)
               ON CONFLICT (user_id, prompt_id) DO UPDATE SET answer = EXCLUDED.answer`, [userId, promptRes.rows[0].id, p.answer.trim()]);
                    }
                }
            }
            return { success: true, message: "Onboarding completed successfully" };
        });
    }
    /**
     * Update individual profile fields
     */
    static async updateProfile(userId, data) {
        return await this.completeOnboarding(userId, data);
    }
    /**
     * Add a single photo to user's photo gallery (up to 6)
     */
    static async addPhoto(userId, imageUrl) {
        const countRes = await query(`SELECT COUNT(*) FROM user_photos WHERE user_id = $1`, [userId]);
        const count = parseInt(countRes.rows[0].count, 10);
        if (count >= 6) {
            throw new ApiError(400, "Maximum of 6 photos allowed");
        }
        const insertRes = await query(`INSERT INTO user_photos (user_id, image_url, position)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, image_url, position, created_at`, [userId, imageUrl, count]);
        return insertRes.rows[0];
    }
    /**
     * Delete a photo
     */
    static async deletePhoto(userId, photoId) {
        const res = await query(`DELETE FROM user_photos WHERE id = $1 AND user_id = $2`, [photoId, userId]);
        if (res.rowCount === 0) {
            throw new ApiError(404, "Photo not found or already deleted");
        }
        return { success: true };
    }
    /**
     * Get all available system interests
     */
    static async getAllInterests() {
        const res = await query(`SELECT id, name, category FROM interests ORDER BY category, name ASC`);
        return res.rows;
    }
    /**
     * Get all available system prompts
     */
    static async getAllPrompts() {
        const res = await query(`SELECT id, question FROM profile_prompts ORDER BY question ASC`);
        return res.rows;
    }
    /**
     * Delete user account and cascade delete all related data
     */
    static async deleteAccount(userId, password) {
        const res = await query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "User not found");
        }
        if (password && res.rows[0].password_hash) {
            const isMatch = await bcrypt.compare(password, res.rows[0].password_hash);
            if (!isMatch) {
                throw new ApiError(400, "Incorrect password");
            }
        }
        await query(`DELETE FROM users WHERE id = $1`, [userId]);
        return { success: true, message: "Account deleted successfully" };
    }
}
