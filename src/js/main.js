var game = require('./game/game.js');
if(typeof window !== 'undefined'){
    console.log('window!',window);
    window.onload = function(){
        console.log('loaded');
        var g = new game.Game();
        window.Game = game.Game;
        window.Player = game.Player;
        window.g = g;
        g.start();
    };
}else{
    var g = new game.Game();
    g.start();
}
