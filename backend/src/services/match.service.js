import { query, withTransaction } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class MatchService {
    /**
     * Send a like to another user. If mutual, create match!
     */
    static async likeUser(likerId, likedId) {
        if (likerId === likedId) {
            throw new ApiError(400, "You cannot like yourself");
        }
        return await withTransaction(async (client) => {
            // 1. Insert like
            await client.query(`INSERT INTO likes (liker_id, liked_id)
         VALUES ($1, $2)
         ON CONFLICT (liker_id, liked_id) DO NOTHING`, [likerId, likedId]);
            // 2. Check if the other user has also liked this user
            const mutualRes = await client.query(`SELECT id FROM likes WHERE liker_id = $1 AND liked_id = $2`, [likedId, likerId]);
            const isMatch = mutualRes.rows.length > 0;
            if (isMatch) {
                // Calculate shared interests score
                const scoreRes = await client.query(`SELECT COUNT(*)
           FROM user_interests ui1
           INNER JOIN user_interests ui2 ON ui1.interest_id = ui2.interest_id
           WHERE ui1.user_id = $1 AND ui2.user_id = $2`, [likerId, likedId]);
                const shared = parseInt(scoreRes.rows[0].count, 10);
                const score = Math.min(100, Math.max(65, 60 + shared * 10));
                // Create match
                await client.query(`INSERT INTO matches (user1_id, user2_id, compatibility_score)
           VALUES ($1, $2, $3)
           ON CONFLICT (user1_id, user2_id) DO NOTHING`, [likerId, likedId, score]);
                // Notify both users
                const likerNameRes = await client.query(`SELECT full_name FROM users WHERE id = $1`, [likerId]);
                const likedNameRes = await client.query(`SELECT full_name FROM users WHERE id = $1`, [likedId]);
                const likerName = likerNameRes.rows[0]?.full_name || "Someone";
                const likedName = likedNameRes.rows[0]?.full_name || "Someone";
                await client.query(`INSERT INTO notifications (user_id, type, message, metadata)
           VALUES
           ($1, 'match', $2, $3),
           ($4, 'match', $5, $6)`, [
                    likerId,
                    `It's a Match! You and ${likedName} liked each other! 🎉`,
                    JSON.stringify({ otherUserId: likedId }),
                    likedId,
                    `It's a Match! You and ${likerName} liked each other! 🎉`,
                    JSON.stringify({ otherUserId: likerId }),
                ]);
                return { success: true, isMatch: true, compatibilityScore: score };
            }
            // Notify liked user about a new like
            await client.query(`INSERT INTO notifications (user_id, type, message)
         VALUES ($1, 'like', 'Someone liked your profile! Check discovery to see who.')`, [likedId]);
            return { success: true, isMatch: false };
        });
    }
    /**
     * Fetch all active matches for a user
     */
    static async getUserMatches(userId) {
        const res = await query(`SELECT m.id AS match_id, m.compatibility_score, m.created_at AS matched_at,
              u.id AS user_id, u.full_name,
              up.avatar, up.age, up.gender, up.location, up.occupation,
              pref.dating_intention,
              COALESCE(
                (SELECT ARRAY_AGG(i.name)
                 FROM user_interests ui
                 JOIN interests i ON i.id = ui.interest_id
                 WHERE ui.user_id = u.id),
                '{}'
              ) AS interests
       FROM matches m
       INNER JOIN users u ON (
         CASE
           WHEN m.user1_id = $1 THEN m.user2_id
           ELSE m.user1_id
         END = u.id
       )
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_preferences pref ON pref.user_id = u.id
       WHERE m.user1_id = $1 OR m.user2_id = $1
       ORDER BY m.created_at DESC`, [userId]);
        return res.rows.map((r) => ({
            matchId: r.match_id,
            compatibilityScore: r.compatibility_score,
            matchedAt: r.matched_at,
            user: {
                id: r.user_id,
                _id: r.user_id,
                fullName: r.full_name,
                avatar: r.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.user_id}`,
                profilePic: r.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.user_id}`,
                age: r.age,
                gender: r.gender,
                location: r.location,
                occupation: r.occupation,
                datingIntention: r.dating_intention,
                interests: r.interests || [],
            },
        }));
    }
}
