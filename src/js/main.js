var game = require('./game/game.js');

if(typeof window !== 'undefined'){
    window.onload = function(){
        var g = new game.Game({
            serverHostName: window.location.hostname || 'localhost',
            serverPort:8080,
            localPlayerName:'foobar'
        });
        window.Game = game.Game;
        window.Player = game.Player;
        window.g = g;
        g.start();

        $('.name_select .button.ok').click(function(){
            var nick = $('.name_select input')[0].value;

            g.send('server','change_nick',nick || 'Anonynoob');

            $('.dialog.name_select').hide(250,function(){
                $('.dialog.team_select').show(250);
            });
        });
        $('.button.team.red').click(function(){
            $('.dialog.team_select').hide(500,function(){
                g.send('server','change_team','red');
                $('.hud').show();
            });
        });
        $('.button.team.blue').click(function(){
            $('.dialog.team_select').hide(500,function(){
                g.send('server','change_team','blue');
                $('.hud').show();
            });
        });
    };
}else{
    var g = new game.Game({serverHostName:'localhost',serverPort:8080});
    g.start();
}
