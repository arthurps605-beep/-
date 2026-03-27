var app = {
    
    initialize: function() {
        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        } else {
            this.onDeviceReady();
        }
    },
    
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    
    receivedEvent: function(id) {
        /* Try direct game mode: ?level=ABC|XYZ|FSN|VED from menu app */
        var params = new URLSearchParams(window.location.search);
        var levelParam = params.get('level');
        if (levelParam && ['ABC','XYZ','FSN','VED'].indexOf(levelParam) !== -1) {
            window.GAME_DIRECT_LEVEL = levelParam;
            window.GAME_TIMER = 30;
            try { window.GAME_NICK = sessionStorage.getItem('gameNick') || 'Gracz'; } catch (e) { window.GAME_NICK = 'Gracz'; }
            var pc = document.getElementById("page-container");
            if (pc) pc.innerHTML = "";
            if (typeof init_game_direct === 'function') {
                init_game_direct();
            } else {
                init_app();
            }
            return;
        }

        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        
        /* Remove loading div. */
        document.getElementById("page-container").innerHTML = "";
        
        /* Load App */
        init_app();
    }
};

app.initialize();