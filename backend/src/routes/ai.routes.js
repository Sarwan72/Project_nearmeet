import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";
import { protectVendorRoute } from "../middleware/vendor.middleware.js";
import { BookingService } from "../services/booking.service.js";
const router = Router();
const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
const client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = client ? client.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
router.post("/ask", async (req, res) => {
    try {
        const { message } = req.body;
        if (!model) {
            res.status(503).json({ error: "Gemini AI is not configured" });
            return;
        }
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: message }] }],
        });
        const reply = result.response.text() ||
            result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Unable to parse response";
        res.json({ reply });
    }
    catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Failed to generate AI response" });
    }
});
/**
 * AI Vendor Pair Recommendation
 * Analyzes unpaired checked-in guests at the vendor's hotel and recommends the ideal table pair
 */
router.post("/vendor/recommend-pair", protectVendorRoute, async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const guests = await BookingService.getPairableGuests(vendorId);
        // Filter to guests that are not yet paired
        const unpaired = guests.filter((g) => g.pairStatus !== "paired");
        if (unpaired.length < 2) {
            res.status(200).json({
                success: true,
                recommendation: null,
                message: "Need at least 2 unpaired guests with bookings to generate AI table pairing."
            });
            return;
        }
        // Try Gemini AI first if configured
        if (model) {
            try {
                const guestSummaries = unpaired.slice(0, 10).map((g) => ({
                    bookingId: g.bookingId,
                    userId: g.id,
                    name: g.fullName,
                    age: g.age,
                    gender: g.gender,
                    occupation: g.occupation,
                    bio: g.bio,
                    datingIntention: g.datingIntention,
                    interests: g.interests,
                }));
                const prompt = `You are an expert AI matchmaker for an upscale venue called "${req.vendor.hotel_name || "NearMeet Partner Venue"}".
Evaluate these booked guests for an engaging offline table meetup:
${JSON.stringify(guestSummaries, null, 2)}

Pick the best pair of 2 distinct guests who would have the most compatible, respectful, and interesting in-person conversation.
Return a STRICT JSON object only (no markdown, no backticks, just raw json):
{
  "guest1": { "bookingId": string, "userId": string, "name": string },
  "guest2": { "bookingId": string, "userId": string, "name": string },
  "compatibilityScore": number (75-99),
  "sharedInterests": string[],
  "matchReason": string (2 sentences explaining why they are a great match),
  "icebreaker": string (a natural, fun icebreaker question for their table),
  "tableSuggestion": string (e.g. "Table #4 - Window Alcove")
}`;
                const geminiRes = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                });
                const rawText = geminiRes.response.text();
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    // Attach full guest info for frontend rendering
                    const g1 = unpaired.find((u) => u.bookingId === parsed.guest1?.bookingId || u.id === parsed.guest1?.userId) || unpaired[0];
                    const g2 = unpaired.find((u) => u.bookingId === parsed.guest2?.bookingId || u.id === parsed.guest2?.userId) || unpaired[1];
                    res.status(200).json({
                        success: true,
                        source: "gemini",
                        recommendation: {
                            ...parsed,
                            guest1: { ...g1, bookingId: g1.bookingId, userId: g1.id, name: g1.fullName },
                            guest2: { ...g2, bookingId: g2.bookingId, userId: g2.id, name: g2.fullName },
                        }
                    });
                    return;
                }
            }
            catch (geminiErr) {
                console.warn("Gemini matchmaking unavailable, using intelligent heuristic algorithm:", geminiErr.message);
            }
        }
        // Heuristic Matching Algorithm (Always works reliably)
        let bestPair = null;
        let highestScore = -1;
        for (let i = 0; i < unpaired.length; i++) {
            for (let j = i + 1; j < unpaired.length; j++) {
                const g1 = unpaired[i];
                const g2 = unpaired[j];
                const g1Interests = Array.isArray(g1.interests) ? g1.interests : [];
                const g2Interests = Array.isArray(g2.interests) ? g2.interests : [];
                const shared = g1Interests.filter((item) => g2Interests.includes(item));
                let score = 75;
                score += Math.min(shared.length * 6, 18);
                if (g1.datingIntention && g2.datingIntention && g1.datingIntention === g2.datingIntention) {
                    score += 8;
                }
                if (g1.age && g2.age) {
                    const ageDiff = Math.abs(Number(g1.age) - Number(g2.age));
                    if (ageDiff <= 3)
                        score += 6;
                    else if (ageDiff <= 6)
                        score += 3;
                }
                score = Math.min(score, 98);
                if (score > highestScore) {
                    highestScore = score;
                    const tables = ["Table #3 (Garden View)", "Table #5 (Candlelight Lounge)", "Table #2 (Window Alcove)", "Table #8 (Cozy Booth)"];
                    const tableSuggestion = tables[(i + j) % tables.length];
                    const sharedDesc = shared.length > 0
                        ? `Both share strong passions in ${shared.slice(0, 3).join(", ")}.`
                        : `Both appreciate genuine face-to-face conversations and exploratory dining.`;
                    bestPair = {
                        guest1: { ...g1, bookingId: g1.bookingId, userId: g1.id, name: g1.fullName },
                        guest2: { ...g2, bookingId: g2.bookingId, userId: g2.id, name: g2.fullName },
                        compatibilityScore: score,
                        sharedInterests: shared,
                        matchReason: `${sharedDesc} Their age and lifestyle alignment make them great candidates for an unforgettable offline meetup.`,
                        icebreaker: shared.length > 0
                            ? `Ask each other: "What first sparked your interest in ${shared[0]}, and what's your favorite story around it?"`
                            : `Ask each other: "What's the best hidden spot or dish you have tried in this city recently?"`,
                        tableSuggestion,
                    };
                }
            }
        }
        res.status(200).json({
            success: true,
            source: "algorithmic",
            recommendation: bestPair,
        });
    }
    catch (err) {
        console.error("Vendor AI recommendation error:", err);
        res.status(500).json({ success: false, message: "Failed to generate AI pair recommendation" });
    }
});
export default router;
