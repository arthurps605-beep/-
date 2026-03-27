var frame_width         = 1920; /* Standard width */
var frame_height        = 1080; /* Standard height */
var ratio               = 1;    /* Current ratio */
var idle_second         = 300;
var current_idle        = 0;
var current_function    = "";
var toastTimer;
var max_level           = 2; /* Max 3 rounds. 0 based index. */
var level_score         = [0,0,0]; /* 3 Rounds */
var timer_running       = true;

var current_level               = 0;
var current_score               = 0;
var current_user_name           = "";
var current_gender              = "female";
var current_level_item_list     = []; /* Array of items */
var current_item_index          = 0;
var current_time_limit          = 60;
var current_point_correct       = 5;
var current_point_incorrect     = 1;
var current_level_timer;

function init_app(){
    
    $(function(){
        
        calculateRatio();
        
        /* Transform scale for different screen resolution. */
        $('#container').css('transform', 'scale(' + ratio + ')');
        
        init_idle_timeout();
        init_home_page();
        
        $("#audio-player").on("play", function(){
            $("#audio-player").hide();
        });
    });
}

/* Direct game from menu app: ?level=ABC|XYZ|FSN|VED — skip intro, one round, 30s, then return to menu */
function init_game_direct(){
    $(function(){
        calculateRatio();
        $('#container').css('transform', 'scale(' + ratio + ')');
        clearPage();
        changeBackground("./assets/images/Background-Intro.png");
        $("#page-container").append("<div id='navigate-container'></div>");

        var letters = { ABC: ['A','B','C'], XYZ: ['X','Y','Z'], FSN: ['F','S','N'], VED: ['V','E','D'] }[window.GAME_DIRECT_LEVEL] || ['A','B','C'];
        var orig = ['Paper','Plastic','Metal'];
        for (var i = 0; i < letters.length; i++) {
            items[letters[i]] = items[orig[i]];
        }
        levels = { 0: { type: letters, time_limit: window.GAME_TIMER || 30, item_count: 12, item_count_multiplier: 1, point_correct: 1, point_incorrect: 1 } };
        max_level = 0;
        current_level = 0;
        level_score = [0];
        current_user_name = window.GAME_NICK || 'Gracz';

        var r = [], j = -1;
        r[++j] = "<div class='parachute-container'>";
        r[++j] = "<div class='parachute-orange-container'><div class='parachute-orange'><img class='tile-thumbnail' src='./assets/images/Parachute-Orange.png'/></div><div class='parachute-score'>000</div></div>";
        r[++j] = "<div class='parachute-red'><img class='tile-thumbnail' src='./assets/images/Parachute-Red.png'/></div>";
        r[++j] = "<div class='parachute-blue'><img class='tile-thumbnail' src='./assets/images/Parachute-Blue.png'/></div>";
        r[++j] = "</div>";
        r[++j] = "<div class='timer-container timer-container-show-animation'><div class='timer'><img class='tile-thumbnail' src='./assets/images/Timer.png'/></div><div class='time-0 timer-digit' data-digit='0'><div class='content'>0</div></div><div class='time-1 timer-digit' data-digit='0'><div class='content'>0</div></div><div class='time-2 timer-digit' data-digit='3'><div class='content'>3</div></div><div class='time-3 timer-digit' data-digit='0'><div class='content'>0</div></div></div>";
        r[++j] = "<div class='home-button home-button-top'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
        $("#navigate-container").append(r.join(""));

        $(".home-button").click(function(event){
            $(this).off("click");
            try { sessionStorage.setItem('gameScore', current_score); } catch(e){}
            window.location.href = '../index.html?from=game';
        });

        load_level();
    });
}

function init_home_page(){
    
    clearPage();
    clearToastTimer();
    resetScore();
    changeBackground("./assets/images/Background-Intro.png");
    current_function = "init_home_page";
    current_user_name = "";
    current_gender = "female";
    current_level = 0;
    
    /* Music */
    playMusic("Mr_Turtle.mp3");
    
    window.scrollTo(0,0); /* In case bottom force scroll down. */
   
    /* Stop Timer */
    clearInterval(current_level_timer);
    
    /* Marina Bay Buildings */
    var r = new Array(), j = -1;
    
    /* Top Box - Start */
    r[++j] = "<div class='top-box'>";
    
    /* Flyer*/
    r[++j] = "<div class='flyer-container'>";
    r[++j] =    "<div class='flyer-wheel'><img class='tile-thumbnail' src='./assets/images/Flyer-Wheel-Top.png'/></div>";
    r[++j] =    "<div class='flyer-base'><img class='tile-thumbnail' src='./assets/images/Flyer-Base-Top.png'/></div>";
    
    /* Flyer Cabin */
    for(var i = 0; i < 24; i++){
        r[++j] =    "<div class='flyer-cabin' style='animation-delay: -" + (i * 2) + "s'><img class='tile-thumbnail' src='./assets/images/Flyer-Cabin-Top.png'/></div>";
    }
    
    r[++j] = "</div>";
    
    /* Hotel */
    r[++j] =    "<div class='hotel'><img class='tile-thumbnail' src='./assets/images/Hotel-Top.png'/></div>";
   
    /* Garden */
    r[++j] =    "<div class='garden'><img class='tile-thumbnail' src='./assets/images/Garden-Top.png'/></div>";
   
    /* Museum */
    r[++j] =    "<div class='museum'><img class='tile-thumbnail' src='./assets/images/Museum-Top.png'/></div>";
   
    /* Tree */
    r[++j] =    "<div class='tree'><img class='tile-thumbnail' src='./assets/images/Tree-Top.png'/></div>";  
    
    /* Top Box - End */
    
    r[++j] = "</div>";
    
    /* Small Trees */
    r[++j] =    "<div class='small-trees'><img class='tile-thumbnail' src='./assets/images/Small-Trees.png'/></div>";
    
    /* Reflection Box - Start */
    r[++j] =    "<div class='reflection-box'>";
    
    /* Reflection - Flyer */
    r[++j] =        "<div class='flyer-container-reflection'>";
    r[++j] =            "<div class='flyer-wheel-reflection'><img class='tile-thumbnail' src='./assets/images/Flyer-Wheel-Bottom.png'/></div>";
    r[++j] =            "<div class='flyer-base-reflection'><img class='tile-thumbnail' src='./assets/images/Flyer-Base-Bottom.png'/></div>";
    
    /* Flyer Cabin */
    for(var i = 0; i < 24; i++){
        r[++j] =    "<div class='flyer-cabin-reflection' style='animation-delay: -" + (i * 2) + "s'><img class='tile-thumbnail' src='./assets/images/Flyer-Cabin-Bottom.png'/></div>";
    }
    
    r[++j] =        "</div>";
   
    /* Reflection - Hotel */
    r[++j] =        "<div class='hotel-reflection'><img class='tile-thumbnail' src='./assets/images/Hotel-Bottom.png'/></div>";
    
    /* Reflection - Garden */
    r[++j] =        "<div class='garden-reflection'><img class='tile-thumbnail' src='./assets/images/Garden-Bottom.png'/></div>";
    
    /* Reflection - Museum */
    r[++j] =        "<div class='museum-reflection'><img class='tile-thumbnail' src='./assets/images/Museum-Bottom.png'/></div>";
    
    /* Reflection - Tree */    
    r[++j] =        "<div class='tree-reflection'><img class='tile-thumbnail' src='./assets/images/Tree-Bottom.png'/></div>";
    
    /* Blue Line Overlay */
    r[++j] =        "<div class='blue-strip'><img class='tile-thumbnail' src='./assets/images/Blue-Strip.png'/></div>";
    
    /* Reflection Box - End */
    r[++j] = "</div>";
    
    var obj = $(r.join(""));
    
    $("#page-container").append(obj);
    
    /* Background white transparency */
    var obj = $("<div class='white-background'></div>");
    
    $("#page-container").append(obj);
    
    /* Navigate Container - Start */
    var r = new Array(), j = -1;
    
    r[++j] = "<div id='navigate-container'>";
    
    /* Next Button */
    r[++j] =    "<div class='next-button next-button-animation'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>";
    
    /* Header Welcome */
    r[++j] =    "<div class='ribbon'><img class='tile-thumbnail' src='./assets/images/Ribbon-Top.png'/></div>";
   
    /* Vibrant City Label */
    r[++j] =    "<div class='vibrant-city'><img class='tile-thumbnail' src='./assets/images/Bottom-Vibrant-City.png'/></div>";
    
    /* Navigate Container - End */
    r[++j] = "</div>";
    
    var obj = $(r.join(""));
    
    $("#page-container").append(obj);
    
    $(".next-button").click(function(event){
        
        /* Disable next button */
        $(this).off("click");
        
        /* Fly out top and bottom */
        $(".ribbon").css("top","15.9px").css("animation", "600ms cubic-bezier(0.310, 0.645, 0.585, 1.105) 100ms ribbon-animation-out forwards");
        $(".vibrant-city").css("top","806.6px").css("animation", "600ms cubic-bezier(0.310, 0.645, 0.585, 1.105) 100ms vibrant-city-animation-out forwards");
        
        setTimeout(function(){
            display_intro();
        }, 700);
    });
    
    /* KIV: top text use svg, illustrator export to svg, animate drawing */ 
}

