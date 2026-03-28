(function () {
    'use strict';

    var ROUND_DURATION_SEC = 30;
    var BREAK_DURATION_SEC = 10;
    /* 1 poprawnie przeciągnięty przedmiot = 1 pkt; błędne upuszczenie = 0 pkt (bez kar). */
    var POINTS_CORRECT = 1;
    var POINTS_WRONG = 0;

    var currentNick = '';
    var currentSystem = null;
    var currentScore = 0;
    var timeLeft = ROUND_DURATION_SEC;
    var breakTimeLeft = BREAK_DURATION_SEC;
    var timerInterval = null;
    var currentItemIndex = 0;
    var roundItems = [];
    var currentRound = 0;
    var processingDrop = false;
    var ROUND_ORDER = ['ABC', 'XYZ', 'FSN', 'VED'];
    var ITEM_IMAGE_BASES = ['assets/subjekt/'];
    var BIN_IMAGE_BASES = ['assets/subjekt/bins/'];
    var gamePhase = 'round';
    var advanceAfterDropTimerId = null;

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
                { name: 'Навушники', correctCategory: 'B', imageFile: 'abc_b_headphones.webp' },
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
                { name: 'Дискета', correctCategory: 'N', imageFile: 'fsn_n.png' },
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
                { name: 'Косметика', correctCategory: 'D', imageFile: 'ved_d.png' },
                { name: 'Протеїн', correctCategory: 'D', imageFile: 'ved_d_protein.png' },
                { name: 'Крем для обличчя', correctCategory: 'D', imageFile: 'ved_d_facecream.png' },
                { name: 'Аромаолії', correctCategory: 'D', imageFile: 'ved_d_oils.png' }
            ]
        }
    };

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

    /**
     * Рівно один раз кожен рядок SYSTEMS[system].items (за індексом у масиві).
     * Без дедупу за файлом — інакше різні предмети з однаковою картинкою зникали б.
     */
    function buildRoundDeck(systemKey) {
        var pool = SYSTEMS[systemKey] && SYSTEMS[systemKey].items;
        if (!Array.isArray(pool)) return [];
        var deck = [];
        for (var i = 0; i < pool.length; i++) {
            var raw = pool[i];
            var f = String(raw.imageFile || '').trim();
            if (!f) {
                console.error('Missing image:', raw.name || '(item)');
                continue;
            }
            deck.push({
                slotIndex: i,
                name: raw.name,
                correctCategory: raw.correctCategory,
                imageFile: f
            });
        }
        return shuffleArray(deck);
    }

    function getCurrentItem() {
        if (!roundItems.length) return null;
        if (currentItemIndex < 0 || currentItemIndex >= roundItems.length) return null;
        return roundItems[currentItemIndex];
    }

    function clearGameTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function updateHud() {
        var shownTime = gamePhase === 'break' ? breakTimeLeft : timeLeft;
        $('#game-timer').text(String(Math.max(0, shownTime)));
        var isDanger = gamePhase === 'round' && shownTime <= 5;
        $('#game-timer').toggleClass('game-timer-danger', isDanger);
        $('#drop-zones .drop-zone').toggleClass('heartbeat', isDanger);
    }

    function endGame() {
        cancelAdvanceAfterDropTimer();
        processingDrop = false;
        clearGameTimer();
        try {
            sessionStorage.setItem('gameScore', String(currentScore));
            sessionStorage.setItem('gameNick', currentNick);
        } catch (e) {}
        $('#results-score').text('Punkty: ' + currentScore);
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        showScreen('screen-results');
        var nickTrim = String(currentNick || '').trim();
        var scoreInt = Math.max(0, Math.floor(Number(currentScore)) || 0);
        if (nickTrim && typeof persistInventoryLeaderboardScore === 'function') {
            persistInventoryLeaderboardScore(nickTrim, scoreInt);
        }
    }

    function loadCurrentRound() {
        currentSystem = ROUND_ORDER[currentRound];
        roundItems = buildRoundDeck(currentSystem);
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
                endGame();
                return;
            }
            startBreak();
            return;
        }
        renderCurrentItem();
    }

    function cancelAdvanceAfterDropTimer() {
        if (advanceAfterDropTimerId != null) {
            window.clearTimeout(advanceAfterDropTimerId);
            advanceAfterDropTimerId = null;
        }
    }

    /**
     * Один базовий шлях: src уже заданий у HTML — не перезаписуємо (без зайвого запиту/мигання).
     * Кілька шляхів: ланцюжок fallback як раніше.
     */
    function bindImageUrlChain($img, baseFolders, filename, logName) {
        var urls = [];
        for (var b = 0; b < baseFolders.length; b++) {
            urls.push(baseFolders[b] + filename);
        }
        if (urls.length === 1) {
            $img.off('error.itemImg').on('error.itemImg', function () {
                $img.off('error.itemImg');
                if (typeof console !== 'undefined' && console.error) {
                    console.error('Missing image:', logName);
                }
            });
            return;
        }
        var idx = 0;
        function onErr() {
            idx++;
            if (idx < urls.length) {
                $img.off('error.itemImg').on('error.itemImg', onErr);
                $img.attr('src', urls[idx]);
            } else {
                $img.off('error.itemImg');
                if (typeof console !== 'undefined' && console.error) {
                    console.error('Missing image:', logName);
                }
            }
        }
        $img.off('error.itemImg').on('error.itemImg', onErr);
        $img.attr('src', urls[0]);
    }

    /** Підвантажити кеш браузера для всіх картинок системи (предмети + баки). */
    function warmImagesForSystem(systemKey) {
        var sys = SYSTEMS[systemKey];
        if (!sys) return;
        var pool = sys.items;
        if (Array.isArray(pool)) {
            for (var i = 0; i < pool.length; i++) {
                var f = String(pool[i].imageFile || '').trim();
                if (!f) continue;
                var im = new Image();
                im.decoding = 'async';
                im.src = ITEM_IMAGE_BASES[0] + f;
            }
        }
        var bins = sys.bins;
        if (Array.isArray(bins)) {
            for (var j = 0; j < bins.length; j++) {
                var bf = binImageFilenameFor(systemKey, bins[j]);
                if (!bf) continue;
                var im2 = new Image();
                im2.decoding = 'async';
                im2.src = BIN_IMAGE_BASES[0] + bf;
            }
        }
    }

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
            var src = binFile ? escapeHtml(BIN_IMAGE_BASES[0] + binFile) : '';
            html += '<div class="drop-zone bin"';
            html += ' data-bin="' + letter + '"';
            html += ' data-category="' + letter + '"';
            html += ' role="button" aria-label="Category ' + letter + '">';
            if (src) {
                html +=
                    '<img class="drop-zone-bin-img" data-bin-img="' +
                    escapeHtml(binFile) +
                    '" src="' +
                    src +
                    '" alt="" draggable="false" decoding="async">';
            }
            html += '</div>';
        });
        $('#drop-zones').html(html);
        $('#drop-zones .drop-zone-bin-img').each(function () {
            var name = this.getAttribute('data-bin-img');
            if (!name) return;
            bindImageUrlChain($(this), BIN_IMAGE_BASES, name, name);
        });
    }

    function setDropTarget(binLetter) {
        $('#drop-zones .drop-zone').removeClass('is-target');
        if (!binLetter) return;
        $('#drop-zones .drop-zone[data-bin="' + binLetter + '"]').addClass('is-target');
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
        cancelAdvanceAfterDropTimer();
        processingDrop = false;
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('show ok bad').text('');

        var item = getCurrentItem();
        if (!item) return;

        var cat = item.correctCategory;
        var html = '';
        html += '<div class="item-card item-container" data-correct-category="' + cat + '">';
        html +=
            '<img class="item-image" src="' +
            escapeHtml(ITEM_IMAGE_BASES[0] + item.imageFile) +
            '" alt="" draggable="false" decoding="async" fetchpriority="high">';
        html += '</div>';

        $('#current-item-slot').html(html);

        var $card = $('#current-item-slot .item-card');
        var $img = $card.find('.item-image');
        bindImageUrlChain($img, ITEM_IMAGE_BASES, item.imageFile, item.imageFile);
        setupInteractImageDrag($card, $img);
    }

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
            setDropTarget(null);
        }

        function applyDrop(droppedBin) {
            if (processingDrop) return;
            processingDrop = true;
            var correctCat = $card.data('correctCategory');
            var ok = droppedBin === correctCat;

            if (ok) {
                currentScore += POINTS_CORRECT;
                $('#game-feedback').removeClass('bad').addClass('show ok').text('');
            } else {
                currentScore += POINTS_WRONG;
                $('#game-feedback').removeClass('ok').addClass('show bad').text('');
            }
            updateHud();

            resetDragVisual();
            $card.remove();
            destroyDraggableIfAny();

            cancelAdvanceAfterDropTimer();
            advanceAfterDropTimerId = window.setTimeout(function () {
                advanceAfterDropTimerId = null;
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
                    setDropTarget(findDropBinForImage(imgEl));
                },
                end: function () {
                    if (processingDrop) return;
                    var droppedBin = findDropBinForImage(imgEl);
                    setDropTarget(null);
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
        cancelAdvanceAfterDropTimer();
        processingDrop = false;
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        setDropTarget(null);
        $('#game-feedback').removeClass('ok bad').removeClass('show').text('');
        document.body.classList.add('break-mode');
        clearGameTimer();
        updateHud();
        var nextIdx = currentRound + 1;
        if (nextIdx < ROUND_ORDER.length) {
            warmImagesForSystem(ROUND_ORDER[nextIdx]);
        }
        timerInterval = window.setInterval(tickBreakTimer, 1000);
    }

    function startRound() {
        gamePhase = 'round';
        timeLeft = ROUND_DURATION_SEC;
        document.body.classList.remove('break-mode');
        loadCurrentRound();
        warmImagesForSystem(currentSystem);
        buildDropZones();
        renderCurrentItem();
        $('#game-feedback').removeClass('show ok bad').text('');
        clearGameTimer();
        updateHud();
        timerInterval = window.setInterval(tickRoundTimer, 1000);
    }

    function tickBreakTimer() {
        breakTimeLeft--;
        updateHud();
        if (breakTimeLeft <= 0) {
            clearGameTimer();
            currentRound++;
            startRound();
        }
    }

    function tickRoundTimer() {
        if (gamePhase !== 'round') return;
        if (currentItemIndex >= roundItems.length) {
            clearGameTimer();
            if (currentRound >= ROUND_ORDER.length - 1) {
                endGame();
            } else {
                startBreak();
            }
            return;
        }
        timeLeft--;
        updateHud();
        if (timeLeft > 0) return;
        clearGameTimer();
        cancelAdvanceAfterDropTimer();
        processingDrop = false;
        destroyDraggableIfAny();
        $('#current-item-slot').empty();
        $('#game-feedback').removeClass('ok bad').removeClass('show').text('');
        if (currentRound >= ROUND_ORDER.length - 1) {
            endGame();
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
            endGame();
        });
    }

    function initResultsScreen() {
        $('#btn-play-again').off('click').on('click', function () {
            showScreen('screen-start');
        });
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    $(function () {
        initStartScreen();
        initGameScreen();
        initResultsScreen();
        warmImagesForSystem(ROUND_ORDER[0]);
        window.setTimeout(function () {
            var r;
            for (r = 1; r < ROUND_ORDER.length; r++) {
                warmImagesForSystem(ROUND_ORDER[r]);
            }
        }, 500);
    });
})();
