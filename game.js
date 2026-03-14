/**
 * Gra klasyfikacji zapasów
 * Mechanika rozgrywki jak w oryginalnej grze: jeden przedmiot w kontenerze,
 * przeciąganie (jQuery UI), wykrywanie nakładania na kategorie (overlap),
 * punktacja, timer, pojawianie się kolejnego przedmiotu po upuszczeniu.
 * Kategorie to proste pudła z literami (A/B/C, X/Y/Z, F/S/N, V/E/D).
 */

(function () {
    'use strict';

    // --- Stałe (jak w oryginale: czas rundy, punkty za poprawną/błędną odpowiedź) ---
    var GAME_DURATION_SEC = 30;
    var POINTS_CORRECT = 1;
    var POINTS_WRONG = -1;
    var LEADERBOARD_KEY = 'inventoryGameLeaderboard';
    var LEADERBOARD_TOP = 10;

    // --- Stan gry (odpowiednik current_level_item_list, current_item_index, current_score, timer) ---
    var currentNick = '';
    var currentSystem = null;   // 'ABC' | 'XYZ' | 'FSN' | 'VED'
    var currentScore = 0;
    var timeLeft = GAME_DURATION_SEC;
    var timerInterval = null;
    var currentItemIndex = 0;
    var levelItems = [];        // lista przedmiotów na rundę (jak current_level_item_list)
    var ratio = 1;

    /**
     * Systemy klasyfikacji: każdy ma 3 kategorie (wyświetlane jako pudła z literą)
     * oraz listę placeholderowych przedmiotów do przeciągnięcia.
     */
    var SYSTEMS = {
        ABC: {
            bins: ['A', 'B', 'C'],
            items: [
                { name: 'Produkt A1', category: 'A' }, { name: 'Produkt A2', category: 'A' }, { name: 'Produkt A3', category: 'A' },
                { name: 'Produkt B1', category: 'B' }, { name: 'Produkt B2', category: 'B' }, { name: 'Produkt B3', category: 'B' },
                { name: 'Produkt C1', category: 'C' }, { name: 'Produkt C2', category: 'C' }, { name: 'Produkt C3', category: 'C' }
            ]
        },
        XYZ: {
            bins: ['X', 'Y', 'Z'],
            items: [
                { name: 'Produkt X1', category: 'X' }, { name: 'Produkt X2', category: 'X' }, { name: 'Produkt X3', category: 'X' },
                { name: 'Produkt Y1', category: 'Y' }, { name: 'Produkt Y2', category: 'Y' }, { name: 'Produkt Y3', category: 'Y' },
                { name: 'Produkt Z1', category: 'Z' }, { name: 'Produkt Z2', category: 'Z' }, { name: 'Produkt Z3', category: 'Z' }
            ]
        },
        FSN: {
            bins: ['F', 'S', 'N'],
            items: [
                { name: 'Produkt F1', category: 'F' }, { name: 'Produkt F2', category: 'F' }, { name: 'Produkt F3', category: 'F' },
                { name: 'Produkt S1', category: 'S' }, { name: 'Produkt S2', category: 'S' }, { name: 'Produkt S3', category: 'S' },
                { name: 'Produkt N1', category: 'N' }, { name: 'Produkt N2', category: 'N' }, { name: 'Produkt N3', category: 'N' }
            ]
        },
        VED: {
            bins: ['V', 'E', 'D'],
            items: [
                { name: 'Produkt V1', category: 'V' }, { name: 'Produkt V2', category: 'V' }, { name: 'Produkt V3', category: 'V' },
                { name: 'Produkt E1', category: 'E' }, { name: 'Produkt E2', category: 'E' }, { name: 'Produkt E3', category: 'E' },
                { name: 'Produkt D1', category: 'D' }, { name: 'Produkt D2', category: 'D' }, { name: 'Produkt D3', category: 'D' }
            ]
        }
    };

    // --- Nawigacja między ekranami ---
    function showScreen(screenId) {
        $('.screen').removeClass('active');
        $('#' + screenId).addClass('active');
    }

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i];
            a[i] = a[j];
            a[j] = t;
        }
        return a;
    }

    // --- Ekran startowy ---
    function initStartScreen() {
        $('#btn-start').off('click').on('click', function () {
            var nick = $('#nick-input').val().trim();
            if (!nick) {
                $('#nick-input').focus();
                return;
            }
            currentNick = nick;
            showScreen('screen-levels');
        });
    }

    // --- Wybór poziomu ---
    function initLevelScreen() {
        $('.btn-level').off('click').on('click', function () {
            currentSystem = $(this).data('system');
            startGame();
        });
    }

    /**
     * Start rundy: budowa kategorii (pudła z literami), pierwszy przedmiot w kontenerze,
     * timer odliczający, podpięcie przeciągania – jak w oryginalnej grze (load_level + startLevelTimer).
     */
    function startGame() {
        showScreen('screen-game');
        currentScore = 0;
        timeLeft = GAME_DURATION_SEC;
        currentItemIndex = 0;

        var sys = SYSTEMS[currentSystem];
        levelItems = shuffleArray(sys.items);

        $('#game-score').text('Punkty: ' + currentScore);
        $('#game-timer').text('Czas: ' + timeLeft);

        // Kategorie jako proste pudła z literą (odpowiednik bin-box + bin w oryginale)
        var binsHtml = '';
        sys.bins.forEach(function (binId) {
            binsHtml += '<div class="bin-box"><div class="bin" data-type="' + binId + '">' + binId + '</div></div>';
        });
        $('#bins-row').empty().append(binsHtml);

        // Jeden przedmiot w kontenerze (jak w oryginale: item-container + jeden .item)
        $('#items-area').empty();
        appendCurrentItem();

        // Timer: co 1 s, przy 0 koniec rundy (jak startLevelTimer w oryginale)
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function () {
            timeLeft--;
            $('#game-timer').text('Czas: ' + Math.max(0, timeLeft));
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                endGame();
            }
        }, 1000);

        attachDraggable();
    }

    /**
     * Pojawienie się kolejnego przedmiotu w kontenerze (jak w oryginale po check_answer).
     */
    function appendCurrentItem() {
        if (currentItemIndex >= levelItems.length) return;
        var it = levelItems[currentItemIndex];
        var el = $('<div class="item" data-type="' + it.category + '">' + it.name + '</div>');
        $('#items-area').append(el);
        attachDraggable();
    }

    /**
     * Przeciąganie i upuszczanie – bez zmian względem oryginału:
     * jQuery UI draggable, revert "invalid", w drag liczymy overlap z każdym .bin,
     * wybieramy bin z największym nakładaniem; w stop: check_answer, usunięcie elementu, następny przedmiot lub koniec rundy.
     * Działa z touch (jQuery UI Touch Punch).
     */
    function attachDraggable() {
        var selectedBin = null;
        var overlap = 0;

        $('.item').draggable({
            revert: 'invalid',
            revertDuration: 200,
            scroll: false,
            start: function () {
                $('.bin').addClass('bin-highlight');
            },
            drag: function (event, ui) {
                selectedBin = null;
                overlap = 0;
                var helper = ui.helper;
                var hLeft = helper.offset().left;
                var hTop = helper.offset().top;
                var hWidth = helper.outerWidth();
                var hHeight = helper.outerHeight();

                $('.bin').each(function () {
                    var bin = $(this);
                    var bLeft = bin.offset().left;
                    var bTop = bin.offset().top;
                    var bWidth = bin.outerWidth();
                    var bHeight = bin.outerHeight();

                    if (hLeft + hWidth < bLeft || bLeft + bWidth < hLeft ||
                        hTop + hHeight < bTop || bTop + bHeight < hTop) {
                        return;
                    }
                    var xStart = Math.max(hLeft, bLeft);
                    var xEnd = Math.min(hLeft + hWidth, bLeft + bWidth);
                    var yStart = Math.max(hTop, bTop);
                    var yEnd = Math.min(hTop + hHeight, bTop + bHeight);
                    var area = (xEnd - xStart) * (yEnd - yStart);
                    if (area > overlap) {
                        overlap = area;
                        selectedBin = bin;
                    }
                });

                try {
                    $(this).draggable('option', 'revert', !selectedBin);
                } catch (e) {}
            },
            stop: function (event, ui) {
                $('.bin').removeClass('bin-highlight');
                if (selectedBin) {
                    var itemType = ui.helper.data('type');
                    var binType = selectedBin.data('type');
                    checkAnswer(binType === itemType);
                    ui.helper.remove();
                    currentItemIndex++;
                    if (currentItemIndex >= levelItems.length) {
                        endGame();
                    } else {
                        appendCurrentItem();
                    }
                }
            }
        });
    }

    /**
     * Punktacja (jak addScore/minusScore w oryginale): poprawna +1, błędna -1.
     */
    function checkAnswer(correct) {
        if (correct) {
            currentScore += POINTS_CORRECT;
        } else {
            currentScore += POINTS_WRONG;
        }
        if (currentScore < 0) currentScore = 0;
        $('#game-score').text('Punkty: ' + currentScore);
    }

    function endGame() {
        $('.item').draggable('destroy');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        $('#results-score').text('Punkty: ' + currentScore);
        showScreen('screen-results');
    }

    // --- Ekran wyników ---
    function initResultsScreen() {
        $('#btn-leaderboard').off('click').on('click', function () {
            saveToLeaderboard();
            showLeaderboard();
        });
        $('#btn-play-again').off('click').on('click', function () {
            saveToLeaderboard();
            showScreen('screen-levels');
        });
    }

    /**
     * Leaderboard (ranking): przechowywanie w localStorage.
     * Klucz: LEADERBOARD_KEY. Wartość: tablica obiektów { nickname, score }.
     * Zapisujemy aktualny wynik, sortujemy po score malejąco, bierzemy top 10.
     */
    function saveToLeaderboard() {
        var list = getLeaderboardList();
        list.push({ nickname: currentNick, score: currentScore });
        list.sort(function (a, b) { return b.score - a.score; });
        list = list.slice(0, LEADERBOARD_TOP);
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function getLeaderboardList() {
        try {
            var raw = localStorage.getItem(LEADERBOARD_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function showLeaderboard() {
        var list = getLeaderboardList();
        var html = '';
        list.forEach(function (entry, i) {
            html += '<li><span class="rank">' + (i + 1) + '.</span><span class="name">' + escapeHtml(entry.nickname) + '</span><span class="score">' + entry.score + '</span></li>';
        });
        if (!html) html = '<li>Brak wyników</li>';
        $('#leaderboard-list').html(html);
        showScreen('screen-leaderboard');
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function initLeaderboardScreen() {
        $('#btn-back-start').off('click').on('click', function () {
            showScreen('screen-start');
        });
    }

    // --- Inicjalizacja przy starcie strony ---
    $(function () {
        initStartScreen();
        initLevelScreen();
        initResultsScreen();
        initLeaderboardScreen();
    });
})();