function display_intro(){
    
    clearNavigatePage();
    clearToastTimer();
    /* Background white transparency */
    $(".white-background").fadeIn(400);
    
    var r = new Array(), j = -1;
    
    /* Aeroplane */
    r[++j] = "<div class='aeroplane aeroplane-animation'><img class='tile-thumbnail' src='./assets/images/Aeroplane.png'/></div>";
    
    /* Whiteboard */
    r[++j] = "<div class='whiteboard whiteboard-animation'><img class='tile-thumbnail' src='./assets/images/Whiteboard.png'/></div>";
   
    /* Wanter Manager */
    r[++j] = "<div class='wanted-male-manager'><img class='tile-thumbnail' src='./assets/images/Wanted-Male-Manager.png'/></div>";
    r[++j] = "<div class='wanted-female-manager'><img class='tile-thumbnail' src='./assets/images/Wanted-Female-Manager.png'/></div>";
    
    /* Intro Text */
    r[++j] = "<div class='whiteboard-text whiteboard-text-animation'><img class='tile-thumbnail' src='./assets/images/Whiteboard-Text.png'/></div>";
    
    /* Next and Home Buttons*/
    r[++j] = "<div class='next-button'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>";
    r[++j] = "<div class='home-button hide'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>"; 
    
    var obj = $(r.join(""));
    
    setTimeout(function(){
        $(".home-button").fadeIn(400);  
    }, 4500);
    
    $("#navigate-container").append(obj);
    
    /* Buttons Event */
    $(".next-button").click(function(event){
        $(this).off("click");
        
        /* Slide wanted left and right */
        $(".wanted-male-manager").addClass('wanted-male-manager-slide-left-animation');
        $(".wanted-female-manager").addClass('wanted-female-manager-slide-right-animation');
       
        /* Text fade zoom out */
        setTimeout(function(){
            navigate_apply();
        }, 1000);
    });
    
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
}

function navigate_apply(){
    
    clearNavigatePage();
    clearToastTimer();
    
    var r = new Array(), j = -1;
    
    r[++j] = "<div class='whiteboard-container'>";
    
    /* Whiteboard */
    r[++j] =    "<div class='whiteboard-in-container'><img class='tile-thumbnail' src='./assets/images/Whiteboard.png'/></div>";
    
    /* Apply Button And Rubbish */
    r[++j] =    "<div class='apply-now'><img class='tile-thumbnail' src='./assets/images/Apply-Now-Button.png'/></div>";
    r[++j] =    "<div class='rubbish'><img class='tile-thumbnail' src='./assets/images/Rubbish.png'/></div>";
    r[++j] =    "<div class='apply-button' style='z-index: 999'></div>";
    
    r[++j] = "</div>";
    
    /* Aeroplane */
    r[++j] = "<div class='aeroplane'><img class='tile-thumbnail' src='./assets/images/Aeroplane.png'/></div>";
   
    /* Two Persons */
    r[++j] = "<div class='male-left male-left-show-animation'><img class='tile-thumbnail' src='./assets/images/Male-Left.png'/></div>";
    r[++j] = "<div class='female-right female-right-show-animation'><img class='tile-thumbnail' src='./assets/images/Female-Right.png'/></div>";
   
    /* Intro Text */
    r[++j] = "<div class='whiteboard-text'><img class='tile-thumbnail' src='./assets/images/Whiteboard-Text.png'/></div>";
   
    /* Next, Previous and Home Buttons*/
    r[++j] = "<div class='previous-button hide'><img class='tile-thumbnail' src='./assets/images/Previous-Button.png'/></div>";
    r[++j] = "<div class='next-button'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>";
    r[++j] = "<div class='home-button'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
    
    /* Hide Text */
    $(".whiteboard-text").css("animation", "400ms linear fade-zoom-hide-animation forwards");
        
    setTimeout(function(){
        $(".previous-button").fadeIn(400);  
    }, 2500);    
        
    /* Buttons Event */ 
    $(".next-button").click(function(event){
        $(this).off("click");
        
        /* Slide Down */
        $(".whiteboard-container").css("animation", "1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) whiteboard-container-hide-animation forwards");
        
        setTimeout(function(){
            navigate_enter_name();    
        }, 1000);
    });
    
    $(".previous-button").click(function(event){
        $(this).off("click");
        display_intro();
    });
    
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
    
    $(".apply-button").click(function(event){
        $(this).off("click");
        
        /* Slide Down */
        $(".whiteboard-container").css("animation", "1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) whiteboard-container-hide-animation forwards");
        
        setTimeout(function(){
            navigate_enter_name();    
        }, 1000);
    });
}

