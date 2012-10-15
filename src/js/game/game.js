window.import_game = function(module){
    
    module.Player = Class.extend({
        init: function(opt){
            opt = opt || {};
            this.name  = opt.name || 'unnamed';
            this.game  = null;
            this.state = 'new';   // 'new','spawning','playing'
            this.type  = opt.type || 'local';   // 'local', 'remote', 'ai'
            this.team  = opt.team || 'spectator'; // 'spectator','red','blue','foe','monsters'
        },
    });

	module.Game = Class.extend({
		init: function(opt){
            this.players = {};
		},
        addPlayer: function(player){
            this.players[player.name] = player;
            player.state = 'new';
            player.game  =  this;
        },
        spawnPlayer: function(player){
            console.log('spawning player: '+player.name);
        },
        updatePlayer: function(player){
            console.log('updating player: '+player.name);
        },
        onGameUpdate: function(){
            for(player in this.players){
                var p = this.players[player];
                if(p.team !== 'spectator'){
                    if(p.state === 'new' || p.state === 'spawning'){
                        this.spawnPlayer(p);
                        p.state = 'playing';
                    }else{
                        this.updatePlayer(p);
                    }
                }
            }
        },
		start: function(){
            var self = this;
            var renderer = new RendererCanvas2d({
                passes:[
                'buildings',
                'bgblocks',
                'ships',
                'projectiles',
                'explosions',
                'blocks',
                ],
                canvas: document.getElementById('game_canvas'), 
                getSize: function(){
                    return new V2(window.innerWidth, window.innerHeight);
                },
                background: 'rgba(40,35,30,1)',
                alwaysRedraw: true,
            });
            var GameScene = Scene.extend({
                renderer: renderer,
                onSceneStart: function(){
                    var player = new ents.PlayerShip({
                        pos: new V2(window.innerWidth/2, window.innerHeight/2),
                    });
                    this.add(player);
                    this.add(ents.lvl);
                },
                onFrameStart: function(){
                    self.onGameUpdate();
                },
            });
            this.main = new Main({
                input: new Input({
                    alias: settings.bindings,
                }),
                scene: new GameScene(),
            });
            this.main.run();
		},
		exit:  function(){
            this.main.exit();
		},
	});
};
