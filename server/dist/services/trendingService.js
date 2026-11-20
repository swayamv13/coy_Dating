"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrending = getTrending;
const connection_1 = require("../database/connection");
const conversationPrompts = [
    "What is a small thing that made your week better?",
    "What would your ideal low-key weekend look like?",
    "Which song always improves your mood?",
    "What is something you could talk about for hours?",
];
function getTrending() {
    const rows = connection_1.db.prepare(`
    SELECT s.swiper_user_id, s.target_user_id, p.interests
    FROM swipes s
    JOIN profiles p ON p.user_id = s.target_user_id
    WHERE s.action = 'like'
      AND s.created_at >= datetime('now', '-7 days')
  `).all();
    const activity = new Map();
    for (const row of rows) {
        const interests = JSON.parse(row.interests);
        for (const interest of interests) {
            const current = activity.get(interest) ?? {
                people: new Set(),
                likedProfiles: new Set(),
            };
            current.people.add(row.swiper_user_id);
            current.likedProfiles.add(row.target_user_id);
            activity.set(interest, current);
        }
    }
    const interests = [...activity.entries()]
        .filter(([, counts]) => counts.people.size >= 3 && counts.likedProfiles.size >= 3)
        .map(([name, counts]) => ({ name, likes: counts.likedProfiles.size }))
        .sort((left, right) => right.likes - left.likes || left.name.localeCompare(right.name))
        .slice(0, 8);
    return { interests, prompts: conversationPrompts, windowDays: 7 };
}