function navigate_enter_name(){
    
    clearNavigatePage();
    clearToastTimer();
    
    var r = new Array(), j = -1;
    
    /* Aeroplane */
    r[++j] = "<div class='aeroplane'><img class='tile-thumbnail' src='./assets/images/Aeroplane.png'/></div>";  
    
    /* Whiteboard Container - Begin */
    r[++j] = "<div class='big-whiteboard-container big-whiteboard-container-animation'>";
    
    /* Big Whiteboard */
    r[++j] =    "<div class='big-whiteboard'><img class='tile-thumbnail' src='./assets/images/Big-Whiteboard.png'/></div>";
    
    /* Enter Your */
    r[++j] =    "<div class='form-enter-your form-content'><img class='tile-thumbnail' src='./assets/images/Enter-Your.png'/></div>";
   
    /* Name Box - High Index */
    r[++j] =    "<div class='form-name-box form-content'><img class='tile-thumbnail' src='./assets/images/Name-Input.png'/></div>";
    
    /* Gender Dropdown */
    r[++j] =    "<div class='form-gender-hide-box form-content'>";
    r[++j] =        "<div class='form-gender-container'>";
    r[++j] =            "<div class='form-gender-dropdown' data-gender='female'><img class='tile-thumbnail' src='./assets/images/Gender-Selection.png'/></div>";
    r[++j] =            "<div class='form-male-selection'></div>";
    r[++j] =            "<div class='form-female-selection'></div>";
    r[++j] =        "</div>";
    r[++j] =    "</div>";
    
    /* Gender Box - High Index */
    r[++j] =    "<div class='form-gender-box form-content'><img class='tile-thumbnail' src='./assets/images/Gender-Input.png'/></div>";
    
    /* Name Input */
    r[++j] =    "<input class='form-name-input form-content' id='form-name-input' value='" + current_user_name + "' placeholder='Enter Your Name' spellcheck='false' type='text' maxlength='30'/>";
   
    /* Gender Input */
    r[++j] =    "<div class='form-gender-input form-content' data-gender='" + current_gender + "'><img class='tile-thumbnail' src='./assets/images/" + capitalizeFirstLetter(current_gender) + "-Choice.png'/></div>";
    
    /* Whiteboard Container - End */
    r[++j] = "</div>";
   
    /* Two Persons */
    r[++j] = "<div class='male-left'><img class='tile-thumbnail' src='./assets/images/Male-Left.png'/></div>";
    r[++j] = "<div class='female-right'><img class='tile-thumbnail' src='./assets/images/Female-Right.png'/></div>";
    
    /* Next, Previous and Home Buttons*/
    r[++j] = "<div class='previous-button'><img class='tile-thumbnail' src='./assets/images/Previous-Button.png'/></div>";
    r[++j] = "<div class='next-button'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>";
    r[++j] = "<div class='home-button'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
    
    /************************Handle Keyboard***********************/
    
    $("#form-name-input")
        .on('focus',function(){ this.blur(); })
        .keyboard({
            autoAccept: true,
            layout: 'qwerty',
            usePreview: false,
            lockInput: true,
            noFocus: true,
            maxLength: 30,
            caretToEnd: true,
            change: function(event, keyboard, el){
                $("#form-name-input").scrollLeft(1000);
            }
        }).addTyping();
    
    $.keyboard.keyaction.enter = function(kb) {
        kb.accept(); /* accept input */
    };
    
    $("#form-name-input").keypress(function(e) {
        if(e.which == 13) {
            $("#form-name-input").blur();
        }
    });
    
    /**********************Handle Keyboard End*********************/
    
    $(".next-button").click(function(event){
        /* Validate Input */
        if($(".form-name-input").val().trim().length == 0){                       
            $(".form-name-box").css("animation","form-name-box-alert-animation 400ms linear 5 forwards");    
            $(".form-name-input").focus();
        }else{
            $(this).off("click");
            current_user_name = $(".form-name-input").val().trim().toUpperCase();
            current_gender = $(".form-gender-input").data("gender");
            
            /* Fade Out Whiteboard Content */
            $(".form-content").fadeOut("slow", function(event){
                navigate_instruction();                
            });
        }
    });
    
    $(".previous-button").click(function(event){
        $(this).off("click");
        navigate_apply();
    });
    
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
    
    /* Gender Dropdown Event */
    $(".form-gender-input").click(function(event){
       if($(".form-gender-container").position().top >= 0){
           $(".form-gender-container").stop().animate({
               top:"-206px"
           }, 400);
       }else{
           $(".form-gender-container").stop().animate({
               top:"0px"
           }, 400);
       }
    });
   
    $(".form-male-selection").click(function(event){
        $(".form-gender-input").html("<img class='tile-thumbnail' src='./assets/images/Male-Choice.png'/>");
        $(".form-gender-input").data("gender","male");
        $(".form-gender-container").stop().animate({
            top:"-206px"
        }, 400);
    });
    
    $(".form-female-selection").click(function(event){
        $(".form-gender-input").html("<img class='tile-thumbnail' src='./assets/images/Female-Choice.png'/>");
        $(".form-gender-input").data("gender","female");
        $(".form-gender-container").stop().animate({
            top:"-206px"
        }, 400);
    });
}

