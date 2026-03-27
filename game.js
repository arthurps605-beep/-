/**
 * Gra klasyfikacji zapasów
 * Mechanika rozgrywki jak w oryginalnej grze: jeden przedmiot w kontenerze,
 * przeciąganie (jQuery UI), wykrywanie nakładania na kategorie (overlap),
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
    var activeDragCleanup = null;
    var ROUND_ORDER = ['ABC', 'XYZ', 'FSN', 'VED'];
    var ITEM_IMAGE_BASE_PATH = 'Aassets/Subjekt/';
    var gamePhase = 'round'; // 'round' | 'break'
    var DEBUG_RUN_ID = 'initial';

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

    function debugLog(hypothesisId, location, message, data) {
        fetch('http://127.0.0.1:7690/ingest/b15d2b29-a08a-4d27-8d0e-059981ff15e0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2f5fb7'},body:JSON.stringify({sessionId:'2f5fb7',runId:DEBUG_RUN_ID,hypothesisId:hypothesisId,location:location,message:message,data:data,timestamp:Date.now()})}).catch(function () {});
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

    function getUniqueRoundItems(items) {
        var seen = {};
        var unique = [];
        items.forEach(function (item) {
            var key = item.name + '|' + item.correctCategory + '|' + item.imageFile;
            if (!seen[key]) {
                seen[key] = true;
                unique.push(item);
            }
        });
        return unique;
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
        destroyDroppables();
        $('#current-item-slot').empty();
        showScreen('screen-results');
    }

    function loadCurrentRound() {
        currentSystem = ROUND_ORDER[currentRound];
        roundItems = shuffleArray(getUniqueRoundItems(SYSTEMS[currentSystem].items));
        currentItemIndex = 0;
        // #region agent log
        debugLog('H1-H4', 'game.js:loadCurrentRound', 'round data loaded', {
            currentRound: currentRound,
            currentSystem: currentSystem,
            itemCount: roundItems.length,
            firstItemFile: roundItems[0] ? roundItems[0].imageFile : null
        });
        // #endregion
    }

    function advanceAfterItem() {
        if (gamePhase !== 'round') return;
        currentItemIndex++;
        if (currentItemIndex >= roundItems.length) {
            destroyDraggableIfAny();
            destroyDroppables();
            $('#current-item-slot').empty();
            clearGameTimer();
            if (currentRound >= ROUND_ORDER.length - 1) {
                endGame('all-items-complete');
                return;
            }
            $('#game-feedback').removeClass('ok bad').addClass('show').text('Round completed.');
            startBreak();
            return;
        }
        renderCurrentItem();
    }

    function renderProgress() {
        $('#game-progress').text('Round ' + (currentRound + 1) + ' / 4');
    }

    function getItemImagePath(filename) {
        return ITEM_IMAGE_BASE_PATH + filename;
    }

    function getBinImagePath(systemId, letter) {
        return ITEM_IMAGE_BASE_PATH + systemId.toLowerCase() + '_' + letter.toLowerCase() + '.png';
    }

    function buildDropZones() {
        var bins = SYSTEMS[currentSystem].bins;
        var html = '';
        bins.forEach(function (letter) {
            var binPath = getBinImagePath(currentSystem, letter);
            html += '<img class="drop-zone"';
            html += ' data-bin="' + letter + '"';
            html += ' data-category="' + letter + '"';
            html += ' src="' + binPath + '"';
            html += ' alt="Category ' + letter + '"';
            html += ' draggable="false">';
        });
        $('#drop-zones').html(html);
        var $zones = $('#drop-zones .drop-zone');
        var firstZoneVisible = false;
        if ($zones.length) {
            var firstEl = $zones.get(0);
            var style = window.getComputedStyle(firstEl);
            firstZoneVisible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
        }
        // #region agent log
        debugLog('H2-H3', 'game.js:buildDropZones', 'bins rendered', {
            currentSystem: currentSystem,
            bins: bins,
            renderedCount: $zones.length,
            containerHtmlLength: $('#drop-zones').html().length,
            firstZoneVisible: firstZoneVisible
        });
        // #endregion
        $zones.on('error', function () {
            var src = this.currentSrc || this.src;
            var filename = src ? src.split('/').pop() : null;
            console.error('Failed to load image:', filename);
            // #region agent log
            debugLog('H1-H5', 'game.js:buildDropZones', 'bin image load error', {
                src: src,
                filename: filename
            });
            // #endregion
        });
    }

    function destroyDraggableIfAny() {
        if (activeDragCleanup) {
            activeDragCleanup();
            activeDragCleanup = null;
        }
    }

    function destroyDroppables() {
        // No-op: mobile-first custom touch/mouse drop detection is used.
    }

    function getEventPoint(event) {
        if (event.touches && event.touches.length) return event.touches[0];
        if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0];
        return event;
    }

    function bindMobileFirstDrag($img) {
        var el = $img.get(0);
        if (!el) return;
        var dragging = false;

        function getDropBinAt(clientX, clientY) {
            var bins = document.querySelectorAll('#drop-zones .drop-zone');
            for (var i = 0; i < bins.length; i++) {
                var rect = bins[i].getBoundingClientRect();
                if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
                    return bins[i].getAttribute('data-bin');
                }
            }
            return null;
        }

        function stopDragVisual() {
            el.style.position = '';
            el.style.left = '';
            el.style.top = '';
            el.style.transform = '';
            el.style.zIndex = '';
            el.style.pointerEvents = '';
        }

        function onMove(event) {
            if (!dragging || processingDrop) return;
            var point = getEventPoint(event);
            if (!point) return;
            event.preventDefault();
            el.style.position = 'fixed';
            el.style.left = point.clientX + 'px';
            el.style.top = point.clientY + 'px';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.zIndex = '220';
            el.style.pointerEvents = 'none';
        }

        function onEnd(event) {
            if (!dragging || processingDrop) return;
            dragging = false;
            var point = getEventPoint(event);
            var droppedBin = point ? getDropBinAt(point.clientX, point.clientY) : null;
            var correctCat = el.getAttribute('data-correct-category');
            if (!droppedBin) {
                stopDragVisual();
                return;
            }
            processingDrop = true;
            if (droppedBin === correctCat) currentScore += POINTS_CORRECT;
            else currentScore += POINTS_WRONG;
            updateHud();
            $img.remove();
            window.setTimeout(function () {
                processingDrop = false;
                advanceAfterItem();
            }, 120);
        }

        function onStart(event) {
            if (processingDrop) return;
            if (event.type === 'mousedown' && event.button !== 0) return;
            dragging = true;
            event.preventDefault();
        }

        el.addEventListener('touchstart', onStart, { passive: false });
        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd, { passive: false });
        el.addEventListener('touchcancel', onEnd, { passive: false });
        el.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        activeDragCleanup = function () {
            dragging = false;
            stopDragVisual();
            el.removeEventListener('touchstart', onStart);
            el.removeEventListener('touchmove', onMove);
            el.removeEventListener('touchend', onEnd);
            el.removeEventListener('touchcancel', onEnd);
            el.removeEventListener('mousedown', onStart);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
        };
    }

    function renderCurrentItem() {
        destroyDraggableIfAny();
        destroyDroppables();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('show ok bad').text('');

        if (!roundItems.length || currentItemIndex >= roundItems.length) {
            return;
        }

        var item = roundItems[currentItemIndex];
        var itemImagePath = getItemImagePath(item.imageFile);
        // #region agent log
        debugLog('H1-H5', 'game.js:renderCurrentItem', 'rendering item image', {
            itemName: item.name,
            imageFile: item.imageFile,
            imagePath: itemImagePath,
            category: item.correctCategory
        });
        // #endregion
        var html = '';
        html += '<img class="item-image item-draggable"';
        html += ' data-correct-category="' + item.correctCategory + '"';
        html += ' src="' + escapeHtml(itemImagePath) + '"';
        html += ' alt="' + escapeHtml(item.name) + '"';
        html += ' draggable="false">';

        $('#current-item-slot').html(html);

        var $img = $('#current-item-slot .item-image');
        $img.on('load', function () {
            // #region agent log
            debugLog('H1', 'game.js:renderCurrentItem', 'item image load success', {
                src: this.currentSrc || this.src,
                naturalWidth: this.naturalWidth,
                naturalHeight: this.naturalHeight
            });
            // #endregion
        });
        $img.on('error', function () {
            console.error('Failed to load image:', item.imageFile);
            // #region agent log
            debugLog('H1-H5', 'game.js:renderCurrentItem', 'item image load error', {
                imageFile: item.imageFile,
                src: this.currentSrc || this.src
            });
            // #endregion
        });
        bindMobileFirstDrag($img);
    }

    function startBreak() {
        gamePhase = 'break';
        breakTimeLeft = BREAK_DURATION_SEC;
        destroyDraggableIfAny();
        destroyDroppables();
        $('#current-item-slot').empty();
        clearGameTimer();
        updateHud();
        timerInterval = window.setInterval(tickBreakTimer, 1000);
    }

    function startRound() {
        gamePhase = 'round';
        timeLeft = ROUND_DURATION_SEC;
        loadCurrentRound();
        var bgProbe = new Image();
        bgProbe.onload = function () {
            // #region agent log
            debugLog('H1', 'game.js:startRound', 'background image load success', { src: 'Aassets/Subjekt/background.png' });
            // #endregion
        };
        bgProbe.onerror = function () {
            // #region agent log
            debugLog('H1-H5', 'game.js:startRound', 'background image load error', { src: 'Aassets/Subjekt/background.png' });
            // #endregion
        };
        bgProbe.src = 'Aassets/Subjekt/background.png';
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
        timeLeft--;
        updateHud();
        if (timeLeft <= 0) {
            if (currentItemIndex < roundItems.length) {
                timeLeft = ROUND_DURATION_SEC;
                updateHud();
                return;
            }
            clearGameTimer();
            if (currentRound >= ROUND_ORDER.length - 1) {
                endGame('all-rounds-time-complete');
                return;
            }
            startBreak();
        }
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
