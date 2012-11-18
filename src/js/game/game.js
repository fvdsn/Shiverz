(function(exports){
    require('../engine/modula.js').use();
    var assets = require('./assets.js');
    var settings = require('./settings.js');
    var ents = require('./entities.js');

    var Player = Class.extend({
        init: function(opt){
            opt = opt || {};
            this.name  = opt.name || 'unnamed';
            this.nick  = opt.nick || 'UnnamedPlayer';
            this.game  = opt.game || null;
            this.state = 'new';   // 'new','spawning','playing'
            this.team  = opt.team || 'spectator'; // 'spectator','auto','red','blue','foes','monsters'
            this.ship  = opt.ship || null;
            this.health = 100;
            this.respawnTimer = null;
            this.lastSentState = "";

            //Networking
            this.socket = opt.socket || null;
            this.controls = [];
            this.shipstates = [];
            this.time = 0;  //time of the mainloop
            this.rtt  = new RunningMean({length: 10, value: 0});
        },
        ping:function(time){
            if(this.time !== 0 && this.time !== time){
                this.rtt.push(time-this.time);
            }
            this.time = time;
        },
        getState: function(){
            return {
                name: this.name, //TODO remove this
                state: this.state,
                team: this.team,
                health: this.health,
            };
        },
        setState: function(plyr){
            this.name = plyr.name || this.name;
            this.team = plyr.team || this.team;
            this.health = plyr.health !== undefined ? plyr.health : this.health;
        },
        isDead: function(){
            return this.health <= 0;
        },
        kill: function(){
            this.health = -10000;
        },
    });
    exports.Player = Player;

	var Game = Class.extend({
        init: function(opt){
            opt = opt || {};
            this.localPlayerName = opt.localPlayerName || 'UnnamedPlayer';
            this.players = {};
            this.level = new ents.Level();
            if(serverSide){
                this.level.generate();
            }
            this.entclasses = {}; //maps game entities names to their classes
            this.projByGuid = {};

            ents.GameEnt.game = this; //FIXME ?
            // Settings
            this.lagCompensation = true;
            this.maxLagCompensation = 0.1;

            // Networking
            this.serverHostName = opt.serverHostName || 'localhost';
            this.serverPort = opt.serverPort || 8080;
            this.serverTime = 0;
            this.rtt = new RunningMean({length:10,value:0});

            // Guids are unique numbers identifying game entities across the
            // network
            this.guidNext  = 1;
		},
        newGuid : function(){
            var guid = this.guidNext;
            this.guidNext += 1;
            return guid;
        },
        ping: function(serverTime){
            if(this.serverTime !== 0 && this.serverTime !== serverTime){
                this.rtt.push(serverTime - this.serverTime);
            }
            this.serverTime = serverTime;
        },
        getServerUrl: function(){
            return 'ws://'+this.serverHostName+':'+this.serverPort;
        },
        addPlayer: function(player){
            this.players[player.name] = player;
            player.game  =  this;
            console.log('Game: new player: ',player.name);
        },
        remPlayer: function(playername){
            if(this.players[playername].ship){
                this.players[playername].ship.destroy();
            }
            delete this.players[playername];
            console.log('Game: removed player: ',playername);
        },
        changeTeam: function(playername,team){
            this.players[playername].team = team;
        },
        changeNick: function(playername, nick){
            for(var p in this.players){
                if(p !== playername && this.players[p].nick === nick){
                    return false;
                }
            }
            this.players[playername].nick = nick;
            return true;
        },
        getState: function(){
            var players = {};
            for(player in this.players){
                players[player] = this.players[player].getState();
            }
            var ships = {};
            for(player in this.players){
                var ship = this.players[player].ship;
                if(ship){
                    ships[player] = ship.getState();
                }
            }
            var level = this.level.getState();
            return {players: players, level: level, ships: ships};
        },
        setState: function(state){
            console.log('SetState:',state);
            this.loadLevel(state.level);
            this.players = {};
            for(player in state.players){
                var p = new Player({game:this});
                p.setState(state.players[player]);
                this.addPlayer(p);
            }
            for(playername in state.ships){
                var player = this.players[playername];
                if(!player.ship){
                    var ship = this.spawnPlayer(player,new V2());
                    ship.setState(state.ships[playername]);
                }
            }
        },
        loadLevel: function(arg){
            console.log('Loading level');
            if(typeof arg === 'string'){
                var newlevel = new ents.Level({name:arg});
            }else{
                var newlevel = new ents.Level(arg);
            }
            this.level.destroy();
            this.level = newlevel;
            this.main.scene.add(newlevel);
        },
        getLocalPlayer: function(){
            return this.players[this.localPlayerName] || null;
        },
        spawnPlayer: function(player,pos){
            if(!pos){
                var spawns = this.level.spawns[player.team];
                var spawn =  spawns[Math.floor(Math.random()*spawns.length)];
                pos = new V2(spawn||[0,0]).add(V2(0.5,0.5)).mult(this.level.grid.cellSize);
            }
            console.log('spawning player: '+player.name+'@'+pos);
            var ship = new ents.Ship({
                game: this,
                player: player,
                pos: pos,
            });
            player.ship = ship;
            player.health = 100;
            this.main.scene.add(ship);
            return ship;
        },
        spawnProj: function(name,playername,args){
            console.log('Player: '+playername+' Spawning Entity: '+name+' with args:'+JSON.stringify(args));
            var player = this.players[playername];
            if(player && this.entclasses[name]){
                if(serverSide){
                    args.guid = this.newGuid();
                }
                var proj = new (this.entclasses[name])(player,args);
                this.main.scene.add(proj);
                this.projByGuid[proj.guid] = proj;
            }else{
                throw new Error('could not spawn projectile');
            }
            if(serverSide){
                if(this.lagCompensation){
                    proj.compensateLag(Math.min(player.rtt.mean/2,this.maxLagCompensation));
                    args.pos = proj.tr.getPos();
                }
                this.send('all','spawn_proj',{name:name, playername:playername, args:args});
            }
        },
        destroyProj: function(guid){
            if(this.projByGuid[guid]){
                this.projByGuid[guid].destroy();
                delete this.projByGuid[guid];
                if(serverSide){
                    this.send('all','destroy_proj',guid);
                }
            }
        },
        updatePlayer: function(player){
            if(player.isDead()){
                if(player.ship){
                    player.ship.destroy();
                    player.spawnTimer = this.main.scene.timer(2);
                    this.send('all','kill_player',player.name);
                }else if(player.spawnTimer && player.spawnTimer.expired()){
                    var ship = this.spawnPlayer(player);
                    this.send('all','spawn_player',{player: player.name, pos: ship.tr.getPos()});
                }
            }
            var state = player.getState();
            var statestr = JSON.stringify(state);
            if(statestr !== player.lastSentState){
                player.lastSentState = statestr;
                this.send('all','update_player',{player: player.name, state:state});
            }
        },
        updateHud: function(){
            var player = this.getLocalPlayer();
            if(player){
                $('.hud .health .value').html(player.health);
                if(player.health < 25){
                    $('.hud .health').addClass('low');
                }else{
                    $('.hud .health').removeClass('low');
                }
            }
        },
        onGameUpdate: function(){
            if(serverSide){
                for(player in this.players){
                    var p = this.players[player];
                    if(p.team !== 'spectator'){
                        if(p.state === 'new' || p.state === 'spawning'){
                            var ship = this.spawnPlayer(p);
                            this.send('all','spawn_player',{player: p.name, pos: ship.tr.getPos()});
                            p.state = 'playing'; //FIXME send over network
                        }else{
                            this.updatePlayer(p);
                        }
                    }
                }
            }else{
                this.updateHud();
            }
        },
        send: function(destination,type,data){
            var msg = {type:type, data:data || {}};
            if(clientSide){
                // console.log('Client: sending '+type+' to '+destination+' with data:',data);
                if(destination === 'server'){
                    this.socketToServer.send(JSON.stringify(msg));
                }else{ 
                    throw new Error('send(): invalid destination for message of type:'+type);
                }
            }else{
                // console.log('Server: sending '+type+' to '+destination+' with data:',JSON.stringify(data).substr(0,1000));
                if(typeof destination === 'string'){
                    if(destination === 'all'){
                        var strmsg = JSON.stringify(msg);
                        for(player in this.players){
                            this.players[player].socket.send(strmsg);
                        }
                    }else if(destination[0] === '!'){ //FIXME what if the username starts with ! ?
                        destination = destination.slice(1);
                        for(player in this.players){
                            if(player !== destination){
                                this.players[player].socket.send(JSON.stringify(msg));
                            }
                        }
                    }else{
                        destination = destination.slice(1);
                        if(this.players[destination]){
                            this.players[destination].socket.send(JSON.stringify(msg));
                        }
                    }
                }else{
                    destination.send(JSON.stringify(msg));
                }
            }
        },
        _onPlayerConnected: function(socket){
            var self = this;
            console.log('Server: new client connected');
            var player = null;
            socket.on('message', function(message){
                var msg  = JSON.parse(message);
                //console.log('Server: received message: '+JSON.stringify(message).substr(0,1000));
                if(msg.type === 'greeting'){
                    var newPlayerName = msg.data.playerName;
                    while(self.players[newPlayerName]){
                        newPlayerName = newPlayerName+'I';
                    }
                    self.send(socket,'greeting',{
                        playerName: newPlayerName, 
                        playerTeam:'spectator',
                        gamestate: self.getState(),
                    });
                    player = new Player({ game: self, name: newPlayerName, socket:socket, team:'spectator'});
                    self.addPlayer(player);
                    self.send('!'+newPlayerName,'new_player',player.getState());
                    socket.on('close',function(code,message){self._onPlayerDisconnected(newPlayerName);});
                }else{
                    self._onMessageFromPlayer(player,msg);
                }
            });
        },
        _onMessageFromPlayer: function(player,msg){
            var type = msg.type, data = msg.data;
            if(type === 'controls'){
                player.controls.push(data);
            }else if(type === 'change_team'){
                this.changeTeam(player.name,data);
                this.send('all','change_team',{player:player.name, team:data});
            }else if(type === 'change_nick'){
                if(this.changeNick(player.name,data)){
                    this.send('all','change_nick',{player:player.name, nick:data});
                }
            }else if(type === 'ping'){
                player.ping(data.time);
                this.send(player.socket,'ping',{time: this.main.time});
            }else if(type === 'suicide'){
                console.log('Player: '+player.name+' committed suicide');
                player.kill();
            }else if(type === 'teleport'){
                if(player.ship){
                    player.ship.tr.setPos(new V2(data));
                }
            }else{
                console.log('unknown message:',msg);
            }
        },
        _onPlayerDisconnected: function(player){
            console.log('Server: player disconnected: ',player);
            this.remPlayer(player);
            this.send('all','player_disconnected',player);
        },
        _onConnectedToServer: function(){
            console.log('Client: connected to server');
            this.send('server','greeting',{playerName:this.localPlayerName});
        },
        _onMessageFromServer: function(message){
            var msg = JSON.parse(message.data);
            //console.log('Received message from server: ',msg);
            if(msg.type === 'greeting'){
                this.setState(msg.data.gamestate);
                this.localPlayerName = msg.data.playerName;
                this.addPlayer(new Player({game: this, name:this.localPlayerName, team:msg.data.playerTeam}));
                this.send('server','ping',{time: this.main.time});
            }else if(msg.type === 'new_player'){
                var player = new Player({game:this});
                player.setState(msg.data);
                this.addPlayer(player);
            }else if(msg.type === 'update_player'){
                var player = this.players[msg.data.player];
                console.log('update_player:',player,msg.data.state);
                player.setState(msg.data.state);
            }else if(msg.type === 'player_disconnected'){
                this.remPlayer(msg.data);
            }else if(msg.type === 'spawn_player'){
                this.spawnPlayer(this.players[msg.data.player],msg.data.pos);
            }else if(msg.type === 'change_team'){
                this.changeTeam(msg.data.player,msg.data.team);
            }else if(msg.type === 'change_nick'){
                this.changeNick(msg.data.player,msg.data.nick);
            }else if(msg.type === 'kill_player'){
                var player = this.players[msg.data];
                if(player && player.ship){
                    player.ship.destroy();
                }
            }else if(msg.type === 'ship_update'){
                var player = this.players[msg.data.player];
                if(player){
                    player.shipstates.push(msg.data.state);
                }
            }else if(msg.type === 'ping'){
                this.ping(msg.data.time);
                this.send('server','ping',{time:this.main.time});
            }else if(msg.type === 'spawn_proj'){
                console.log('Spawning Projectile: ',msg.data);
                this.spawnProj(msg.data.name, msg.data.playername, msg.data.args);
            }else if(msg.type === 'destroy_proj'){
                console.log('Destroying Projectile: ',msg.data);
                this.destroyProj(msg.data);
            }else{
                console.log('unkwnown message from server:',msg);
            }
        },
		start: function(){
            var self = this;
            if(clientSide){
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
                console.log('Client: Connecting to server: '+this.getServerUrl());
                this.socketToServer = new WebSocket(this.getServerUrl());
                this.socketToServer.onopen = function(){ self._onConnectedToServer(); };
                this.socketToServer.onmessage = function(message){ self._onMessageFromServer(message); };
                this.serverSocket = null;
            }else{
		this.httpServer = require('http').createServer(function(req,res){
			res.writeHead(200,{'Content-Type':'text/html'});
			res.end('<h1>Shiverz Game Server: open on port:'+self.serverPort+'</h1>');
		});
		this.httpServer.listen(this.serverPort);
                this.serverSocket = new (require('ws').Server)({server:this.httpServer});
                this.serverSocket.on('connection',function(socket){self._onPlayerConnected(socket);});
		console.log('Server listening on port:',this.serverPort);
                this.socketToServer = null;
                renderer = null;
            }
            var GameScene = Scene.extend({
                renderer: renderer,
                camera : new ents.GameCamera({game:self}),
                onSceneStart: function(){
                    this.add(self.level);
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
                fps: 60,
            });
            this.main.run();
		},
		exit:  function(){
            this.main.exit();
		},
	});
    exports.Game = Game;
})(exports);