function navigate_instruction(){
    clearNavigatePage();
    clearToastTimer();
    
    var r = new Array(), j = -1;
    
    /* Aeroplane */
    r[++j] = "<div class='aeroplane'><img class='tile-thumbnail' src='./assets/images/Aeroplane.png'/></div>";  
    
    /* Whiteboard Container - Begin */
    r[++j] = "<div class='big-whiteboard-container'>";
    
    /* Big Whiteboard */
    r[++j] =    "<div class='big-whiteboard'><img class='tile-thumbnail' src='./assets/images/Big-Whiteboard.png'/></div>";
    
    /* Your Mission - Fade In */
    r[++j] =    "<div class='your-mission'><img class='tile-thumbnail' src='./assets/images/Your-Mission.png'/></div>";
   
    /* Whiteboard Container - End */
    r[++j] = "</div>";
   
    /* Two Persons */
    r[++j] = "<div class='male-left'><img class='tile-thumbnail' src='./assets/images/Male-Left.png'/></div>";
    r[++j] = "<div class='female-right'><img class='tile-thumbnail' src='./assets/images/Female-Right.png'/></div>";
    
    /* Next, Previous and Home Buttons*/
    r[++j] = "<div class='previous-button'><img class='tile-thumbnail' src='./assets/images/Previous-Button.png'/></div>";
    r[++j] = "<div class='next-button'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>";
    r[++j] = "<div class='home-button'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
    
    $(".your-mission").fadeIn("slow");
    
    $(".next-button").click(function(event){
        $(this).off("click");
        
        /* Person move sides - together with whiteboard */
        $(".male-left").addClass("male-left-hide-animation");
        $(".female-right").addClass("female-right-hide-animation");
        
        /* Whiteboard slide down */
        $(".big-whiteboard-container").addClass("big-whiteboard-container-hide-animation");
       
        /* Aeroplane fly away */
        $(".aeroplane").addClass("aeroplane-fly-away-animation");
       
        /* Home button slide top */
        $(".home-button").addClass("home-button-slide-top-animation");
       
        /* Next button slide right */
        $(".next-button").addClass("next-button-slide-right-animation");
       
        /* Display next page */
        setTimeout(function(){
            navigate_start_game();
        }, 3000);
    });
    
    $(".previous-button").click(function(event){
        $(this).off("click");
        navigate_enter_name();
    });
    
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
}

function navigate_start_game(){
    
    clearNavigatePage();
    clearToastTimer();
    
    var r = new Array(), j = -1;
    
    /* Show all bins in intro. */
    
    /* Pole slide from left */
    r[++j] = "<div class='round-pole-container round-pole-container-show-animation'>";
    r[++j] =    "<div class='round-pole'><img class='tile-thumbnail' src='./assets/images/Round-Pole.png'/></div>";
    r[++j] =    "<div class='round-pole-text-container'>";
    r[++j] =        "<div class='are-you-ready'>Are You Ready<br /><span style='font-size:53.8px'>?</span></div>";
    r[++j] =    "</div>";
    r[++j] = "</div>";
    
    /* All bins and all parachutes with start challenge together slide down and up */
    r[++j] = "<div class='parachute-container parachute-container-show-animation'>";
    r[++j] =    "<div class='parachute-orange-container'>";
    r[++j] =        "<div class='parachute-orange'><img class='tile-thumbnail' src='./assets/images/Parachute-Orange.png'/></div>";
    r[++j] =        "<div class='parachute-score'>" + String("000" + current_score).slice(-3) + "</div>";
    r[++j] =    "</div>";
    r[++j] =    "<div class='parachute-red'><img class='tile-thumbnail' src='./assets/images/Parachute-Red.png'/></div>";
    r[++j] =    "<div class='parachute-blue'><img class='tile-thumbnail' src='./assets/images/Parachute-Blue.png'/></div>";
    r[++j] =    "<div class='parachute-green-container'>";
    r[++j] =        "<div class='parachute-green'><img class='tile-thumbnail' src='./assets/images/Parachute-Green.png'/></div>";
    r[++j] =        "<div class='start-your-challenge'><img class='tile-thumbnail' src='./assets/images/Start-Your-Challenge.png'/></div>";
                    /* Start Challenge Button */
    r[++j] =        "<div class='start-challenge-button'></div>";
    r[++j] =    "</div>";
    r[++j] = "</div>";
    
    /* All bins preview */
    r[++j] = "<div class='bin-container bin-demo-container bin-demo-container-show-animation'>";
    
    for(var k = 0; k < types.length; k++){
        r[++j] =    "<div class='bin'><img class='tile-thumbnail' src='./assets/images/" + types[k] + "-Bin.png'/></div>";
    }
    
    r[++j] = "</div>";
    
    /* Timer - fade-expand-into*/
    r[++j] = "<div class='timer-container timer-container-show-animation'>";
    r[++j] =    "<div class='timer'><img class='tile-thumbnail' src='./assets/images/Timer.png'/></div>";
    r[++j] =    "<div class='time-0 timer-digit' data-digit='0'><div class='content'>0</div></div>";
    r[++j] =    "<div class='time-1 timer-digit' data-digit='1'><div class='content'>1</div></div>";
    r[++j] =    "<div class='time-2 timer-digit' data-digit='0'><div class='content'>0</div></div>";
    r[++j] =    "<div class='time-3 timer-digit' data-digit='0'><div class='content'>0</div></div>";
    r[++j] = "</div>";
    
    /* Previous and Home Buttons*/
    r[++j] = "<div class='previous-button'><img class='tile-thumbnail' src='./assets/images/Previous-Button.png'/></div>";
    r[++j] = "<div class='home-button home-button-top'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
    
    $(".previous-button").click(function(event){
        $(this).off("click");
        navigate_instruction();
    });
    
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
    
    $(".start-challenge-button").click(function(event){
        $(this).off("click");
        $(".previous-button").off("click");
        $(".home-button").off("click");
        
        /*Slide away pole, all bins, green parachute. */
        $(".round-pole-container").addClass("round-pole-container-hide-animation");
        $(".bin-container").addClass("bin-demo-container-hide-animation");
        $(".parachute-green-container").addClass("parachute-green-container-hide-animation");
        
        /* Hide previous button */
        $(".previous-button").addClass("previous-button-slide-left-animation");
        
        playMusic("Happy_Bee.mp3");
        
        setTimeout(function(){
            
            /* Remove pole, bin and green umbrella objects. Recreate for each level. */
            $(".round-pole-container").remove();
            $(".bin-container").remove();
            $(".parachute-green-container").remove();
            $(".previous-button").remove();
            
            load_level();
        }, 2100);
    });
}

