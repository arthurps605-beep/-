/**
 * Local-only leaderboard (same browser / origin as the game).
 * Key: inventoryGameLeaderboard — [{ nickname, score, date }]
 * One best score per player (name trim + lowercase); top 30.
 */
(function (global) {
    'use strict';

    var KEY = 'inventoryGameLeaderboard';

    function normalizeKey(name) {
        return String(name || '')
            .trim()
            .toLowerCase();
    }

    function readRaw() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function rowFromStored(row) {
        if (!row || typeof row !== 'object') return null;
        var nick = String(
            row.nickname != null ? row.nickname : row.name != null ? row.name : ''
        ).trim();
        if (!nick) return null;
        var sc = Math.max(0, Math.floor(Number(row.score)) || 0);
        var d = row.date;
        if (d == null && row.updatedAt != null) {
            try {
                d = new Date(Number(row.updatedAt)).toISOString();
            } catch (e2) {
                d = new Date().toISOString();
            }
        }
        if (d == null) d = new Date().toISOString();
        return { nickname: nick, score: sc, date: d };
    }

    function mergeUniqueBest(rows) {
        var map = Object.create(null);
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            if (!r) continue;
            var k = normalizeKey(r.nickname);
            if (!k) continue;
            var ex = map[k];
            if (!ex || r.score > ex.score) {
                map[k] = {
                    nickname: r.nickname,
                    score: r.score,
                    date: r.date
                };
            }
        }
        return Object.keys(map)
            .map(function (k) {
                return map[k];
            })
            .sort(function (a, b) {
                return b.score - a.score;
            })
            .slice(0, 30);
    }

    function writeRows(rows) {
        try {
            localStorage.setItem(KEY, JSON.stringify(rows));
        } catch (e) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('inventoryGameLeaderboard write failed', e);
            }
        }
    }

    /** Call after each finished game. */
    function persistInventoryLeaderboardScore(nickname, score) {
        var nick = String(nickname || '').trim();
        if (!nick) return;
        var sc = Math.max(0, Math.floor(Number(score)) || 0);
        var parsed = [];
        var raw = readRaw();
        for (var i = 0; i < raw.length; i++) {
            var row = rowFromStored(raw[i]);
            if (row) parsed.push(row);
        }
        parsed.push({
            nickname: nick,
            score: sc,
            date: new Date().toISOString()
        });
        writeRows(mergeUniqueBest(parsed));
    }

    global.persistInventoryLeaderboardScore = persistInventoryLeaderboardScore;
})(typeof window !== 'undefined' ? window : this);
