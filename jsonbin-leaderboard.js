/**
 * Global leaderboard via JSONBin (no localStorage).
 * Exposes: saveScore(name, score), fetchLeaderboardScores()
 */
(function (global) {
    'use strict';

    const BIN_ID = '69c6df5daa77b81da92848b0';
    /** Must be the Master Key from the same JSONBin account that owns this bin (Dashboard → API keys). */
    const API_KEY =
        '$2a$10$FjN7lXfLrZdPm0.X/Qx5UeHGeWDAjPQAGj2JH6cF5IuFcGW3D0k7C';

    const GET_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID + '/latest';
    const PUT_URL = 'https://api.jsonbin.io/v3/b/' + BIN_ID;

    /**
     * Fetch current bin, merge score, sort, trim top 10, PUT back.
     */
    async function saveScore(name, score) {
        try {
            var getRes = await fetch(GET_URL, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            var record = {};
            if (getRes.ok) {
                var data = await getRes.json();
                record = data && data.record ? data.record : {};
            } else if (getRes.status === 404) {
                record = {};
            } else {
                console.error('JSONBin GET failed', getRes.status, getRes.statusText);
                return;
            }
            var scores = record.scores;
            if (!Array.isArray(scores)) {
                scores = [];
            }
            scores.push({
                name: String(name || ''),
                score: Number(score) || 0,
                time: Date.now()
            });
            scores.sort(function (a, b) {
                return (b.score || 0) - (a.score || 0);
            });
            scores = scores.slice(0, 10);

            var putRes = await fetch(PUT_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify({ scores: scores })
            });
            if (!putRes.ok) {
                console.error('JSONBin PUT failed', putRes.status, putRes.statusText);
            }
        } catch (err) {
            console.error('saveScore failed', err);
        }
    }

    /**
     * Read-only fetch for leaderboard page; returns sorted scores (newest tie-break optional).
     */
    async function fetchLeaderboardScores() {
        try {
            var res = await fetch(GET_URL, {
                method: 'GET',
                headers: { 'X-Master-Key': API_KEY }
            });
            if (!res.ok) {
                if (res.status === 404) {
                    return [];
                }
                console.error('JSONBin GET (leaderboard) failed', res.status, res.statusText);
                return [];
            }
            var data = await res.json();
            var record = data && data.record ? data.record : {};
            var scores = record.scores;
            if (!Array.isArray(scores)) {
                return [];
            }
            var copy = scores.slice();
            copy.sort(function (a, b) {
                return (b.score || 0) - (a.score || 0);
            });
            return copy;
        } catch (err) {
            console.error('fetchLeaderboardScores failed', err);
            return [];
        }
    }

    global.saveScore = saveScore;
    global.fetchLeaderboardScores = fetchLeaderboardScores;
})(typeof window !== 'undefined' ? window : this);