function load_level(){
    
    current_item_index = 0;
    current_level_item_list = [];
    current_time_limit = levels[current_level].time_limit;
    current_point_correct = levels[current_level].point_correct;
    current_point_incorrect = levels[current_level].point_incorrect;
    
    /* Determine items list {type,image,fact} - 10 items */
    var item_count = levels[current_level].item_count;
    var item_count_multiplier = levels[current_level].item_count_multiplier;
    var current_types = levels[current_level].type;
    var count_per_type = Math.floor(item_count/current_types.length);  
    
    /* Use modulus and add remainder to last count. Min 10 items, max 8 types. */    
    var remainder = item_count % count_per_type;
    var item_segment_array = [];
    
    for(var p = 0; p < current_types.length; p++){
        if(p == current_types.length - 1){
            item_segment_array.push(count_per_type + remainder);
        }else{
            item_segment_array.push(count_per_type);   
        }
    }
    
    for(var b = 0; b < item_count_multiplier; b++){
        
        var batch_array = new Array();
        
        $.each(current_types, function(i, val){
            /* Random index for each type length */
            var required_count = item_segment_array[i];
            var element = shuffle(items[val]);
            
            for(var m = 0; m < required_count; m++){
                
                var selected_items = {};
                selected_items["type"] = val;
                selected_items["image"] = element[m].image;
                selected_items["fact"] = element[m].fact;
                batch_array.push(selected_items);    
            }
        });
        
        /* Randomize rows */
        batch_array = shuffle(batch_array);
        
        current_level_item_list = current_level_item_list.concat(batch_array);
    }
    
    var r = new Array(), j = -1;
    
    /* Show pole with round number and restart button */
    r[++j] = "<div class='round-pole-container round-pole-container-show-animation'>";
    r[++j] =    "<div class='round-pole'><img class='tile-thumbnail' src='./assets/images/Round-Pole.png'/></div>";
    r[++j] =    "<div class='round-pole-text-container'>";
    r[++j] =        "<div class='pole-round-label'>Round<br /><span class='pole-current-round'>" + (current_level+1) + "</span></div>";
    r[++j] =    "</div>";
    r[++j] =    "<div class='pole-restart'><img class='tile-thumbnail' src='./assets/images/Restart-Button.png'/></div>";
    r[++j] = "</div>";
    
    /* Show bin */
    r[++j] = "<div class='bin-container bin-container-show-animation'>";
    
    for(var k = 0; k < levels[current_level].type.length; k++){
        r[++j] =    "<div class='bin-box'><div class='bin' data-type='" + levels[current_level].type[k] + "'><img class='tile-thumbnail' src='./assets/images/" + levels[current_level].type[k] + "-Bin.png'/><span class='bin-letter'>" + levels[current_level].type[k] + "</span></div></div>";
    }
    
    r[++j] = "</div>";
    
    /* Show green parachute with first item. */
    r[++j] = "<div class='parachute-green-container parachute-green-container-show-animation'>";
    r[++j] =    "<div class='parachute-green'><img class='tile-thumbnail' src='./assets/images/Parachute-Green.png'/></div>";
    /* Show Item */
    r[++j] =    "<div class='item-container'>";
    r[++j] =        "<div class='item' data-type='" + current_level_item_list[current_item_index].type + "' data-fact='" + current_level_item_list[current_item_index].fact + "'><img class='tile-thumbnail' src='./assets/images/items/" + current_level_item_list[current_item_index].type + "/" + current_level_item_list[current_item_index].image + "'/></div>";
    r[++j] =    "</div>";
    r[++j] = "</div>";
    
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
   
    /* Refresh score */
    current_score = 0;
    $.each(level_score, function(i, val){
        current_score += val;
    }); 
    $(".parachute-score").html(String("000" + current_score).slice(-3));
   
    /* Update Timer Display */
    animateTimer();
   
    /* Start new timer after animation ends - 2 seconds. Stop after timeout or after no more element.*/
    toastTimer = setTimeout(function(){
        startLevelTimer();    
    }, 2000);
    
    /* Draggable and Droppable with Hammer. After drop valid location, delete item. */
    attachDraggable();
    
    attachGameHomeButton();
    
    $(".pole-restart").click(function(event){
        
        /* Stop Timer */
        clearInterval(current_level_timer);
        clearToastTimer();
        
        $(this).off("click");
        level_score[current_level] = 0; /* Reset score */
       
        /* Remove pole, bin and green umbrella objects. Recreate for each level. */
        $(".round-pole-container").remove();
        $(".bin-container").remove();
        $(".parachute-green-container").remove();
        $(".quit-container").remove();
        
        load_level();
    });
}

function attachGameHomeButton(){
    
    $(".home-button").click(function(event){
        
        $(this).off("click");
        
        /* Stop timer */
        timer_running = false;
        
        var r = new Array(), j = -1;
        r[++j] = "<div class='quit-container'>";
        r[++j] =    "<div class='quit-popup'><img class='tile-thumbnail' src='./assets/images/Quit-Popup.png'/></div>";
        r[++j] =    "<div class='quit-continue'></div>";
        r[++j] =    "<div class='quit-quit'></div>";
        r[++j] = "</div>";
        
        var obj = $(r.join(""));
    
        $("#navigate-container").append(obj);
        
        /* Button events - resume timer if continue. If continue, renable home button. */
        $(".quit-continue").click(function(event){
            $(".quit-container").remove();
            timer_running = true;   
            attachGameHomeButton(); 
        });
        
        $(".quit-quit").click(function(event){
            if (window.GAME_DIRECT_LEVEL) {
                try { sessionStorage.setItem('gameScore', current_score); } catch(e){}
                window.location.href = '../index.html?from=game';
            } else {
                init_home_page();
            }
        });
    });
}

