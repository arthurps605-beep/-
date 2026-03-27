/**
 * Gra klasyfikacji zapasów
 * Mechanika rozgrywki jak w oryginalnej grze: jeden przedmiot w kontenerze,
 * przeciąganie (interact.js), wykrywanie nakładania na kategorie (overlap),
 * punktacja, timer, pojawianie się kolejnego przedmiotu po upuszczeniu.
 * Kategorie: ABC (wartość), XYZ (stabilność), FSN (ruch), VED (krytyczność).
 */

(function () {
    'use strict';

    // --- Stałe (jak w oryginale: czas rundy, punkty za poprawną/błędną odpowiedź) ---
    var ROUND_DURATION_SEC = 30;
    var BREAK_DURATION_SEC = 10;
    var POINTS_CORRECT = 1;
    var POINTS_WRONG = -1;
    var LEADERBOARD_KEY = 'inventoryGameLeaderboard';
    var LEADERBOARD_TOP = 10;

    // --- Stan gry (current_round_item_list, current_item_index, current_score, timer) ---
    var currentNick = '';
    var currentSystem = null;   // 'ABC' | 'XYZ' | 'FSN' | 'VED'
    var currentScore = 0;
    var timeLeft = ROUND_DURATION_SEC;
    var breakTimeLeft = BREAK_DURATION_SEC;
    var timerInterval = null;
    var currentItemIndex = 0;
    var roundItems = [];        // lista przedmiotów na rundę
    var ratio = 1;
    var currentRound = 0;
    var processingDrop = false;
    var ROUND_ORDER = ['ABC', 'XYZ', 'FSN', 'VED'];
    var ITEM_IMAGE_BASE_PATH = 'Aassets/Subjekt/';
    var gamePhase = 'round'; // 'round' | 'break'

    /**
     * ROUND 1 — ABC (VALUE): A wysoka, B średnia, C niska wartość.
     * ROUND 2 — XYZ (STABILITY): X stabilne, Y zmienne, Z nieprzewidywalne.
     * ROUND 3 — FSN (MOVEMENT): F szybki, S wolny, N bez ruchu.
     * ROUND 4 — VED (CRITICALITY): V kluczowe, E niezbędne, D pożądane.
     */
    var SYSTEMS = {
        ABC: {
            bins: ['A', 'B', 'C'],
            items: [
                { name: 'Айфон', correctCategory: 'A', imageFile: 'abc_a_iphone.png' },
                { name: 'Ігрова приставка', correctCategory: 'A', imageFile: 'abc_a_console.png' },
                { name: 'Ігровий комп’ютер', correctCategory: 'A', imageFile: 'abc_a_gamingpc.png' },
                { name: 'Телевізор', correctCategory: 'A', imageFile: 'abc_a_tv.png' },
                { name: 'Ноутбук', correctCategory: 'A', imageFile: 'abc_a_laptop.png' },
                { name: 'Планшет', correctCategory: 'B', imageFile: 'abc_b_tablet.png' },
                { name: 'Геймпад', correctCategory: 'B', imageFile: 'abc_b_controller.png' },
                { name: 'Принтер', correctCategory: 'B', imageFile: 'abc_b_printer.png' },
                { name: 'Навушники', correctCategory: 'B', imageFile: 'abc_b_headphones.png' },
                { name: 'Смарт-годинник', correctCategory: 'B', imageFile: 'abc_b_smartwatch.png' },
                { name: 'USB-кабель', correctCategory: 'C', imageFile: 'abc_c_usbcable.png' },
                { name: 'Мишка', correctCategory: 'C', imageFile: 'abc_c_mouse.png' },
                { name: 'Клавіатура', correctCategory: 'C', imageFile: 'abc_c_keyboard.png' },
                { name: 'Дротові навушники', correctCategory: 'C', imageFile: 'abc_c_earphones.png' },
                { name: 'Флешка', correctCategory: 'C', imageFile: 'abc_c_flashdrive.png' }
            ]
        },
        XYZ: {
            bins: ['X', 'Y', 'Z'],
            items: [
                { name: 'Хліб', correctCategory: 'X', imageFile: 'xyz_x_bread.png' },
                { name: 'Молоко', correctCategory: 'X', imageFile: 'xyz_x_milk.png' },
                { name: 'Вода', correctCategory: 'X', imageFile: 'xyz_x_water.png' },
                { name: 'Яйця', correctCategory: 'X', imageFile: 'xyz_x_eggs.png' },
                { name: 'Сіль', correctCategory: 'X', imageFile: 'xyz_x_salt.png' },
                { name: 'Морозиво', correctCategory: 'Y', imageFile: 'xyz_y_icecream.png' },
                { name: 'Гарбуз', correctCategory: 'Y', imageFile: 'xyz_y_pumpkin.png' },
                { name: 'Кавун', correctCategory: 'Y', imageFile: 'xyz_y_watermelon.png' },
                { name: 'Різдвяні солодощі', correctCategory: 'Y', imageFile: 'xyz_y_candy.png' },
                { name: 'Пляжний м’яч', correctCategory: 'Y', imageFile: 'xyz_y_beachball.png' },
                { name: 'Рамен', correctCategory: 'Z', imageFile: 'xyz_z_ramen.png' },
                { name: 'Bubble tea', correctCategory: 'Z', imageFile: 'xyz_z_bubbletea.png' },
                { name: 'Дивні цукерки', correctCategory: 'Z', imageFile: 'xyz_z_weirdcandy.png' },
                { name: 'Яскравий напій', correctCategory: 'Z', imageFile: 'xyz_z_soda.png' },
                { name: 'Дубайський шоколад', correctCategory: 'Z', imageFile: 'xyz_z_luxurychocolate.png' }
            ]
        },
        FSN: {
            bins: ['F', 'S', 'N'],
            items: [
                { name: 'Хліб', correctCategory: 'F', imageFile: 'fsn_f_bread.png' },
                { name: 'Молоко', correctCategory: 'F', imageFile: 'fsn_f_milk.png' },
                { name: 'Вода', correctCategory: 'F', imageFile: 'fsn_f_water.png' },
                { name: 'Туалетний папір', correctCategory: 'F', imageFile: 'fsn_f_toiletpaper.png' },
                { name: 'Мило', correctCategory: 'F', imageFile: 'fsn_f_soap.png' },
                { name: 'Рюкзак', correctCategory: 'S', imageFile: 'fsn_s_backpack.png' },
                { name: 'Куртка', correctCategory: 'S', imageFile: 'fsn_s_jacket.png' },
                { name: 'Лампа', correctCategory: 'S', imageFile: 'fsn_s_lamp.png' },
                { name: 'Стілець', correctCategory: 'S', imageFile: 'fsn_s_chair.png' },
                { name: 'Блендер', correctCategory: 'S', imageFile: 'fsn_s_blender.png' },
                { name: 'Дискета', correctCategory: 'N', imageFile: 'fsn_n_floppy.png' },
                { name: 'VHS-касета', correctCategory: 'N', imageFile: 'fsn_n_vhs.png' },
                { name: 'DVD-диск', correctCategory: 'N', imageFile: 'fsn_n_dvd.png' },
                { name: 'Стаціонарний телефон', correctCategory: 'N', imageFile: 'fsn_n_landline.png' },
                { name: 'VR-окуляри', correctCategory: 'N', imageFile: 'fsn_n_vr.png' }
            ]
        },
        VED: {
            bins: ['V', 'E', 'D'],
            items: [
                { name: 'Дефібрилятор', correctCategory: 'V', imageFile: 'ved_v_defibrillator.png' },
                { name: 'Апарат ШВЛ', correctCategory: 'V', imageFile: 'ved_v_ventilator.png' },
                { name: 'Киснева маска', correctCategory: 'V', imageFile: 'ved_v_oxygenmask.png' },
                { name: 'Хірургічні інструменти', correctCategory: 'V', imageFile: 'ved_v_surgicaltools.png' },
                { name: 'Аптечка', correctCategory: 'V', imageFile: 'ved_v_firstaid.png' },
                { name: 'Антибіотики', correctCategory: 'E', imageFile: 'ved_e_antibiotics.png' },
                { name: 'Шприц', correctCategory: 'E', imageFile: 'ved_e_syringe.png' },
                { name: 'Бинти', correctCategory: 'E', imageFile: 'ved_e_bandage.png' },
                { name: 'Медичні рукавички', correctCategory: 'E', imageFile: 'ved_e_gloves.png' },
                { name: 'Термометр', correctCategory: 'E', imageFile: 'ved_e_thermometer.png' },
                { name: 'Вітаміни', correctCategory: 'D', imageFile: 'ved_d_vitamins.png' },
                { name: 'Косметика', correctCategory: 'D', imageFile: 'ved_d_cosmetics.png' },
                { name: 'Протеїн', correctCategory: 'D', imageFile: 'ved_d_protein.png' },
                { name: 'Крем для обличчя', correctCategory: 'D', imageFile: 'ved_d_facecream.png' },
                { name: 'Аромаолії', correctCategory: 'D', imageFile: 'ved_d_oils.png' }
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

    function clearGameTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateHud() {
        if (gamePhase === 'break') {
            $('#timer-label').text('Break');
            $('#game-timer').text(String(breakTimeLeft));
        } else {
            $('#timer-label').text('Round');
            $('#game-timer').text(String(timeLeft));
        }
        $('#game-score').text(String(currentScore));
    }

    function endGame(reason) {
        clearGameTimer();
        try {
            sessionStorage.setItem('gameScore', String(currentScore));
            sessionStorage.setItem('gameNick', currentNick);
            if (currentSystem) sessionStorage.setItem('gameRoundSystem', currentSystem);
        } catch (e) {}
        $('#results-score').text('Punkty: ' + currentScore);
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        showScreen('screen-results');
    }

    function loadCurrentRound() {
        currentSystem = ROUND_ORDER[currentRound];
        roundItems = shuffleArray(SYSTEMS[currentSystem].items);
        currentItemIndex = 0;
    }

    function advanceAfterItem() {
        if (gamePhase !== 'round') return;
        currentItemIndex++;
        if (currentItemIndex >= roundItems.length) {
            destroyDraggableIfAny();
            $('#current-item-slot').empty();
            clearGameTimer();
            if (currentRound >= ROUND_ORDER.length - 1) {
                endGame('all-items-complete');
                return;
            }
            startBreak();
            return;
        }
        renderProgress();
        renderCurrentItem();
    }

    function renderProgress() {
        var total = roundItems.length;
        var pos = Math.min(currentItemIndex + 1, total);
        if (gamePhase === 'break') {
            $('#game-progress').text('Break time · Next round in ' + breakTimeLeft + 's');
            return;
        }
        $('#game-progress').text('Round ' + (currentRound + 1) + ' / 4 · Przedmiot ' + pos + ' / ' + total);
    }

    function getItemImagePath(filename) {
        return ITEM_IMAGE_BASE_PATH + filename;
    }

    /** Bin header images: Aassets/Subjekt/[file].png per system + letter */
    function binImageFilenameFor(system, letter) {
        var map = {
            ABC: { A: 'abc_a.png', B: 'abc_b.png', C: 'abc_c.png' },
            XYZ: { X: 'xyz_x.png', Y: 'xyz_y.png', Z: 'xyz_z.png' },
            FSN: { F: 'fsn_f.png', S: 'fsn_s.png', N: 'fsn_n.png' },
            VED: { V: 'ved_v.png', E: 'ved_e.png', D: 'ved_d.png' }
        };
        return map[system] && map[system][letter] ? map[system][letter] : '';
    }

    function buildDropZones() {
        var bins = SYSTEMS[currentSystem].bins;
        var html = '';
        bins.forEach(function (letter) {
            var binFile = binImageFilenameFor(currentSystem, letter);
            var src = binFile ? escapeHtml(getItemImagePath(binFile)) : '';
            html += '<div class="drop-zone bin"';
            html += ' data-bin="' + letter + '"';
            html += ' data-category="' + letter + '"';
            html += ' role="button" aria-label="Category ' + letter + '">';
            if (src) {
                html += '<img class="drop-zone-bin-img" src="' + src + '" alt="" draggable="false">';
            }
            html += '</div>';
        });
        $('#drop-zones').html(html);
    }

    function destroyDraggableIfAny() {
        var imgEl = document.querySelector('#current-item-slot .item-image');
        if (imgEl && typeof interact !== 'undefined') {
            try {
                interact(imgEl).unset();
            } catch (e) {}
        }
    }

    function rectOverlapArea(a, b) {
        var x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        var y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        return x * y;
    }

    /** Drop: center of image under bins (elementFromPoint), fallback to rect overlap — more reliable on mobile. */
    function findDropBinForImage(imgEl) {
        var ir = imgEl.getBoundingClientRect();
        if (ir.width < 1 || ir.height < 1) return null;
        var cx = ir.left + ir.width / 2;
        var cy = ir.top + ir.height / 2;
        var prev = imgEl.style.pointerEvents;
        imgEl.style.pointerEvents = 'none';
        var hit = document.elementFromPoint(cx, cy);
        imgEl.style.pointerEvents = prev;
        if (hit) {
            var z = $(hit).closest('.drop-zone');
            if (z.length) return z.data('bin');
        }
        var bestArea = 0;
        var bestBin = null;
        $('#drop-zones .drop-zone').each(function () {
            var zr = this.getBoundingClientRect();
            var area = rectOverlapArea(ir, zr);
            if (area > bestArea) {
                bestArea = area;
                bestBin = $(this).data('bin');
            }
        });
        return bestArea > 0 ? bestBin : null;
    }

    function renderCurrentItem() {
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('show ok bad').text('');

        if (!roundItems.length || currentItemIndex >= roundItems.length) {
            return;
        }

        var item = roundItems[currentItemIndex];
        var cat = item.correctCategory;
        var html = '';
        html += '<div class="item-card item-container" data-correct-category="' + cat + '">';
        html += '<img class="item-image" src="' + escapeHtml(getItemImagePath(item.imageFile)) + '" alt="" draggable="false">';
        html += '</div>';

        $('#current-item-slot').html(html);

        var $card = $('#current-item-slot .item-card');
        var $img = $card.find('.item-image');
        $img.on('error', function () {
            console.error('Failed to load image:', item.imageFile);
        });
        setupInteractImageDrag($card, $img);
    }

    /**
     * Drag: ONLY interact.js — local translate state; unset before bind to avoid double listeners.
     */
    function setupInteractImageDrag($card, $img) {
        if (typeof interact === 'undefined') {
            console.error('interact.js is required for drag');
            return;
        }

        var imgEl = $img[0];
        var dragX = 0;
        var dragY = 0;

        imgEl.style.transform = '';

        try {
            interact(imgEl).unset();
        } catch (e) {}

        function resetDragVisual() {
            dragX = 0;
            dragY = 0;
            imgEl.style.transform = '';
            imgEl.style.zIndex = '';
        }

        function applyDrop(droppedBin) {
            if (processingDrop) return;
            processingDrop = true;
            var correctCat = $card.data('correctCategory');
            var ok = droppedBin === correctCat;

            if (ok) {
                currentScore += POINTS_CORRECT;
                $('#game-feedback').removeClass('bad').addClass('show ok').text('Dobrze!');
            } else {
                currentScore += POINTS_WRONG;
                $('#game-feedback').removeClass('ok').addClass('show bad').text('Spróbuj ponownie – to nie ta kategoria.');
            }
            updateHud();

            resetDragVisual();
            destroyDraggableIfAny();
            $card.remove();

            window.setTimeout(function () {
                processingDrop = false;
                advanceAfterItem();
            }, 550);
        }

        interact(imgEl).draggable({
            autoScroll: false,
            inertia: false,
            listeners: {
                start: function () {
                    if (processingDrop) return;
                    imgEl.style.zIndex = '10000';
                },
                move: function (event) {
                    dragX += event.dx;
                    dragY += event.dy;
                    event.target.style.transform =
                        'translate(' + dragX + 'px, ' + dragY + 'px)';
                },
                end: function () {
                    if (processingDrop) return;
                    var droppedBin = findDropBinForImage(imgEl);
                    if (droppedBin != null) {
                        applyDrop(droppedBin);
                    } else {
                        resetDragVisual();
                    }
                }
            }
        });
    }

    function startBreak() {
        gamePhase = 'break';
        breakTimeLeft = BREAK_DURATION_SEC;
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('ok bad').addClass('show').text('Next round starting...');
        clearGameTimer();
        updateHud();
        renderProgress();
        timerInterval = window.setInterval(tickBreakTimer, 1000);
    }

    function startRound() {
        gamePhase = 'round';
        timeLeft = ROUND_DURATION_SEC;
        loadCurrentRound();
        buildDropZones();
        renderCurrentItem();
        $('#game-feedback').removeClass('show ok bad').text('');
        clearGameTimer();
        updateHud();
        renderProgress();
        timerInterval = window.setInterval(tickRoundTimer, 1000);
    }

    function tickBreakTimer() {
        breakTimeLeft--;
        updateHud();
        renderProgress();
        if (breakTimeLeft <= 0) {
            clearGameTimer();
            currentRound++;
            startRound();
        }
    }

    function tickRoundTimer() {
        if (gamePhase !== 'round') return;
        timeLeft--;
        updateHud();
        if (timeLeft > 0) return;
        clearGameTimer();
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('ok bad').addClass('show').text('Czas rundy.');
        if (currentRound >= ROUND_ORDER.length - 1) {
            endGame('all-rounds-time-complete');
            return;
        }
        startBreak();
    }

    function startGame() {
        clearGameTimer();
        currentScore = 0;
        timeLeft = ROUND_DURATION_SEC;
        currentItemIndex = 0;
        currentRound = 0;
        gamePhase = 'round';
        breakTimeLeft = BREAK_DURATION_SEC;
        showScreen('screen-game');
        startRound();
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
            startGame();
        });
    }

    function initGameScreen() {
        $('#btn-quit-game').off('click').on('click', function () {
            endGame('manual-quit');
        });
    }

    /** Po powrocie z gry: pokaż wyniki i ustaw currentScore/currentNick */
    function applyReturnFromGame() {
        var params = new URLSearchParams(window.location.search);
        if (params.get('from') !== 'game') return;
        var score = params.get('score');
        if (score !== null && score !== '') currentScore = parseInt(score, 10) || 0;
        else {
            try { var s = sessionStorage.getItem('gameScore'); if (s != null) currentScore = parseInt(s, 10) || 0; } catch (e) {}
        }
        try {
            var nick = sessionStorage.getItem('gameNick');
            if (nick) currentNick = nick;
        } catch (e) {}
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
            showScreen('screen-start');
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
        applyReturnFromGame(); // jeśli wróciliśmy z game-original (from=game)
        initStartScreen();
        initGameScreen();
        initResultsScreen();
        initLeaderboardScreen();
    });
})();
