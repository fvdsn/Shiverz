var game = require('./game/game.js');

if(typeof window !== 'undefined'){
    window.onload = function(){
        var g = new game.Game({
            serverHostName:'localhost',
            serverPort:8080,
            localPlayerName:'foobar'
        });
        window.Game = game.Game;
        window.Player = game.Player;
        window.g = g;
        g.start();
    };
}else{
    var g = new game.Game({serverHostName:'localhost',serverPort:8080});
    g.start();
}