function check_answer(bin_obj, bin_type, item_type, item_fact){
    
    /* Check and show score. */
    if(bin_type == item_type){
        /* Correct */
        addScore();
    }else{
        /* Incorrect */
        minusScore();
    }
    
    /* Animate plus score circle. Use current_point_correct. */
    var r = new Array(), j = -1;
    r[++j] = "<div class='point-circle-container' style='z-index:" + (current_item_index + 1) + "'>";
    r[++j] =    "<div class='point-circle'><img class='tile-thumbnail' src='./assets/images/Point-Circle.png'/></div>";
    r[++j] =    "<div class='score-point'>" + (bin_type == item_type? "+" + current_point_correct : "-" + current_point_incorrect) + "</div>"; 
    r[++j] = "</div>";
    var obj = $(r.join(""));
    
    bin_obj.closest(".bin-box").prepend(obj);
    
    obj.animate({
        "margin-top":"-101px",
        opacity: 1
    }, 200, function(){
        setTimeout(function(){
           obj.animate({
                "margin-top":"0px",
                opacity: 0
            }, 200); 
        }, 3000, obj);
    });
    
    var defer = $.Deferred();
    var promise = defer.promise();
    
    /* Stop timer if got fact. */
    if(item_fact.length > 0){
        
        timer_running = false;
        
        /* If item_type length > 10 characters, add background padding. */
        
        var r = new Array(), j = -1;
        r[++j] = "<div class='tip-container'>";
        r[++j] =    "<div class='tip-box'><img class='tile-thumbnail' src='./assets/images/Tips-Box.png'/></div>";
        
        var length_class = "";
        
        if(item_type.length > 10){
            length_class = "tip-type-long-10";
        }
        
        if(item_type.length > 12){
            length_class = "tip-type-long-12";
        }
        
        if(item_type.length > 13){
            length_class = "tip-type-long-13";
        }
        
        r[++j] =    "<div class='tip-type " + length_class + "'>" + bin_type.replace(/-/g, " ") + "</div>";
        r[++j] =    "<div class='tip-text'>" + item_fact + "</div>";
        r[++j] = "<div>";
        
        var obj_tip = $(r.join(""));
        
        /* Show facts above correct bin above point circle whether answer correct or not*/
        $(".bin").each(function(){
            if($(this).data("type") == item_type){
                
                $(this).closest(".bin-box").prepend(obj_tip);
                
                obj_tip.animate({
                    "margin-top":"-344.13px",
                    opacity: 1
                }, 200, function(){
                    toastTimer = setTimeout(function(){
                       obj_tip.animate({
                            "margin-top":"-200px",
                            opacity: 0
                        }, 200); 
                        /* Resolve deferred */
                        toastTimer = setTimeout(function(){ 
                            defer.resolve();
                        }, 200);
                    }, (4000 + current_level * 1000), obj_tip, defer);
                });
                
                return false;
            }    
        });
    }else{
        defer.resolve();
    }
    
    promise.then(function(){
        
        timer_running = true;
        /* Next item */
        current_item_index++;
        
        /* Not end of timer */
        if(current_time_limit > 0){
            
            /* Check if end of item, if end of item call end round, else increase index, show next item */
            if(current_item_index > current_level_item_list.length - 1){
                /* End round */
                end_round("No-Item");
            }else{
                /* Show next item. Create item. Attach draggable. */
                var obj = $("<div class='item' data-type='" + current_level_item_list[current_item_index].type + "' data-fact='" + current_level_item_list[current_item_index].fact + "'><img class='tile-thumbnail' src='./assets/images/items/" + current_level_item_list[current_item_index].type + "/" + current_level_item_list[current_item_index].image + "'/></div>");
                
                $(".item-container").append(obj);
                
                attachDraggable();
            }       
        }
    });
}

function startLevelTimer(){
    
    clearInterval(current_level_timer);
    timer_running = true;
    
    current_level_timer = setInterval(function(){ 
        
        if(timer_running){
            
            current_time_limit--;
        
            /* Update Time Display*/
            animateTimer();
        }
        
        if(current_time_limit <= 0){
            clearInterval(current_level_timer);
            end_round("Time-Up");
        }
    }, 1000);
}

function animateTimer(){
    
    var seconds = current_time_limit % 60;
    var minutes = Math.floor(current_time_limit / 60);
    
    var seconds_string = String("00" + seconds).slice(-2);
    var minutes_string = String("00" + minutes).slice(-2);
    
    var digitArray = [];
    
    digitArray[0] = minutes_string.charAt(0);
    digitArray[1] = minutes_string.charAt(1);
    digitArray[2] = seconds_string.charAt(0);
    digitArray[3] = seconds_string.charAt(1);
    
    $.each(digitArray, function(i, val){
        if($(".time-" + i).data("digit") != val){
            
            $(".time-" + i + " .content").animate({
                'top': "-65px"
            }, {duration:200, queue: false, easing: "swing", always: function(){
                $(".time-" + i + " .content").html(val);
                $(".time-" + i + " .content").css("top", "65px");
                $(".time-" + i + " .content").animate({'top':"-3.054px"},{duration:200,queue:false,easing:"swing"});
                $(".time-" + i).data("digit", val);
            }});
        }    
    });   
}

function end_round(type){
    
    /* Stop timer */
    clearInterval(current_level_timer);
    
    /* Remove all items */
    $(".item").remove();
    
    /* Disable home button and restart until animation done. */
    $(".home-button").off("click");
    $(".pole-restart").off("click");
    
    /* Show timer clock - No-Item or Time-Up. Use zoom-into animation. */
    var obj = $("<div class='clock'><img class='tile-thumbnail' src='./assets/images/" + type + ".png'/></div>");
            
    $(".item-container").append(obj);
    
    /* Time-up or no more items */
    current_level++;
    
    if(current_level > max_level){
        
        /* Direct mode: return to menu app with score */
        if (window.GAME_DIRECT_LEVEL) {
            try { sessionStorage.setItem('gameScore', current_score); } catch(e){}
            window.location.href = '../index.html?from=game';
            return;
        }
        
        /* End of game. Show see your result button or 10 seconds timer to show. */
        var obj = $("<div class='see-your-result'><img class='tile-thumbnail' src='./assets/images/See-Your-Result.png'/></div>");
    
        $("#navigate-container").append(obj);
        
        var defer = $.Deferred();
        var promise = defer.promise();
        
        $(".see-your-result").click(function(event){
            defer.resolve();
        });
        
        toastTimer = setTimeout(function(){
            defer.resolve();
        }, 10000, defer);
        
        promise.then(function(){
            clearToastTimer();
            /*Slide away pole, all bins, green parachute. */
            $(".round-pole-container").addClass("round-pole-container-hide-animation");
            $(".bin-container").addClass("bin-container-hide-animation");
            $(".parachute-container, .parachute-green-container").addClass("parachute-green-container-hide-animation");
            $(".timer-container").addClass('timer-container-hide-animation');
            $(".see-your-result").addClass("proceed-next-round-container-hide-animation");
            
            toastTimer = setTimeout(function(){
                $(".round-pole-container").remove();
                $(".bin-container").remove();
                $(".parachute-container").remove();
                $(".see-your-result").remove();
                show_result_board();
            }, 2100);
        });
        
    }else{
        
        /* Proceed to round. Slide up. Rotate Circle. */
        var r = new Array(), j = -1;
        
        r[++j] = "<div class='proceed-next-round-container'>";
        r[++j] =    "<div class='proceed-next-round'><img class='tile-thumbnail' src='./assets/images/Proceed-Label.png'/></div>";
        r[++j] =    "<div class='proceed-next-round-circle'><img class='tile-thumbnail' src='./assets/images/Timer-Arrow.png'/></div>";
        r[++j] =    "<div class='proceed-next-round-timer'>5</div>";
        r[++j] =    "<div class='proceed-next-round-text'>Proceeding To Round " + (current_level + 1) + "</div>";
        r[++j] = "</div>";
        
        var obj = $(r.join(""));
    
        $("#navigate-container").append(obj);
        
        var timeRemaining = 9;
        
        var tempTimer = setInterval(function(){
            timeRemaining--;
            $(".proceed-next-round-timer").html(timeRemaining);
            if(timeRemaining <= 0){
                clearInterval(tempTimer);
                /* Next round */
                
                /*Slide away pole, all bins, green parachute. */
                $(".round-pole-container").addClass("round-pole-container-hide-animation");
                $(".bin-container").addClass("bin-container-hide-animation");
                $(".parachute-green-container").addClass("parachute-green-container-hide-animation");
                $(".proceed-next-round-container").addClass("proceed-next-round-container-hide-animation");
                
                toastTimer = setTimeout(function(){
                    $(".round-pole-container").remove();
                    $(".bin-container").remove();
                    $(".parachute-green-container").remove();
                    $(".proceed-next-round-container").remove();
                    load_level();
                }, 2100);
            }
        },1000, tempTimer, timeRemaining);
    }
}

