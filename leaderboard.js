/**
 * Ranking z CSV (to samo źródło co pubhtml, ale ?output=csv).
 * Sortowanie malejąco po punktach (nie jak kolejność wierszy w Google).
 */
(function () {
    'use strict';

    function parseCsvLine(line) {
        var result = [];
        var cur = '';
        var inQ = false;
        var i = 0;
        while (i < line.length) {
            var c = line.charAt(i);
            if (inQ) {
                if (c === '"') {
                    if (line.charAt(i + 1) === '"') {
                        cur += '"';
                        i += 2;
                        continue;
                    }
                    inQ = false;
                    i++;
                    continue;
                }
                cur += c;
                i++;
            } else {
                if (c === '"') {
                    inQ = true;
                    i++;
                } else if (c === ',') {
                    result.push(cur);
                    cur = '';
                    i++;
                } else {
                    cur += c;
                    i++;
                }
            }
        }
        result.push(cur);
        return result;
    }

    function normalizeCell(s) {
        return String(s || '')
            .replace(/^\ufeff/g, '')
            .replace(/^"|"$/g, '')
            .trim();
    }

    function isTimestampHeader(h) {
        h = String(h || '').toLowerCase();
        return (
            h.indexOf('час') !== -1 ||
            h.indexOf('позначк') !== -1 ||
            h.indexOf('timestamp') !== -1 ||
            h.indexOf('sygnatura') !== -1 ||
            h.indexOf('data i czas') !== -1 ||
            h.indexOf('time stamp') !== -1
        );
    }

    function findColumns(headers) {
        var nickIdx = -1;
        var scoreIdx = -1;
        var i;
        var h;
        var lower = [];
        for (i = 0; i < headers.length; i++) {
            lower[i] = normalizeCell(headers[i]).toLowerCase();
        }
        for (i = 0; i < headers.length; i++) {
            h = lower[i];
            if (h === 'score' || h === 'punkty' || h === 'wynik' || h === 'бал' || h === 'рахунок') {
                scoreIdx = i;
                break;
            }
        }
        if (scoreIdx < 0) {
            for (i = 0; i < headers.length; i++) {
                h = lower[i];
                if (h.indexOf('score') !== -1) {
                    scoreIdx = i;
                    break;
                }
            }
        }
        for (i = 0; i < headers.length; i++) {
            h = lower[i];
            if (h === 'nickname' || h === 'nick' || h === 'нік') {
                nickIdx = i;
                break;
            }
        }
        if (nickIdx < 0) {
            for (i = 0; i < headers.length; i++) {
                h = lower[i];
                if (h.indexOf('nick') !== -1 && h.indexOf('score') === -1) {
                    nickIdx = i;
                    break;
                }
            }
        }
        if (
            headers.length >= 3 &&
            isTimestampHeader(lower[0]) &&
            (nickIdx < 0 || scoreIdx < 0)
        ) {
            if (nickIdx < 0) nickIdx = 1;
            if (scoreIdx < 0) scoreIdx = 2;
        }
        return { nickIdx: nickIdx, scoreIdx: scoreIdx };
    }

    /** parseInt("28.03.2026…") === 28 — odrzucamy daty, bierzemy tylko czyste liczby. */
    function parseScoreCell(raw) {
        var s = normalizeCell(raw);
        if (!s) return NaN;
        if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/.test(s)) return NaN;
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return NaN;
        var n = Number(String(s).replace(',', '.').replace(/\s/g, ''));
        if (!isFinite(n)) return NaN;
        return Math.round(n);
    }

    function escapeHtml(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    function render(rows) {
        var ul = document.getElementById('lb-rows');
        var status = document.getElementById('lb-status');
        var head = document.getElementById('lb-table-head');
        if (!ul || !status) return;

        ul.innerHTML = '';
        if (!rows.length) {
            status.textContent = 'Brak wpisów.';
            ul.hidden = true;
            if (head) head.hidden = true;
            return;
        }

        status.textContent = '';
        ul.hidden = false;
        if (head) head.hidden = false;

        var i;
        for (i = 0; i < rows.length; i++) {
            var r = rows[i];
            var place = i + 1;
            var li = document.createElement('li');
            var cls = 'row';
            if (place === 1) cls += ' top1';
            else if (place === 2) cls += ' top2';
            else if (place === 3) cls += ' top3';
            li.className = cls;
            li.innerHTML =
                '<span class="lb-col-rank">' +
                place +
                '</span>' +
                '<span class="lb-col-player">' +
                escapeHtml(r.nick) +
                '</span>' +
                '<span class="lb-col-score">' +
                escapeHtml(String(r.score)) +
                '</span>';
            ul.appendChild(li);
        }
    }

    function responseLooksLikeHtml(text) {
        var s = String(text || '').trim().slice(0, 80);
        if (!s) return false;
        return /^<!doctype|^<html/i.test(s) || s.charAt(0) === '<';
    }

    function buildRanking(text) {
        if (responseLooksLikeHtml(text)) {
            throw new Error('html');
        }
        var lines = text.split(/\r?\n/).filter(function (ln) {
            return ln.length > 0;
        });
        if (!lines.length) return [];

        var headers = parseCsvLine(lines[0]);
        var col = findColumns(headers);
        if (col.nickIdx < 0 || col.scoreIdx < 0) {
            throw new Error('columns');
        }

        var out = [];
        var li;
        for (li = 1; li < lines.length; li++) {
            var cells = parseCsvLine(lines[li]);
            if (cells.length <= Math.max(col.nickIdx, col.scoreIdx)) continue;

            var nick = normalizeCell(cells[col.nickIdx]);
            if (!nick) continue;

            var score = parseScoreCell(cells[col.scoreIdx]);
            if (isNaN(score)) continue;

            out.push({ nick: nick, score: score });
        }

        out.sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return String(a.nick).localeCompare(String(b.nick), undefined, {
                sensitivity: 'base'
            });
        });

        return out;
    }

    function run() {
        var status = document.getElementById('lb-status');
        var ul = document.getElementById('lb-rows');
        if (!status || !ul) return;

        var cfg = typeof GOOGLE_FORM_CONFIG !== 'undefined' ? GOOGLE_FORM_CONFIG : null;
        var url = cfg && cfg.sheetPublishedCsvUrl ? String(cfg.sheetPublishedCsvUrl).trim() : '';

        if (!url) {
            status.textContent =
                'Brak adresu CSV: ustaw sheetPublishedCsvUrl w google-form-config.js (arkusz → Udostępnij → Publikuj w internecie → CSV).';
            ul.hidden = true;
            var h0 = document.getElementById('lb-table-head');
            if (h0) h0.hidden = true;
            return;
        }

        status.textContent = 'Ładowanie…';
        ul.hidden = true;
        var h1 = document.getElementById('lb-table-head');
        if (h1) h1.hidden = true;

        fetch(url, { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('http');
                return res.text();
            })
            .then(function (text) {
                try {
                    var rows = buildRanking(text);
                    render(rows);
                } catch (err) {
                    if (err && err.message === 'html') {
                        status.textContent =
                            'Google zwrócił stronę zamiast CSV — w arkuszu: Plik → Udostępnij → Publikuj w internecie i wybierz zakładkę z odpowiedziami formularza (nie pusty arkusz), potem odśwież link w google-form-config.js (gid w URL jak #gid=… przy edycji).';
                    } else {
                        status.textContent =
                            'Nie rozpoznano kolumn (potrzebne: Nickname i Score w CSV).';
                    }
                    ul.hidden = true;
                    var hx = document.getElementById('lb-table-head');
                    if (hx) hx.hidden = true;
                }
            })
            .catch(function () {
                status.textContent =
                    'Nie udało się wczytać rankingu (sprawdź publikację arkusza i adres CSV).';
                ul.hidden = true;
                var he = document.getElementById('lb-table-head');
                if (he) he.hidden = true;
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
