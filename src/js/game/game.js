window.import_game = function(module){
    
    module.Player = Class.extend({
        init: function(opt){
            opt = opt || {};
            this.name  = opt.name || 'unnamed';
            this.game  = null;
            this.state = 'new';   // 'new','spawning','playing'
            this.type  = opt.type || 'local';   // 'local', 'remote', 'ai'
            this.team  = opt.team || 'spectator'; // 'spectator','auto','red','blue','foes','monsters'
            this.ship  = opt.ship || null;
            this.health = 100;
        },
    });

	module.Game = Class.extend({
		init: function(opt){
            opt = opt || {};
            this.players = {};
            this.isServer = !!opt.server
            this.lvl = new ents.Level({name:opt.lvl});
		},
        addPlayer: function(player){
            this.players[player.name] = player;
            player.state = 'new';
            player.game  =  this;
        },
        loadLevel: function(name){
            if(name !== this.lvl.name){
                var newlvl = new ents.Level({name:name});
                this.lvl.destroy();
                this.lvl = newlvl;
                this.main.scene.add(newlvl);
            }
        },
        getLocalPlayer: function(){
            for(name in this.players){
                var p = this.players[name];
                if(p.type === 'local'){
                    return p;
                }
            }
            return null;
        },
        spawnPlayer: function(player){
            console.log('spawning player: '+player.name);
            var spawns = this.lvl.spawns[player.team];
            var spawn =  spawns[Math.floor(Math.random()*spawns.length)];
            var pos = V2(spawn);
            var ship = new ents.Ship({
                game: this,
                player: player,
                pos: new V2(spawn).add(V2(0.5,0.5)).mult(this.lvl.grid.cellSize), 
            });
            player.ship = ship;
            this.main.scene.add(ship);
        },
        updatePlayer: function(player){
            if(player.ship && player.health < 0){
                player.ship.destroy();
            }
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
                camera : new ents.GameCamera({game:self}),
                onSceneStart: function(){
                    this.add(self.lvl);
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