function show_result_board(){
    clearNavigatePage();
    clearToastTimer();
    
    /* End game music */
    playMusic("Mr_Turtle.mp3");
    
    var r = new Array(), j = -1;
    
    /* Fly in airplane */
    r[++j] = "<div class='aeroplane aeroplane-animation-600-delay'><img class='tile-thumbnail' src='./assets/images/Aeroplane.png'/></div>";
    
    /* Top header slide in */
    r[++j] = "<div class='result-header'><img class='tile-thumbnail' src='./assets/images/Appointed-Manager-Label.png'/></div>";
    
    /* Scoreboard right to left with bounce. */
    r[++j] = "<div class='scoreboard scoreboard-show-animation'><img class='tile-thumbnail' src='./assets/images/Scoreboard.png'/></div>";
    
    r[++j] = "<div class='result-row-container'></div>";
    
    /* Home button */
    r[++j] = "<div class='home-button home-button-top'><img class='tile-thumbnail' src='./assets/images/Home-Button.png'/></div>";
    
    r[++j] = "<div class='credit'>Music: Happy Bee Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 3.0 License http://creativecommons.org/licenses/by/3.0/</div>";
    
    var obj = $(r.join(""));
    
    $("#navigate-container").append(obj);
   
    $(".home-button").click(function(event){
        $(this).off("click");
        init_home_page();
    });
   
    /* Get top 5 scores. */
    var defer = $.Deferred();
    var promise = defer.promise();
    var result_array = new Array();
    var current_user_result_index = -1;
    
    var db = new Dexie("score_database");
    
    db.version(1).stores({
        scores: '++id, name, gender, score, datetime'
    });
    
    db.open().then(function(db){
       
        db.scores.orderBy("score").reverse().limit(5).each(function(item, cursor){
            
            var result = {};
            result["name"] = item.name;
            result["gender"] = item.gender;
            result["score"] = item.score;
            result["datetime"] = item.datetime;
            result_array.push(result);
            
        }).then(function(){
            
            /* Insert current user into position and set current_user_result_index. */
            current_user_result_index = 0;
            
            $.each(result_array, function(i, val){
                if(current_score >= val.score){
                    return false;
                }
                current_user_result_index++;
            });     
            
            var resultEntry = {};
            resultEntry["name"] = current_user_name + " (You)";
            resultEntry["gender"] = current_gender;
            resultEntry["score"] = current_score;
            resultEntry["datetime"] = (new Date()).getTime();
            
            result_array.splice(current_user_result_index, 0, resultEntry);
            
            /* Save to indexeddb*/
            db.scores.add({
                name: current_user_name,
                gender: current_gender,
                score: current_score,
                datetime: (new Date()).getTime()
            });
            
            defer.resolve();   
        }); 
        
    }).catch(function(err){
        /* Show only one user result. */
        current_user_result_index = 0;
        var result = {};
        result["name"] = current_user_name + " (You)";
        result["gender"] = current_gender;
        result["score"] = current_score;
        result["datetime"] = (new Date()).getTime();
        result_array.push(result);
        defer.resolve();
    });
    
    /* Once retrieve data. Run promise. */
    promise.then(function(){
        
        /* Show score one by one sliding left to right within overflow hidden box. */
        var result_r = new Array(), result_j = -1;
        
        $.each(result_array, function(i, val){
            /* Show 5 only. */
            if(i >= 5){
                return false;
            }
            /* Success. Blink highlight 5 times if have ranking. */
            result_r[++result_j] = "<div class='result-row-child' style='animation-delay: " + (1800 + i * 180) + "ms'>";
            result_r[++result_j] =    "<div id='blink-" + i + "' class='result-row-blink " + (current_user_result_index == i? "active" : "") + "'></div>";
            result_r[++result_j] =    "<div class='result-text-container'>";
            result_r[++result_j] =        "<span class='result-no'>0" + (i+1) + "</span>";
            result_r[++result_j] =        "<span class='result-name'>" + val["name"] + "</span>";
            result_r[++result_j] =        "<span class='result-score'>" + val["score"] + "</span>";
            result_r[++result_j] =    "</div>";
            result_r[++result_j] = "</div>";
        });
        
        var result_obj = $(result_r.join(""));
        
        $(".result-row-container").append(result_obj);
        
        var summary_type = "";
        
        if(current_user_result_index < 5){
            summary_type = "Congratulations";
        }else{
            /* Fail */
            summary_type = "Failed";
            
            /* Try again button */
            var obj = $("<div class='try-again-button'><img class='tile-thumbnail' src='./assets/images/Try-Again-Button.png'/></div>");
    
            $("#navigate-container").append(obj);
            
            $(".try-again-button").click(function(){
                
                $(this).off("click");
                
                /* Slide away header */
                $(".result-header").addClass("result-header-hide-animation");
               
                /* Slide away scoreboard */
                $(".scoreboard").addClass('scoreboard-hide-animation');
                $(".result-row-container").addClass("result-row-container-hide-animation");
                
                /* Slide away person */
                $(".ending-banner").addClass("ending-banner-hide-animation");
               
                /* Zoom away button */
                $(".try-again-button").addClass("try-again-button-hide-animation");
               
                /* Home button slide back */
                $(".home-button").addClass("home-button-slide-back-animation");
               
                var r = new Array(), j = -1;
                
                /* Forward button show */
                r[++j] = "<div class='next-button next-button-slide-left-animation'><img class='tile-thumbnail' src='./assets/images/Next-Button.png'/></div>"; 
               
                /* Back button show */
                r[++j] = "<div class='previous-button previous-button-slide-right-animation'><img class='tile-thumbnail' src='./assets/images/Previous-Button.png'/></div>";
                
                var obj = $(r.join(""));
    
                $("#navigate-container").append(obj);
                
                /* Clear scores */ 
                clearToastTimer();
                resetScore();
                current_level = 0;
                
                toastTimer = setTimeout(function(){
                    navigate_instruction();
                }, 2300);
            });
        }
        
        /* Person slide from bottom to top linear slow. */
        var obj = $("<div class='ending-banner ending-banner-show-animation'><img class='tile-thumbnail' src='./assets/images/Result-" + summary_type + ".png'/></div>");
    
        $("#navigate-container").append(obj);
    });
    
    /* Wait 2 minutes and redirect back to homepage. */
    toastTimer = setTimeout(function(){
        init_home_page();    
    }, 120000); 
}

function addScore(){
    level_score[current_level] += parseInt(current_point_correct);
    current_score = 0;
    $.each(level_score, function(i, val){
        current_score += val;
    }); 
    /* Update score display */
    $(".parachute-score").html(String("000" + current_score).slice(-3));
}

function minusScore(){
    level_score[current_level] -= parseInt(current_point_incorrect);
    current_score = 0;
    $.each(level_score, function(i, val){
        current_score += val;
    });
    /* Update score display */
    if(current_score < 0){
        current_score = 0;
    }
    $(".parachute-score").html(String("000" + current_score).slice(-3)); 
}

function attachDraggable(){
    
    var match = false;
    var selected_bin;
    var selected_bin_overlap = 0;
    
    $(".item").draggable({
        revert: "invalid",
        revertDuration: 200,
        scroll: false,
        start: function(event, ui){
            ui.position.left = 0;
            ui.position.top = 0;
            
            /* Show bin highlight */
            $(".bin").addClass('bin-drop-shadow');
        },
        drag: function(event, ui){
            var changeLeft = ui.position.left - ui.originalPosition.left; 
            var newLeft = ui.originalPosition.left + changeLeft / ratio;
    
            var changeTop = ui.position.top - ui.originalPosition.top; 
            var newTop = ui.originalPosition.top + changeTop / ratio;
    
            ui.position.left = newLeft;
            ui.position.top = newTop;
            
            /* Determine whether to revert. */
            match = false;
            
            var stop_x = ui.helper.offset().left / ratio;
            var stop_y = ui.helper.offset().top / ratio;
            
            var stop_width = ui.helper.children("img").width();
            var stop_height = ui.helper.children("img").height();
            
            $(".bin").each(function(index){
                var bin_x = $(this).offset().left / ratio;
                var bin_y = $(this).offset().top / ratio;
                var bin_width = $(this).width();
                var bin_height = $(this).height();
                
                if(!((stop_y + stop_height) < bin_y ||
                    stop_y > (bin_y + bin_height) ||
                    (stop_x + stop_width) < bin_x ||
                    stop_x > (bin_x + bin_width)))
                {
                    if(!match){
                        match = true;
                        selected_bin = $(this);
                        var begin_x = stop_x > bin_x ? stop_x : bin_x;
                        var end_x = (stop_x + stop_width) < (bin_x + bin_width) ? (stop_x + stop_width) : (bin_x + bin_width);
                        selected_bin_overlap = end_x - begin_x;
                    }else{
                        /* Change selected bin if bin has bigger overlap. Calculate X range. */
                        var begin_x = stop_x > bin_x ? stop_x : bin_x;
                        var end_x = (stop_x + stop_width) < (bin_x + bin_width) ? (stop_x + stop_width) : (bin_x + bin_width);
                        var test_bin_overlap = end_x - begin_x;
                        
                        if(test_bin_overlap > selected_bin_overlap){
                            selected_bin_overlap = test_bin_overlap;
                            selected_bin = $(this);
                        }     
                    }
                }
            });
            
            try{            
                if(match){
                    $(this).draggable("option", "revert", false); 
                }else{
                    $(this).draggable("option", "revert", true); 
                }
            }catch(err){
                console.log("Item no longer exists. ");    
            }
            
        },
        stop: function(event, ui){
            
            /* Clear idle timer. Draggable item not propagating body click event. */
            current_idle = 0;
            
            /* Hide bin highlight */
            $(".bin").removeClass('bin-drop-shadow');
            
            if(match){
                check_answer(selected_bin, selected_bin.data("type"), ui.helper.data("type"), ui.helper.data("fact"));
                ui.helper.remove();
            }
        }
    });
}

function init_idle_timeout(){
    
    if(idle_second != 0){
        var idle = setInterval(function(){ 
            current_idle++;
            if(current_idle > idle_second){
                current_idle = 0;
                init_home_page();
            }
        }, 1000);
        
        $('body').click(function(){
            current_idle = 0;
        });    
    }
}

function resetScore(){
    current_score = 0;
    for(var i = 0; i < level_score.length; i++){
        level_score[i] = 0;
    }
}

function clearToastTimer(){
    clearTimeout(toastTimer);
}

function calculateRatio(){
    var container_width = $("#container").width();
    ratio = container_width / frame_width;
}

function changeBackground(src){
    $(".page-background").remove();
    $("#scale-container").append('<img class="page-background" src="' + src + '"/>');
}

function clearPage(){
    $("#page-container").empty();
    calculateRatio();
}

function clearNavigatePage(){
    $("#navigate-container").empty();
}

function playMusic(song){
    $("#audio-player").attr("src", "./assets/audio/" + song);
    $("#audio-player")[0].pause();
    $("#audio-player")[0].load();
    $("#audio-player")[0].oncanplaythrough = $("#audio-player")[0].play();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function shuffle(array) {

    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function isSmartDevice(){
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        return true;
    } else {
        return false;
    }
}

function rescale(obj, options){
    
    $.each(obj, function(){
        $(this).width($(this).width() * ratio).height($(this).height() * ratio);
        var target_obj = $(this);
        
        if(typeof options !== 'undefined'){
            $.each(options, function(i, val){
                switch(val){
                    case "left":
                        target_obj.css("left", (target_obj.position().left * ratio) + "px");
                        break;
                    case "top": 
                        target_obj.css("top", (target_obj.position().top * ratio) + "px");
                        break;
                    case "right": 
                        target_obj.css("right", (parseInt(target_obj.css("right").replace("px", "")) * ratio) + "px");
                        break;
                    case "font":
                        target_obj.css("font-size", (parseInt(target_obj.css("font-size").replace("px", "")) * ratio) + "px");
                        break;
                    case "padding": 
                        target_obj.css("padding", (parseInt(target_obj.css("padding").replace("px", "")) * ratio) + "px");
                        break;
                    case "border-radius": 
                        target_obj.css("border-radius", (parseInt(target_obj.css("border-radius").replace("px", "")) * ratio) + "px");
                        break;
                    case "border-width":
                        target_obj.css("borderWidth", (parseInt(target_obj.css("borderWidth").replace("px", "")) * ratio) + "px"); 
                        break;
                }
            });
        }
    });    
}