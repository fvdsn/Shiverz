(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/game/game.js",function(require,module,exports,__dirname,__filename,process,global){(function(exports){
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
            this.respawnTimer = null;

            this.updateInterval = 1;
            this.lastUpdate = 0;
            this.frags  = 0;
            this.deaths = 0;
            this.armor  = 50;
            this.health = 125;
            this.ammo   = {};
            this.lastFoe = null;

            //Networking
            this.socket = opt.socket || null;
            this.controls = [];
            this.shipstates = [];
            this.time = 0;  //time of the mainloop
            this.rtt  = new RunningMean({length: 10, value: 0});
            this.lastSentState = "";
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
                nick: this.nick, // and this ?
                state: this.state,
                team: this.team,
                armor: this.armor,
                frags: this.frags,
                deaths: this.deaths,
                health: this.health,
            };
        },
        setState: function(state){
            for (field in state){
                this[field] = state[field];
            }
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
            nick = nick || 'UnnamedPlayer';
            for(var p in this.players){
                if(p !== playername && this.players[p].nick === nick){
                    return false;
                }
            }
            console.log(playername,' changing nick to ',nick);
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
            player.health = 125;
            player.armor = 50;
            player.lastUpdate = this.main.time;
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
                    player.deaths++;
                    if(player.lastFoe){
                        player.lastFoe.frags++;
                    }
                    player.ship.destroy();
                    player.spawnTimer = this.main.scene.timer(2);
                    this.send('all','kill_player',player.name);
                }else if(player.spawnTimer && player.spawnTimer.expired()){
                    var ship = this.spawnPlayer(player);
                    this.send('all','spawn_player',{player: player.name, pos: ship.tr.getPos()});
                }
            }else if(this.main.time > player.lastUpdate + player.updateInterval){
                player.lastUpdate = this.main.time;
                if(player.health > 100){
                    player.health--;
                }else if(player.health < 100){
                    player.health++;
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
                $('.hud .armor .value').html(player.armor);
            }
            if(this.main.input.isKeyPressing('b')){
                $('.dialog.score').toggle();
                $('.dialog.score .entries').empty();
                $('.dialog.score .team > score').empty();
                for(name in this.players){
                    var player = this.players[name];
                    var entries = $('.dialog.score .'+player.team+' .entries');
                    entries.append("<div class='entry'><span class='nick'>"+player.nick+"</span> <span class='score'>"+player.frags+"</span> </div>");
                }
            }
            if(this.main.input.isKeyPressing('t')){
                $('.dialog.team_select').toggle();
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
            }else if(type === 'damage'){
                if(player.ship){
                    player.ship.damage(null,data);
                }
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

});

require.define("/engine/modula.js",function(require,module,exports,__dirname,__filename,process,global){(function(exports){
    function extend(obj1,obj2){
        for( field in obj2){
            if( obj2.hasOwnProperty(field)){
                obj1[field] = obj2[field];
            }
        }
    };
    extend(exports,require('./vec.js'));
    extend(exports,require('./transform2.js'));
    extend(exports,require('./bounds2.js'));
    extend(exports,require('./core.js'));
    extend(exports,require('./engine.js'));
    extend(exports,require('./grid.js'));
})(exports);

});

require.define("/engine/vec.js",function(require,module,exports,__dirname,__filename,process,global){var exports = typeof exports !== 'undefined' && this.exports !== exports ? exports : window;

/* ------------------------------ 2D Vectors -------------------------------- */

(function(exports){
    
    function V2(){
        var self = this;
        if(this.constructor !== V2){
            self = new V2();
        }
    	var alen = arguments.length;      
    	if(alen === 0){
            self.x = 0.0;
            self.y = 0.0;
        }else if (alen === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                self.x = arg;
                self.y = arg;
            }else if(typeof arg.angle === 'number' || typeof arg.len === 'number'){
                V2.setPolar(self, (arg.len === undefined ? 1 : arg.len), arg.angle || 0);
            }else if(arg[0] !== undefined){
                self.x = arg[0] || 0;
                self.y = arg[1] || 0;
            }else{
            	self.x = arg.x || 0;
            	self.y = arg.y || 0;
            }
        }else if (alen === 2){
            self.x = arguments[0];
            self.y = arguments[1];
        }else{
            throw new Error("wrong number of arguments:"+arguments.length);
        }
        return self;
    }

    exports.V2 = V2;

    var proto = V2.prototype;
    
    V2.zero     = new V2();
    V2.x        = new V2(1,0);
    V2.y        = new V2(0,1);
    V2.epsilon  = 0.00000001;
    V2.tmp      = new V2();
    V2.tmp1     = new V2();
    V2.tmp2     = new V2();

    var tmp       = new V2();
    var tmp1      = new V2();
    var tmp2      = new V2();
    var nan       = Number.NaN;
    
    // sets vd to a vector of length 'len' and angle 'angle' radians
    V2.setPolar = function(vd,len,angle){
    	vd.x = len;
        vd.y = 0;
        V2.rotate(vd,angle);
        return vd;
    };

    V2.polar = function(len,angle){
        var v = new V2();
        V2.setPolar(v,len,angle);
        return v;
    };

	V2.random = function(){
		return new V2(Math.random()*2 - 1, Math.random()*2 - 1);
	}

    V2.randomPositive = function(){
        return new V2(Math.random(),Math.random());
    };

    V2.randomDisc = function(){
    	var v = new V2();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    V2.isZero  = function(v){
        return v.x === 0 && v.y === 0;
    };

    proto.isZero = function(){
        return this.x === 0 && this.y === 0;
    };

    V2.isNaN = function(v){
        return Number.isNaN(v.x) || Number.isNaN(v.y);
    };

    proto.isNaN = function(){
        return V2.isNaN(this);
    };


    V2.len = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y);
    };

    proto.len = function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    V2.lenSq = function(v){
        return v.x*v.x + v.y*v.y;
    };
    
    proto.lenSq = function(){
        return this.x*this.x + this.y*this.y;
    };
    
    V2.dist = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    proto.dist = function(v){
        return V2.dist(this,v);
    };
    
    V2.distSq = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return dx*dx + dy*dy;
    };

    proto.distSq = function(v){
        return V2.distSq(this,v);
    };
    
    V2.dot = function(v1,v2){
        return v1.x*v2.x + v2.y*v2.y;
    }

    proto.dot = function(v){
        return this.x*v.x + this.y*v.y;
    };
    
    V2.set  = function(vd,vx,vy){
        vd.x = vx;
        vd.y = vy;
        return vd;
    };
    
    V2.setArray = function(vd,array,offset){
        offset = offset || 0;
        vd.x = array[offset];
        vd.y = array[offset+1];
        return vd;
    };


    V2.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
        return vd;
    };

    proto.clone = function(){
        return new V2(this.x,this.y);
    };
    
    V2.add = function(vd,v){
        vd.x += v.x;
        vd.y += v.x;
        return vd;
    };

    proto.add = function(v){
        return new V2(this.x+v.x,this.y+v.y);
    };
    
    V2.addScaled = function(vd,v,scale){
        vd.x += v.x * scale;
        vd.y += v.y * scale;
        return vd;
    };

    proto.addScaled = function(v,scale){
        var vd = new V2();
        V2.copy(vd,this);
        V2.addScaled(vd,v,scale);
        return vd;
    };
    
    V2.sub = function(vd,v){
        vd.x -= v.x;
        vd.y -= v.y;
        return vd;
    };

    proto.sub = function(v){
        return new V2(this.x-v.x,this.y-v.y);
    };

    V2.mult= function(vd,v){
        vd.x *= v.x;
        vd.y *= v.y;
        return vd;
    };

    proto.mult = function(v){
        if(typeof v === 'number'){
            return new V2(this.x*v,this.y*v);
        }else{
            return new V2(this.x*v.x,this.y*v.y);
        }
    };
    
    V2.scale = function(vd,f){
        vd.x *= f;
        vd.y *= f;
        return vd;
    };
    
    proto.scale = function(f){
        return new V2(this.x*f, this.y*f);
    };
    
    V2.neg = function(vd){
        vd.x = -vd.x;
        vd.y = -vd.y;
        return vd;
    };

    proto.neg = function(f){
        return new V2(-this.x,-this.y);
    };

    V2.div = function(vd,v){
        vd.x = vd.x / v.x;
        vd.y = vd.y / v.y;
        return vd;
    };

    proto.div = function(v){
        return new V2(this.x/v.x,this.y/v.y);
    };

    V2.invert = function(vd){
        vd.x = 1.0/vd.x;
        vd.y = 1.0/vd.y;
        return vd;
    };

    proto.invert = function(){
        return new V2(1/this.x,1/this.y);
    };

    V2.pow = function(vd,pow){
        vd.x = Math.pow(vd.x,pow);
        vd.y = Math.pow(vd.y,pow);
        return vd;
    };

    proto.pow = function(pow){
        return new V2(Math.pow(this.x,pow), Math.pow(this.y,pow));
    };

    V2.sq = function(vd){
        vd.x = vd.x * vd.x;
        vd.y = vd.y * vd.y;
        return vd;
    };
    
    proto.sq = function(){
        return new V2(this.x*this.x,this.y*this.y);
    };
   
    V2.normalize = function(vd){
        var len = vd.lenSq();
        if(len === 0){
            vd.x = 1;
            vd.y = 0;
        }else if(len !== 1){
            len = 1 / Math.sqrt(len);
            vd.x = vd.x * len;
            vd.y = vd.y * len;
        }
        return vd;
    };
            
    proto.normalize = function(){
        var vd = new V2();
        V2.copy(vd,this);
        V2.normalize(vd);
        return vd;
    };
    
    V2.setLen = function(vd,l){
        V2.normalize(vd);
        V2.scale(vd,l);
        return vd;
    };

    proto.setLen = function(l){
        var vd = new V2();
        V2.copy(vd,this);
        V2.setLen(vd,l);
        return vd;
    };

    V2.project = function(vd,v){
        V2.copy(tmp,v);
        V2.normalize(tmp);
        var dot = V2.dot(vd,tmp);
        V2.copy(vd,tmp);
        V2.setLen(vd,dot);
        return vd;
    };
    
    proto.project = function(v){
        var vd = new V2();
        V2.copy(vd,this);
        V2.project(vd,v);
        return vd;
    };
    
    proto.toString = function(){
        var str = "[";
        str += this.x;
        str += ",";
        str += this.y;
        str += "]";
        return str;
    };
    
    V2.rotate = function(vd,rad){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var vx = vd.x * c - vd.y *s;
        var vy = vd.x * s + vd.y *c;
        vd.x = vx;
        vd.y = vy;
        return vd;
    };
        
    proto.rotate = function(rad){
        var vd = new V2();
        V2.copy(vd,this);
        V2.rotate(vd,rad);
        return vd;
    };
    
    V2.lerp = function(vd,v,alpha){
        var invAlpha = 1- alpha;
        vd.x = vd.x * invAlpha + v.x * alpha;
        vd.y = vd.y * invAlpha + v.y * alpha;
        return vd;
    };

    proto.lerp = function(v,alpha){
        var vd = new V2();
        V2.copy(vd,this);
        V2.lerp(vd,v,alpha);
        return vd;
    };
    
    V2.azimuth = function(v){
        return Math.atan2(v.y,v.x);
    };

    proto.azimuth = function(){
        return Math.atan2(this.y,this.x);
    };
    
    V2.equals = function(u,v){
        return Math.abs(u.x-v.x) <= V2.epsilon && Math.abs(u.y - v.y) <= V2.epsilon;
    };

    proto.equals = function(v){
        return V2.equals(this,v);
    };
    
    V2.round  = function(vd){
        vd.x = Math.round(vd.x);
        vd.y = Math.round(vd.y);
        return vd;
    };

    proto.round = function(){
        return new V2(Math.round(this.x),Math.round(this.y));
    };

    V2.floor = function(vd){
        vd.x = Math.floor(vd.x);
        vd.y = Math.floor(vd.y);
        return vd;
    };

    proto.floor = function(){
        return new V2(Math.floor(this.x),Math.floor(this.y));
    };

    V2.ceil = function(vd){
        vd.x = Math.ceil(vd.x);
        vd.y = Math.ceil(vd.y);
        return vd;
    };

    proto.ceil = function(){
        return new V2(Math.ceil(this.x),Math.ceil(this.y));
    };

    V2.crossArea = function(u,v){
        return u.x * v.y - u.y * v.y;
    };

    proto.crossArea = function(v){
        return this.x * v.y - this.y * v.x;
    };

    V2.reflect = function(vd,vn){
        V2.copy(tmp,vn);
        V2.normalize(tmp);
        var dot2 = V2.dot(vd,tmp) * 2;
        vd.x = vd.x - vn.x * dot2;
        vd.y = vd.y - vn.y * dot2;
        return vd;
    };

    proto.reflect = function(vn){
        var vd = new V2();
        V2.copy(vd,this);
        V2.reflect(vd,vn);
        return vd;
    };

    V2.toArray = function(array,v,offset){
        offset = offset || 0;
        array[offset]   = v.x;
        array[offset+1] = v.y;
        return array;
    };

    proto.array   = function(){
        return [this.x,this.y];
    };

    proto.float32 = function(){
        var a = new Float32Array(2);
        a[0] = this.x;
        a[1] = this.y;
        return a;
    };

})(exports);

/* ------------------------------ 3D Vectors -------------------------------- */

(function(exports){

    function V3(){
        var self = this;
        if(this.constructor !== V3){
            self = new V3();
        }
        if(arguments.length === 0){
            self.x = 0;
            self.y = 0;
            self.z = 0;
        }else if (arguments.length === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                self.x = arg;
                self.y = arg;
                self.z = arg;
            }else if(arg[0] !== undefined){
                self.x = arg[0] || 0;
                self.y = arg[1] || 0;
                self.z = arg[2] || 0;
            }else{
            	self.x = arg.x || 0;
            	self.y = arg.y || 0;
            	self.z = arg.z || 0;
            }
        }else if (arguments.length === 3){
            self.x = arguments[0];
            self.y = arguments[1];
            self.z = arguments[2];
        }else{
            throw new Error("new V3(): wrong number of arguments:"+arguments.length);
        }
        return self;
    };

    V3.zero = new V3();
    V3.x    = new V3(1,0,0);
    V3.y    = new V3(0,1,0);
    V3.z    = new V3(0,0,1);
    V3.epsilon  = 0.00000001;    
    V3.tmp  = new V3();
    V3.tmp1 = new V3();
    V3.tmp2 = new V3();

    var tmp  = new V3();
    var tmp1 = new V3();
    var tmp2 = new V3();
    
    exports.V3 = V3;

    var proto = V3.prototype;

    V3.randomPositive = function(){
        return new V3(Math.random(), Math.random(), Math.random());
    };

    V3.random = function(){
        return new V3( Math.random()*2 - 1, 
                         Math.random()*2 - 1, 
                         Math.random()*2 - 1 );
    };

    V3.randomSphere = function(){
        var v = new V3();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
            v.z = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    V3.isZero  = function(v){
        return v.x === 0 && v.y === 0 && v.z === 0;
    };

    proto.isZero = function(){
        return V3.isZero(this);
    };
    
    V3.len  = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    };

    proto.len = function(){
        return V3.len(this);
    };
    
    V3.lenSq = function(v){
        return v.x*v.x + v.y*v.y + v.z*v.z;
    };

    proto.lenSq = function(){
        return V3.lenSq(this);
    };

    V3.dist = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };
    
    proto.dist = function(v){
        return V3.dist(this,v);
    };

    V3.distSq = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return dx*dx + dy*dy + dz*dz;
    };

    proto.distSq = function(v){
        return V3.distSq(this,v);
    };

    V3.dot = function(u,v){
        return u.x*v.x + u.y*v.y + u.z*v.z;
    };

    proto.dot = function(v){
        return V3.dot(this,v);
    };
    
    V3.angle = function(u,v){
        return math.acos(V3.dot(u,v)/(V3.len(u)*V3.len(v)));
    };

    proto.angle = function(v){
        return V3.angle(this,v);
    };

    V3.set = function(vd,vx,vy,vz){
        vd.x = vx;
        vd.y = vy;
        vd.z = vz;
        return vd;
    };

    V3.setArray = function(vd,array,offset){
        offset = offset || 0;
        vd.x = array[offset];
        vd.y = array[offset + 1];
        vd.z = array[offset + 2];
        return vd;
    };

    V3.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
        vd.z = v.z;
        return vd;
    };

    proto.clone = function(){
        var vd = new V3();
        V3.copy(vd,this);
        return vd;
    };

    V3.add = function(vd,v){
        vd.x += v.x;
        vd.y += v.y;
        vd.z += v.z;
        return vd;
    };

    proto.add = function(v){
        return new V3(this.x + v.x, this.y + v.y, this.z + v.z);
    };

    V3.sub = function(vd,v){
        vd.x -= v.x;
        vd.y -= v.y;
        vd.z -= v.z;
        return vd;
    };

    proto.sub = function(v){
        return new V3(this.x - v.x, this.y - v.y, this.z - v.z);
    };

    V3.mult = function(vd,v){
        vd.x *= v.x;
        vd.y *= v.y;
        vd.z *= v.z;
        return vd;
    };

    proto.mult = function(v){
        return new V3(this.x * v.x, this.y * v.y, this.z * v.z);
    };

    V3.scale = function(vd,f){
        vd.x *= f;
        vd.y *= f;
        vd.z *= f;
        return vd;
    };

    proto.scale = function(f){
        return new V3(this.x * f, this.y * f, this.z * f);
    };

    V3.neg = function(vd){
        vd.x = -vd.x;
        vd.y = -vd.y;
        vd.z = -vd.z;
        return vd;
    };

    proto.neg = function(){
        return new V3(-this.x, - this.y, - this.z);
    };

    V3.div = function(vd,v){
        vd.x = vd.x/v.x;
        vd.y = vd.y/v.y;
        vd.z = vd.z/v.z;
        return vd;
    };
    
    proto.div = function(v){
        return new V3(this.x/v.x, this.y/v.y, this.z/v.z);
    };

    V3.invert = function(vd){
        vd.x = 1.0/vd.x;
        vd.y = 1.0/vd.y;
        vd.z = 1.0/vd.z;
        return vd;
    };

    proto.invert = function(){
        return new V3(1.0/this.x, 1.0/this.y, 1.0/this.z);
    };

    V3.pow = function(vd,pow){
        vd.x = Math.pow(vd.x,pow);
        vd.y = Math.pow(vd.y,pow);
        vd.z = Math.pow(vd.z,pow);
        return vd;
    };

    proto.pow = function(pow){
        return new V3( Math.pow(this.x,pow),
                       Math.pow(this.y,pow), 
                       Math.pow(this.z,pow) );
    };

    V3.sq = function(vd){
        vd.x = vd.x * vd.x;
        vd.y = vd.y * vd.y;
        vd.z = vd.z * vd.z;
        return vd;
    };

    proto.sq = function(){
        return new V3( this.x * this.x,
                       this.y * this.y,
                       this.z * this.z );
    };

    V3.normalize = function(vd){
        var len = V3.lenSq(vd);
        if(len === 0){
            vd.x = 1;
            vd.y = 0;
            vd.z = 0;
        }else if(len !== 1){
            len = 1 / Math.sqrt(len);
            vd.x = vd.x * len;
            vd.y = vd.y * len;
            vd.z = vd.z * len;
        }
        return vd;
    };

    proto.normalize = function(){
        var vd   = new V3();
        V3.copy(vd,this);
        V3.normalize(vd);
        return vd;
    };
    
    V3.setLen = function(vd,l){
        V3.normalize(vd);
        V3.scale(vd,l);
        return vd;
    };

    proto.setLen = function(l){
        var vd = new V3();
        V3.copy(vd,this);
        V3.setLen(vd,l);
        return vd;
    };

    V3.project = function(vd,v){
        V3.copy(tmp,v);
        V3.normalize(tmp);
        var dot = V3.dot(vd,tmp);
        V3.copy(vd,tmp);
        V3.setLen(vd,dot);
        return vd;
    };

    proto.project = function(v){
        var vd = new V3();
        V3.copy(vd,this);
        V3.project(vd,v);
        return vd;
    };

    proto.toString = function(){
        var str = "[";
        str += this.x ;
        str += "," ;
        str += this.y ;
        str += "," ;
        str += this.z ;
        str += "]" ;
        return str;
    };

    V3.lerp = function(vd,v,f){
        var nf = 1.0 - f;
        vd.x = vd.x*nf + v.x*f;
        vd.y = vd.y*nf + v.y*f;
        vd.z = vd.z*nf + v.z*f;
        return vd;
    };

    proto.lerp = function(v,f){
        var nf = 1.0 - f;
        return new V3( this.x*nf + v.x*f,
                       this.y*nf + v.y*f,
                       this.z*nf + v.z*f );

    };

    V3.equals  = function(u,v){
        return Math.abs(u.x - v.x) <= V3.epsilon &&
               Math.abs(u.y - v.y) <= V3.epsilon &&
               Math.abs(u.z - v.z) <= V3.epsilon;
    };

    proto.equals = function(v){
        return V3.equals(this,v);
    };
    
    V3.round  = function(vd){
        vd.x = Math.round(vd.x);
        vd.y = Math.round(vd.y);
        vd.z = Math.round(vd.z);
        return vd;
    };

    proto.round = function(){
        return new V3( Math.round(this.x),
                       Math.round(this.y), 
                       Math.round(this.z) );
    };

    V3.reflect = function(vd,vn){
        V3.copy(tmp,vn);
        V3.normalize(tmp);
        var dot2 = V3.dot(vd,tmp) * 2;
        vd.x = vd.x - tmp.x * dot2;
        vd.y = vd.y - tmp.y * dot2;
        vd.z = vd.z - tmp.z * dot2;
        return vd;
    };

    proto.reflect = function(vn){
        var vd = new V3();
        V3.copy(vd,this);
        V3.reflect(vd,vn);
        return vd;
    };

    V3.cross  = function(vd,v){
        var vdx = vd.x, vdy = vd.y, vdz = vd.z;
        vd.x = vdy*v.z - vdz*v.y;
        vd.y = vdz*v.x - vdx*v.z;
        vd.z = vdx*v.y - vdy*v.x;
        return vd;
    }

    proto.cross = function(v){
        return new V3( this.y*v.z - this.z*v.y,
                       this.z*v.x - this.x*v.z,
                       this.x*v.y - this.y*v.x );
    };

    proto.i       = function(i){
        if(i === 0){
            return this.x;
        }else if(i === 1){
            return this.y;
        }else if(i === 2){
            return this.z;
        }else{
            return 0.0;
        }
    };
    
    V3.toArray = function(array,v,offset){
        offset = offset || 0;
        array[offset]     = v.x;
        array[offset + 1] = v.y;
        array[offset + 2] = v.z;
        return array;
    };

    proto.array   = function(){
        return [this.x,this.y,this.z];
    };

    proto.float32 = function(){
        var a = new Float32Array(3);
        a[0] = this.x;
        a[1] = this.y;
        a[2] = this.z;
        return a;
    };

})(exports);

/* ------------------------------ 3x3 Matrix -------------------------------- */

(function(exports){

    var V3 = exports.V3;
        
    // 0 3 6 | xx xy xz
    // 1 4 7 | yx yy yz
    // 2 5 8 | zx zy zz
    
    var setArray = function(md,array,offset){
        offset = offset || 0;
        md.xx = array[offset];
        md.xy = array[offset + 3];
        md.xz = array[offset + 6];
        md.yx = array[offset + 1];
        md.yy = array[offset + 4];
        md.yz = array[offset + 7];
        md.zx = array[offset + 2];
        md.zy = array[offset + 5];
        md.zz = array[offset + 8];
        return md;
    };

    var set = function(md,components_){
        setArray(md,arguments,1);
        return md;
    };

    function Mat3(){
        var self = this;
        if(this.constructor !== Mat3){
            self = new Mat3();
        }
        var alen = arguments.length;
        if(alen === 0){
            self.xx = 1;
            self.xy = 0;
            self.xz = 0;
            self.yx = 0;
            self.yy = 1;
            self.yz = 0;
            self.zx = 0;
            self.zy = 0;
            self.zz = 1;
        }else if (alen === 1){
            var arg = arguments[0];
            if( typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else if(   typeof arg.rotate === 'number'
                     || typeof arg.scale === 'number'
                     || typeof arg.translate === 'number'){
                Mat3.setTransform(self,
                        arg.translate || new V2(),
                        arg.scale|| new V2(1,1),
                        arg.rotate || 0
                );
            }else{
                self.xx = arg.xx || 0;
                self.xy = arg.xy || 0;
                self.xz = arg.xz || 0;
                self.yx = arg.yx || 0;
                self.yy = arg.yy || 0;
                self.yz = arg.yz || 0;
                self.zx = arg.zx || 0;
                self.zy = arg.zy || 0;
                self.zz = arg.zz || 0;
            }
        }else if (alen === 9){
            setArray(self,arguments);
        }else{
            throw new Error('wrong number of arguments:'+alen);
        }
        return self;
    };

    exports.Mat3 = Mat3;

    Mat3.epsilon  = 0.00000001;    
    Mat3.id       = new Mat3();
    Mat3.zero     = new Mat3(0,0,0,0,0,0,0,0,0);
    Mat3.tmp      = new Mat3();
    Mat3.tmp1     = new Mat3();
    Mat3.tmp2     = new Mat3();

    var tmp = new Mat3();

    var proto = Mat3.prototype;

    function epsilonEquals(a,b){  return Math.abs(a-b) <= Mat3.epsilon };

    Mat3.equals  = function(m,n){
        return epsilonEquals(m.xx, n.xx) &&
               epsilonEquals(m.xy, n.xy) &&
               epsilonEquals(m.xz, n.xz) &&
               epsilonEquals(m.yx, n.yx) &&
               epsilonEquals(m.yy, n.yy) &&
               epsilonEquals(m.yz, n.yz) &&
               epsilonEquals(m.zx, n.zx) &&
               epsilonEquals(m.zy, n.zy) &&
               epsilonEquals(m.zz, n.zz);
    };
        
    proto.equals = function(mat){
        return Mat3.equals(this,mat);
    };

    Mat3.copy = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.xz = m.xz;
        md.yx = m.yx;
        md.yy = m.yy;
        md.yz = m.yz;
        md.zx = m.zx;
        md.zy = m.zy;
        md.zz = m.zz;
        return md;
    };

    Mat3.set = set;

    Mat3.setArray = setArray;

    Mat3.setId = function(md){
        md.xx = 1;
        md.xy = 0;
        md.xz = 0;
        md.yx = 0;
        md.yy = 1;
        md.yz = 0;
        md.zx = 0;
        md.zy = 0;
        md.zz = 1;
        return md;
    };

    Mat3.setZero = function(md){
        Mat3.copy(md,Mat3.zero);
        return md;
    };

    proto.clone = function(){
        var m = new Mat3();
        Mat3.copy(m,this);
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",\n  ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",\n  ";
        str += this.zx + ",";
        str += this.zy + ",";
        str += this.zz + "]";
        return str;
    };

    Mat3.add = function(md,m){
        md.xx += m.xx;
        md.xy += m.xy;
        md.xz += m.xz;
        md.yx += m.yx;
        md.yy += m.yy;
        md.yz += m.yz;
        md.zx += m.zx;
        md.zy += m.zy;
        md.zz += m.zz;
        return md;
    };

    proto.add = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.add(md,mat);
        return md;
    };

    Mat3.sub = function(md,m){
        md.xx -= m.xx;
        md.xy -= m.xy;
        md.xz -= m.xz;
        md.yx -= m.yx;
        md.yy -= m.yy;
        md.yz -= m.yz;
        md.zx -= m.zx;
        md.zy -= m.zy;
        md.zz -= m.zz;
        return md;
    };

    proto.sub = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.sub(md,mat);
        return md;
    };

    Mat3.neg = function(md){
        md.xx = -md.xx;
        md.xy = -md.xy;
        md.xz = -md.xz;
        md.yx = -md.yx;
        md.yy = -md.yy;
        md.yz = -md.yz;
        md.zx = -md.zx;
        md.zy = -md.zy;
        md.zz = -md.zz;
    };

    proto.neg = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.neg(md);
        return md;
    };

    Mat3.tr = function(md){
        Mat3.copy(tmp,m);
        md.xx = tmp.xx;
        md.xy = tmp.yx;
        md.xz = tmp.zx;
        md.yx = tmp.xy;
        md.yy = tmp.yy;
        md.yz = tmp.zy;
        md.zx = tmp.xz;
        md.zy = tmp.yz;
        md.zz = tmp.zz;
        return md;
    };

    proto.tr = function(){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.tr(md);
        return md;
    };

    Mat3.mult = function(md,m){
        var b = Mat3.copy(tmp,md);
        var a = m;
        if(md === m){
            b = a;
        }
        md.xx = a.xx*b.xx + a.xy*b.yx + a.xz*b.zx; 
        md.xy = a.xx*b.xy + a.xy*b.yy + a.xz*b.zy; 
        md.xz = a.xx*b.xz + a.xy*b.yz + a.xz*b.zz; 

        md.yx = a.yx*b.xx + a.yy*b.yx + a.yz*b.zx; 
        md.yy = a.yx*b.xy + a.yy*b.yy + a.yz*b.zy; 
        md.yz = a.yx*b.xz + a.yy*b.yz + a.yz*b.zz; 

        md.zx = a.zx*b.xx + a.zy*b.yx + a.zz*b.zx; 
        md.zy = a.zx*b.xy + a.zy*b.yy + a.zz*b.zy; 
        md.zz = a.zx*b.xz + a.zy*b.yz + a.zz*b.zz; 
        return md;
    };

    Mat3.multFac  = function(md,fac){
        md.xx *= fac;
        md.xy *= fac;
        md.xz *= fac;
        md.yx *= fac;
        md.yy *= fac;
        md.yz *= fac;
        md.zx *= fac;
        md.zy *= fac;
        md.zz *= fac;
        return md;
    };

    Mat3.multV3 = function(vd,m){
        var vx = vd.x, vy = vd.y, vz = vd.z;
        vd.x = m.xx * vx + m.xy * vy + m.xz * vz;
        vd.y = m.yx * vx + m.yy * vy + m.yz * vz;
        vd.z = m.zx * vx + m.zy * vy + m.zz * vz;
        return vd;
    };

    Mat3.multV2 = function(vd,m){
        var vx = vd.x, vy = vd.y;
        var d  = 1.0 / ( vx * m.zx + vy * m.zy + m.zz);
        vd.x = d * ( m.xx * vx + m.xy * vy + m.xz );
        vd.y = d * ( m.yx * vx + m.yy * vy + m.yz );
        return vd;
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var md = new Mat3();
            Mat3.copy(md,this);
            Mat3.multFac(md,arg);
            return md;
        }else if(arg instanceof Mat3){
            var md = new Mat3();
            Mat3.copy(md,this);
            Mat3.mult(md,arg);
            return md;
        }else if(arg instanceof V2){
            var vd = new V2();
            V2.copy(vd,arg);
            Mat3.multV2(vd,this);
            return vd;
        }else if(arg instanceof V3){
            var vd = new V3();
            V3.copy(vd,arg);
            Mat3.multV3(vd,this);
            return vd;
        }else{
            throw new Error('Mat3: mult(), cannot multiply with an object of this type:',arg);
        }
    };

    Mat3.setRotate = function(md,angle){
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        Mat3.setId(md);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat3.rotate = function(angle){
        var md = new Mat3();
        Mat3.setRotate(md,angle);
        return md;
    };

    Mat3.setSkewX = function(md,shear){
        Mat3.setId(md);
        md.xy = shear;
        return md;
    };
    
    Mat3.shearX = function(shear){
        var md = new Mat3();
        md.xy = shear;
        return md;
    };

    Mat3.setSkewY = function(md,shear){
        Mat3.setId(md);
        md.yx = shear;
        return md;
    };
    
    Mat3.shearY = function(shear){
        var md = new Mat3();
        md.yx = shear;
        return md;
    };

    Mat3.setScale = function(md,scale){
        Mat3.setId(md);
        md.xx = scale.x;
        md.yy = scale.y;
        return md;
    };

    Mat3.scale    = function(sv){
        var md = new Mat3();
        Mat3.setScale(md,sv);
        return md;
    };

    Mat3.setTranslate = function(md,vec){
        Mat3.setId(md);
        md.xz = vec.x;
        md.yz = vec.y;
        return md;
    };

    Mat3.translate = function(v){
        var md = new Mat3();
        Mat3.setTranslate(md,v);
        return md;
    };

    var tmp_tr = new Mat3();
    Mat3.setTransform = function(md,pos,scale,angle){
        Mat3.setScale(md,scale); //FIXME
        Mat3.setRotate(tmp_tr,angle);
        Mat3.mult(md,tmp_tr);
        Mat3.setTranslate(tmp_tr,pos);
        Mat3.mult(md,tmp_tr);
        return md;
    };

    Mat3.transform   = function(pos,scale,angle){
        var md = new Mat3();
        Mat3.setTransform(md,pos,scale,angle);
        return md;
    };

    proto.getScale = function(){};
    proto.getRotate = function(){};
    proto.getTranslate = function(){};

    Mat3.det = function(m){
        return m.xx*(m.zz*m.yy-m.zy*m.yz) - m.yx*(m.zz*m.xy-m.zy*m.xz) + m.zx*(m.yz*m.xy-m.yy*m.xz);
    };

    proto.det = function(){
        return Mat3.det(this);
    };

    Mat3.invert  = function(md){
        var det = Mat3.det(md);
        var m = Mat3.copy(tmp,md);

        // http://www.dr-lex.be/random/matrix_inv.html
        // | m.xx m.xy m.xz |               |   m.zz m.yy-m.zy m.yz  -(m.zz m.xy-m.zy m.xz)   m.yz m.xy-m.yy m.xz  |
        // | m.yx m.yy m.yz |    =  1/DET * | -(m.zz m.yx-m.zx m.yz)   m.zz m.xx-m.zx m.xz  -(m.yz m.xx-m.yx m.xz) |
        // | m.zx m.zy m.zz |               |   m.zy m.yx-m.zx m.yy  -(m.zy m.xx-m.zx m.xy)   m.yy m.xx-m.yx m.xy  |
        
        det = 1 / det;

        md.xx =  det*( m.zz*m.yy-m.zy*m.yz );
        md.xy = -det*( m.zz*m.xy-m.zy*m.xz );
        md.xz =  det*( m.yz*m.xy-m.yy*m.xz );
        
        md.yx = -det*( m.zz*m.yx-m.zx*m.yz );
        md.yy =  det*( m.zz*m.xx-m.zx*m.xz );
        md.yz = -det*( m.yz*m.xx-m.yx*m.xz );

        md.zx =  det*( m.zy*m.yx-m.zx*m.yy );
        md.zy = -det*( m.zy*m.xx-m.zx*m.xy );
        md.zz =  det*( m.yy*m.xx-m.yx*m.xy );
        return md;
    };

    proto.invert = function(){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.invert(md);
        return md;
    };

    proto.row = function(i){
        var m = this;
        if(i === 0){
            return new V3(m.xx,m.xy,m.xz);
        }else if(i === 1){
            return new V3(m.yx,m.yy,m.yz);
        }else if(i === 2){
            return new V3(m.zx,m.zy,m.zz);
        }
    };
    
    proto.col = function(j){
        var m = this;
        if(j === 0){
            return new V3(m.xx,m.yx,m.zx);
        }else if(j === 1){
            return new V3(m.xy,m.yy,m.zy);
        }else if(j === 2){
            return new V3(m.xz,m.yz,m.zz);
        }
    };

    var map = [ ['xx','xy','xz'],
                ['yx','yy','yz'],
                ['zx','zy','zz'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

    Mat3.toArray = function(array,m,offset){
        offset = offset || 0;
        // 0 3 6 | xx xy xz
        // 1 4 7 | yx yy yz
        // 2 5 8 | zx zy zz
        array[0+offset] = m.xx;
        array[1+offset] = m.yx;
        array[2+offset] = m.zx;
        array[3+offset] = m.xy;
        array[4+offset] = m.yy;
        array[5+offset] = m.zy;
        array[6+offset] = m.xz;
        array[7+offset] = m.yz;
        array[8+offset] = m.zz;
    };

    proto.array = function(){
        var array = [];
        Mat3.toArray(array,this);
        return array;
    };

    proto.float32 = function(){
        var array = Float32Array(9);
        Mat3.toArray(array,this);
        return array;
    };

})(exports);

/* ------------------------------ 4x4 Matrix -------------------------------- */

(function(exports){

    var V3 = exports.V3;


    var setArray = function(md,array,offset){

        // 0 4 8  12 | xx xy xz xw
        // 1 5 9  13 | yx yy yz yw
        // 2 6 10 14 | zx zy zz zw
        // 3 7 11 15 | wx wy wz ww
        
        md.xx = array[0];
        md.yx = array[1];
        md.zx = array[2];
        md.wx = array[3];
        
        md.xy = array[4];
        md.yy = array[5];
        md.zy = array[6];
        md.wy = array[7];
        
        md.xz = array[8];
        md.yz = array[9];
        md.zz = array[10];
        md.wz = array[11];
        
        md.xw = array[12];
        md.yw = array[13];
        md.zw = array[14];
        md.ww = array[15];
        return md;
    };

    var set = function(md,components_){
        setArray(md,arguments,1);
        return md;
    };

    function Mat4(arg){
        var self = this;
        if(this.constructor !== Mat4){
            self = new Mat4();
        }
        var alen = arguments.length;
        if(alen === 0){
            self.xx = 1;
            self.xy = 0;
            self.xz = 0;
            self.xw = 0;
            self.yx = 0;
            self.yy = 1;
            self.yz = 0;
            self.yw = 0;
            self.zx = 0;
            self.zy = 0;
            self.zz = 1;
            self.zw = 0;
            self.wx = 0;
            self.wy = 0;
            self.wz = 0;
            self.ww = 1;
        }else if(alen === 1){
            if(typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else{
                Mat4.copy(self,arg);
            }
        }else if(alen === 16){
            setArray(self,arguments);
        }else{
            throw new Error("wrong number of arguments:"+alen);
        }
        return self;
    };

    var tmp   = new Mat4();

    exports.Mat4 = Mat4;

    Mat4.epsilon  = 0.00000001;    
    Mat4.id       = new Mat4();
    Mat4.zero     = new Mat4(0,0,0,0,
                             0,0,0,0,
                             0,0,0,0,
                             0,0,0,0);
    Mat4.tmp  = new Mat4();
    Mat4.tmp1 = new Mat4();
    Mat4.tmp2 = new Mat4();

    var proto = Mat4.prototype;

    function epsilonEquals(a,b){  return Math.abs(a-b) <= Mat4.epsilon };

    Mat4.equals  = function(m,n){
        return epsilonEquals(m.xx, n.xx) &&
               epsilonEquals(m.xy, n.xy) &&
               epsilonEquals(m.xz, n.xz) &&
               epsilonEquals(m.xw, n.xw) &&
               epsilonEquals(m.yx, n.yx) &&
               epsilonEquals(m.yy, n.yy) &&
               epsilonEquals(m.yz, n.yz) &&
               epsilonEquals(m.yw, n.yw) &&
               epsilonEquals(m.zx, n.zx) &&
               epsilonEquals(m.zy, n.zy) &&
               epsilonEquals(m.zz, n.zz) &&
               epsilonEquals(m.zw, n.zw) &&
               epsilonEquals(m.wx, n.wx) &&
               epsilonEquals(m.wy, n.wy) &&
               epsilonEquals(m.wz, n.wz) &&
               epsilonEquals(m.ww, n.ww);
    };
        
    proto.equals = function(mat){
        return Mat4.equals(this,mat);
    };

    Mat4.set  = set;

    Mat4.setArray  = setArray;

    Mat4.copy = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.xz = m.xz;
        md.xw = m.xw;
        
        md.yx = m.yx;
        md.yy = m.yy;
        md.yz = m.yz;
        md.yw = m.yw;
        
        md.zx = m.zx;
        md.zy = m.zy;
        md.zz = m.zz;
        md.zw = m.zw;
        
        md.wx = m.wx;
        md.wy = m.wy;
        md.wz = m.wz;
        md.ww = m.ww;
        return md;
    };

    proto.clone = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        return md;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",";
        str += this.xw + ",\n ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",";
        str += this.yw + ",\n ";
        str += this.zx + ",";
        str += this.zy + ",";
        str += this.zz + ",";
        str += this.zw + ",\n ";
        str += this.wx + ",";
        str += this.wy + ",";
        str += this.wz + ",";
        str += this.ww + "]";
        return str;
    };

    Mat4.add = function(md,m){
        md.xx += m.xx;
        md.xy += m.xy;
        md.xz += m.xz;
        md.xw += m.xw;
        md.yx += m.yx;
        md.yy += m.yy;
        md.yz += m.yz;
        md.yw += m.yw;
        md.zx += m.zx;
        md.zy += m.zy;
        md.zz += m.zz;
        md.zw += m.zw;
        md.wx += m.wx;
        md.wy += m.wy;
        md.wz += m.wz;
        md.ww += m.ww;
        return md;
    };

    proto.add = function(mat){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.add(md,mat);
        return md;
    };

    Mat4.sub = function(md,m){
        md.xx -= m.xx;
        md.xy -= m.xy;
        md.xz -= m.xz;
        md.xw -= m.xw;
        md.yx -= m.yx;
        md.yy -= m.yy;
        md.yz -= m.yz;
        md.yw -= m.yw;
        md.zx -= m.zx;
        md.zy -= m.zy;
        md.zz -= m.zz;
        md.zw -= m.zw;
        md.wx -= m.wx;
        md.wy -= m.wy;
        md.wz -= m.wz;
        md.ww -= m.ww;
        return md;
    };

    proto.sub = function(mat){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.sub(md,mat);
        return md;
    };

    Mat4.neg = function(md){
        md.xx = -md.xx;
        md.xy = -md.xy;
        md.xz = -md.xz;
        md.xw = -md.xw;
        md.yx = -md.yx;
        md.yy = -md.yy;
        md.yz = -md.yz;
        md.yw = -md.yw;
        md.zx = -md.zx;
        md.zy = -md.zy;
        md.zz = -md.zz;
        md.zw = -md.zw;
        md.wx = -md.wx;
        md.wy = -md.wy;
        md.wz = -md.wz;
        md.ww = -md.ww;
        return md;
    };

    proto.neg = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.neg(md);
        return md;
    };

    Mat4.tr = function(md){
        var m = Mat4.copy(tmp,md);
        md.xx = m.xx;
        md.xy = m.yx;
        md.xz = m.zx;
        md.xw = m.wx;
        md.yx = m.xy;
        md.yy = m.yy;
        md.yz = m.zy;
        md.yw = m.wy;
        md.zx = m.xz;
        md.zy = m.yz;
        md.zz = m.zz;
        md.zw = m.wz;
        md.wx = m.xw;
        md.wy = m.yw;
        md.wz = m.zw;
        md.ww = m.ww;
        return md;
    };

    proto.tr = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.tr(md);
        return md;
    };
    
    Mat4.mult = function(md,m){
        var b = Mat4.copy(tmp,md);
        var a = m;
        if(md === m){
            a = b;
        }
		md.xx = a.xx * b.xx + a.xy * b.yx + a.xz * b.zx + a.xw * b.wx;
		md.xy = a.xx * b.xy + a.xy * b.yy + a.xz * b.zy + a.xw * b.wy;
		md.xz = a.xx * b.xz + a.xy * b.yz + a.xz * b.zz + a.xw * b.wz;
		md.xw = a.xx * b.xw + a.xy * b.yw + a.xz * b.zw + a.xw * b.ww;

		md.yx = a.yx * b.xx + a.yy * b.yx + a.yz * b.zx + a.yw * b.wx;
		md.yy = a.yx * b.xy + a.yy * b.yy + a.yz * b.zy + a.yw * b.wy;
		md.yz = a.yx * b.xz + a.yy * b.yz + a.yz * b.zz + a.yw * b.wz;
		md.yw = a.yx * b.xw + a.yy * b.yw + a.yz * b.zw + a.yw * b.ww;

		md.zx = a.zx * b.xx + a.zy * b.yx + a.zz * b.zx + a.zw * b.wx;
		md.zy = a.zx * b.xy + a.zy * b.yy + a.zz * b.zy + a.zw * b.wy;
		md.zz = a.zx * b.xz + a.zy * b.yz + a.zz * b.zz + a.zw * b.wz;
		md.zw = a.zx * b.xw + a.zy * b.yw + a.zz * b.zw + a.zw * b.ww;

		md.wx = a.wx * b.xx + a.wy * b.yx + a.wz * b.zx + a.ww * b.wx;
		md.wy = a.wx * b.xy + a.wy * b.yy + a.wz * b.zy + a.ww * b.wy;
		md.wz = a.wx * b.xz + a.wy * b.yz + a.wz * b.zz + a.ww * b.wz;
		md.ww = a.wx * b.xw + a.wy * b.yw + a.wz * b.zw + a.ww * b.ww;
        return md;
    };

    Mat4.multFac  = function(md,fac){
        md.xx *= fac;
        md.xy *= fac;
        md.xz *= fac;
        md.xw *= fac;
        md.yx *= fac;
        md.yy *= fac;
        md.yz *= fac;
        md.yw *= fac;
        md.zx *= fac;
        md.zy *= fac;
        md.zz *= fac;
        md.zw *= fac;
        md.wx *= fac;
        md.wy *= fac;
        md.wz *= fac;
        md.ww *= fac;
        return md;
    };

    Mat4.multV3 = function(vd,m){
        var vx = vd.x, vy = vd.y, vz = vd.z;
        var  d = 1.0 / ( m.wx * vx + m.wy * vy + m.wz * vz + m.ww);
        vd.x = ( m.xx * vx + m.xy * vy + m.xz * vz + m.xw  ) * d;
        vd.y = ( m.yx * vx + m.yy * vy + m.yz * vz + m.yw  ) * d;
        vd.z = ( m.zx * vx + m.zy * vy + m.zz * vz + m.zw  ) * d;
        return vd;
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var md = new Mat4();
            Mat4.copy(md,this);
            Mat4.multFac(md,arg);
            return md;
        }else if(arg instanceof Mat4){
            var md = new Mat4();
            Mat4.copy(md,this);
            Mat4.mult(md,arg);
            return md;
        }else if(arg instanceof V3){
            var vd = new V3();
            V3.copy(vd,arg);
            Mat4.multV3(vd,this);
            return vd;
        }else{
            throw new Error('cannot multiply Mat4 with object of type:',typeof(arg));
        }
    };

    Mat4.det = function(m){
		return (
			m.xw * m.yz * m.zy * m.wx-
			m.xz * m.yw * m.zy * m.wx-
			m.xw * m.yy * m.zz * m.wx+
			m.xy * m.yw * m.zz * m.wx+

			m.xz * m.yy * m.zw * m.wx-
			m.xy * m.yz * m.zw * m.wx-
			m.xw * m.yz * m.zx * m.wy+
			m.xz * m.yw * m.zx * m.wy+

			m.xw * m.yx * m.zz * m.wy-
			m.xx * m.yw * m.zz * m.wy-
			m.xz * m.yx * m.zw * m.wy+
			m.xx * m.yz * m.zw * m.wy+

			m.xw * m.yy * m.zx * m.wz-
			m.xy * m.yw * m.zx * m.wz-
			m.xw * m.yx * m.zy * m.wz+
			m.xx * m.yw * m.zy * m.wz+

			m.xy * m.yx * m.zw * m.wz-
			m.xx * m.yy * m.zw * m.wz-
			m.xz * m.yy * m.zx * m.ww+
			m.xy * m.yz * m.zx * m.ww+

			m.xz * m.yx * m.zy * m.ww-
			m.xx * m.yz * m.zy * m.ww-
			m.xy * m.yx * m.zz * m.ww+
			m.xx * m.yy * m.zz * m.ww
		);
    };

    proto.det = function(){
        return Mat4.det(this);
    }

    Mat4.invert  = function(md){
        var det = Mat4.det(md);
        var m   = Mat4.copy(tmp,md);

        det = 1 / det;
		md.xx = ( m.yz*m.zw*m.wy - m.yw*m.zz*m.wy + m.yw*m.zy*m.wz - m.yy*m.zw*m.wz - m.yz*m.zy*m.ww + m.yy*m.zz*m.ww ) * det;
		md.xy = ( m.xw*m.zz*m.wy - m.xz*m.zw*m.wy - m.xw*m.zy*m.wz + m.xy*m.zw*m.wz + m.xz*m.zy*m.ww - m.xy*m.zz*m.ww ) * det;
		md.xz = ( m.xz*m.yw*m.wy - m.xw*m.yz*m.wy + m.xw*m.yy*m.wz - m.xy*m.yw*m.wz - m.xz*m.yy*m.ww + m.xy*m.yz*m.ww ) * det;
		md.xw = ( m.xw*m.yz*m.zy - m.xz*m.yw*m.zy - m.xw*m.yy*m.zz + m.xy*m.yw*m.zz + m.xz*m.yy*m.zw - m.xy*m.yz*m.zw ) * det;
		md.yx = ( m.yw*m.zz*m.wx - m.yz*m.zw*m.wx - m.yw*m.zx*m.wz + m.yx*m.zw*m.wz + m.yz*m.zx*m.ww - m.yx*m.zz*m.ww ) * det;
		md.yy = ( m.xz*m.zw*m.wx - m.xw*m.zz*m.wx + m.xw*m.zx*m.wz - m.xx*m.zw*m.wz - m.xz*m.zx*m.ww + m.xx*m.zz*m.ww ) * det;
		md.yz = ( m.xw*m.yz*m.wx - m.xz*m.yw*m.wx - m.xw*m.yx*m.wz + m.xx*m.yw*m.wz + m.xz*m.yx*m.ww - m.xx*m.yz*m.ww ) * det;
		md.yw = ( m.xz*m.yw*m.zx - m.xw*m.yz*m.zx + m.xw*m.yx*m.zz - m.xx*m.yw*m.zz - m.xz*m.yx*m.zw + m.xx*m.yz*m.zw ) * det;
		md.zx = ( m.yy*m.zw*m.wx - m.yw*m.zy*m.wx + m.yw*m.zx*m.wy - m.yx*m.zw*m.wy - m.yy*m.zx*m.ww + m.yx*m.zy*m.ww ) * det;
		md.zy = ( m.xw*m.zy*m.wx - m.xy*m.zw*m.wx - m.xw*m.zx*m.wy + m.xx*m.zw*m.wy + m.xy*m.zx*m.ww - m.xx*m.zy*m.ww ) * det;
		md.zz = ( m.xy*m.yw*m.wx - m.xw*m.yy*m.wx + m.xw*m.yx*m.wy - m.xx*m.yw*m.wy - m.xy*m.yx*m.ww + m.xx*m.yy*m.ww ) * det;
		md.zw = ( m.xw*m.yy*m.zx - m.xy*m.yw*m.zx - m.xw*m.yx*m.zy + m.xx*m.yw*m.zy + m.xy*m.yx*m.zw - m.xx*m.yy*m.zw ) * det;
		md.wx = ( m.yz*m.zy*m.wx - m.yy*m.zz*m.wx - m.yz*m.zx*m.wy + m.yx*m.zz*m.wy + m.yy*m.zx*m.wz - m.yx*m.zy*m.wz ) * det;
		md.wy = ( m.xy*m.zz*m.wx - m.xz*m.zy*m.wx + m.xz*m.zx*m.wy - m.xx*m.zz*m.wy - m.xy*m.zx*m.wz + m.xx*m.zy*m.wz ) * det;
		md.wz = ( m.xz*m.yy*m.wx - m.xy*m.yz*m.wx - m.xz*m.yx*m.wy + m.xx*m.yz*m.wy + m.xy*m.yx*m.wz - m.xx*m.yy*m.wz ) * det;
		md.ww = ( m.xy*m.yz*m.zx - m.xz*m.yy*m.zx + m.xz*m.yx*m.zy - m.xx*m.yz*m.zy - m.xy*m.yx*m.zz + m.xx*m.yy*m.zz ) * det;
        return md;
    };

    proto.invert = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.invert(md);
        return md;
    };

    var map = [ ['xx','xy','xz','xw'],
                ['yx','yy','yz','yw'],
                ['zx','zy','zz','zw'],
                ['wx','wy','wz','ww'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

    Mat4.setId = function(md){
        md.xx = 1;
        md.xy = 0;
        md.xz = 0;
        md.xw = 0;
        md.yx = 0;
        md.yy = 1;
        md.yz = 0;
        md.yw = 0;
        md.zx = 0;
        md.zy = 0;
        md.zz = 1;
        md.zw = 0;
        md.wx = 0;
        md.wy = 0;
        md.wz = 0;
        md.ww = 1;
        return md;
    };

    Mat4.setRotateX = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.yy = c;
        md.yz = -s;
        md.zy = s;
        md.zz = c;
        return md;
    };

    Mat4.rotateX = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.yy = c;
        md.yz = -s;
        md.zy = s;
        md.zz = c;
        return md;

    };
    Mat4.setRotateY = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xz = s;
        md.zx = -s;
        md.zz = c;
        return md;
    };
    Mat4.rotateY = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xz = s;
        md.zx = -s;
        md.zz = c;
        return md;
    };
    Mat4.setRotateZ = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat4.rotateZ = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat4.setRotateEuler  = function(md,X,Y,Z){
        Mat4.setRotateZ(md,Z);
        Mat4.setRotateY(tmp,Y);
        Mat4.mult(md,tmp);
        Mat4.setRotateX(tmp,X);
        Mat4.mult(md,tmp);
        return md;
    };
    
    Mat4.rotateEuler = function(X,Y,Z){
        var md = new Mat4();
        Mat4.setRotateEuler(md,X,Y,Z);
        return md;
    };
    
    Mat4.getEulerAngles = function(vd,m){
        vd.x = Math.atan2(m.zy,mzz);
        vd.y = Math.atan2(-m.zx,Math.sqrt(m.zy*m.zy+m.zz*m.zz));
        vd.z = Math.atan2(m.yx,m.xx);
        return vd;
    };
    
    proto.getEulerAngles = function(){
        var vd = new V3();
        Mat4.getEulerAngles(vd,this);
        return vd;
    };

    Mat4.setRotateAxis  = function(md,vec,angle){
        Mat4.setId(md);
        var u = vec;
        var c = Math.cos(angle);
        var nc = (1-c);
        var s = Math.sin(angle);

        md.xx = c + u.x*u.x*nc;
        md.xy = u.x*u.y*nc - u.z*s;
        md.xz = u.x*u.z*nc + u.y*s;
        
        md.yx = u.y*u.x*nc + u.z*s;
        md.yy = c + u.y*u.y*nc;
        md.yz = u.y*u.z*nc - u.x*s;

        md.zx = u.z*u.x*nc - u.y*s;
        md.zy = u.z*u.y*nc + u.x*s;
        md.zz = c + u.z*u.z*nc;
        return md;
    };

    Mat4.rotateAxis = function(vec,angle){
        var md = new Mat4();
        Mat4.setRotateAxis(md,vec,angle);
        return md;
    };
    
    Mat4.setRotateQuat = function(md,q){
        Mat4.setId(md);
        var x = q.x, y = q.y, z = q.z, w = q.w;
        md.xx = 1 - 2*y*y - 2*z*z;
        md.xy = 2*x*y - 2*w*z;
        md.xz = 2*x*z + 2*w*y;
        md.yx = 2*x*y + 2*w*z;
        md.yy = 1 - 2*x*x - 2*z*z;
        md.yz = 2*y*z + 2*w*x;
        md.zx = 2*x*z - 2*w*y;
        md.zy = 2*y*z - 2*w*x;
        md.zz = 1 - 2*x*x - 2*y*y;
        return md;
    };

    Mat4.rotateQuat = function(q){
        var md = new Mat4();
        Mat4.setRotateQuat(md,q);
        return md;
    };

    Mat4.setScale   = function(md,sv){
        Mat4.setId(md);
        md.xx = sv.x;
        md.yy = sv.y;
        md.zz = sv.z;
        return md;
    };
    Mat4.scale    = function(sv){
        var m = new Mat4();
        m.xx = sv.x;
        m.yy = sv.y;
        m.zz = sv.z;
        return m;
    };
    Mat4.setTranslate = function(md,v){
        Mat4.setId(md);
        md.xw = v.x;
        md.yw = v.y;
        md.zw = v.z;
        return md;
    };

    Mat4.translate = function(v){
        var m = new Mat4();
        Mat4.setTranslate(m,v);
        return m;
    };

    Mat4.setSkewXY = function(md,sx,sy){
        Mat4.setId(md);
        md.xz = sx;
        md.yz = sy;
        return md;
    };

    Mat4.shearXY  = function(sx,sy){
        var md = new Mat4();
        Mat4.setSkewXY(md,sx,sy);
        return md;
    };

    Mat4.setSkewYZ = function(md,sy,sz){
        Mat4.setId(md);
        md.yx = sy;
        md.zx = sz;
        return md;
    };

    Mat4.shearYZ  = function(sy,sz){
        var md = new Mat4();
        Mat4.setSkewYZ(md,sy,sz);
        return md;
    };

    Mat4.setSkewXZ = function(md,sx,sz){
        Mat4.setId(md);
        md.xy = sx;
        md.zy = sz;
        return md;
    };

    Mat4.shearXZ = function(sx,sz){
        var md = new Mat4();
        Mat4.setSkewXZ(md,sx,sz);
        return md;
    };

    Mat4.setOrtho = function(md,left,right,bottom,top,near,far){
        Mat4.setId(md);
        md.xx = 2 / ( right - left);
        md.yy = 2 / ( top - bottom);
        md.zz = - 2 / ( far - near );  //FIXME wikipedia says this must be negative ?
        md.xw = - ( right + left ) / ( right - left );
        md.yw = - ( top + button ) / ( top - bottom );
        md.zw = - ( far + near ) / ( far - near );
        return md;
    };

    Mat4.ortho = function(l,r,b,t,n,f){
        var md = new Mat4();
        Mat4.setOrtho(md,l,r,b,t,n,f);
        return md;
    };

    Mat4.setFrustrum = function(md,l,r,b,t,n,f){
        Mat4.setId(md);
        md.xx = 2*n / (r-l);
        md.yy = 2*n / (t-b);
        md.zz = -(f+n)/(f-n);
        md.xz = (r+l) / (r-l);
        md.yz = (t+b) / (t-b);
        md.wz = -1;
        md.zw = -2*f*n/(f-n);
    };
    
    Mat4.frustrum = function(l,r,b,t,n,f){
        var md = new Mat4();
        Mat4.setFrustrum(md);
        return md;
    };

    Mat4.setLookAt = function(){
    };

    proto.getScale = function(){
    };

    proto.getRotate = function(){};
    proto.getTranslate = function(){
        return new V3(this.xw,this.yw,this.zw);
    };

    Mat4.toArray = function(array,m,offset){
        offset = offset || 0;

        // 0 4 8  12 | xx xy xz xw
        // 1 5 9  13 | yx yy yz yw
        // 2 6 10 14 | zx zy zz zw
        // 3 7 11 15 | wx wy wz ww

        array[0 +offset] = m.xx;
        array[1 +offset] = m.yx;
        array[2 +offset] = m.zx;
        array[3 +offset] = m.wx;
        array[4 +offset] = m.xy;
        array[5 +offset] = m.yy;
        array[6 +offset] = m.zy;
        array[7 +offset] = m.wy;
        array[8 +offset] = m.xz;
        array[9 +offset] = m.yz;
        array[10+offset] = m.zz;
        array[11+offset] = m.wz;
        array[12+offset] = m.xw;
        array[13+offset] = m.yw;
        array[14+offset] = m.zw;
        array[15+offset] = m.ww;
        return array;
    };

    proto.array = function(){
        return Mat4.toArray([],this);
    };

    proto.float32 = function(){
        return Mat4.toArray(new Float32Array(16),this);
    };

})(exports);

/* ------------------------------ Quaternions -------------------------------- */

(function(exports){

    var V3 = exports.V3;

    function setArray(qd,array,offset){
        offset = offset || 0;
        qd.x = array[offset];
        qd.y = array[offset + 1];
        qd.z = array[offset + 2];
        qd.w = array[offset + 3];
        return qd;
    }
    
    function set(qd,components_){
        setArray(qd,arguments,1);
        return qd;
    }

    function Quat(arg){
        var self = this;
        if(this.constructor !== Quat){
            self = new Quat();
        }
    	var alen = arguments.length;      
    	if(alen === 0){
            self.x = 0.0;
            self.y = 0.0;
            self.z = 0.0;
            self.w = 1.0;
        }else if (alen === 1){
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else{
                Quat.copy(self,arg);
            }
        }else if (alen === 4){
            setArray(self,arguments);
        }else{
            throw new Error("wrong number of arguments:"+arguments.length);
        }
        return self;
    }

    exports.Quat = Quat;

    var tmp = new Quat();
    
    var proto = Quat.prototype;

    Quat.id   = new Quat();

    Quat.set = set;
    
    Quat.setArray = setArray;
    
    Quat.copy = function(qd,q){
        qd.x = q.x;
        qd.y = q.y;
        qd.z = q.z;
        qd.w = q.w;
        return qd;
    };

    proto.clone = function(){
        var qd = new Quat();
        Quat.copy(qd,this);
        return qd;
    };

    proto.toString = function(){
        var str = "[";
        str += this.x ;
        str += "," ;
        str += this.y ;
        str += "," ;
        str += this.z ;
        str += "," ;
        str += this.w ;
        str += "]" ;
        return str;
    };

    Quat.mult = function(qd,q){
        var a = Quat.copy(tmp,qd);
        var b = q;
        if(qd == q){
            b = a;
        }
        qd.w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z;
        qd.x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y;
        qd.y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x;
        qd.z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w;
        return qd;
    };


    proto.mult = function(q){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.mult(qd,q);
        return qd;
    };

    Quat.neg = function(qd){
        qd.x = -qd.x;
        qd.y = -qd.y;
        qd.z = -qd.z;
        qd.w =  qd.w;
        return qd;
    };

    proto.neg = function(){
        return new Quat( -this.x, 
                         -this.y,
                         -this.z,
                          this.w );
    };


    Quat.lerp = function(qd,r,t){
        var qx = qd.x, qy = qd.y, qz = qd.z, qw = qd.w;
        var rx = r.x, ry = r.y, rz = r.z, rw = r.w;
        var it = 1 - t;
        qd.x = it*qx + it*rx;
        qd.y = it*qy + it*ry;
        qd.z = it*qz + it*rz;
        qd.w = it*qw + it*rw;
        Quat.normalize(qd);
        return qd;
    };

    proto.lerp = function(q,t){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.lerp(qd,q,t);
        return qd;
    };
        

    proto.len = function(){
        return Math.sqrt(
                this.x*this.x + 
                this.y*this.y + 
                this.z*this.z + 
                this.w*this.w);
    };

    Quat.normalize = function(qd){
        var qx = qd.x, qy = qd.y, qz = qd.z, qw = qd.w;
        var ilen = 1.0 / Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
        qd.x = qx * ilen;
        qd.y = qy * ilen;
        qd.z = qz * ilen;
        qd.w = qw * ilen;
        return qd;
    };

    proto.normalize = function(){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.normalize(qd);
        return qd;
    };

    Quat.setRotateAxis = function(qd,vec,angle){
        var s = Math.sin(angle*0.5);
        qd.w = Math.cos(angle*0.5);
        qd.x = vec.x * s;
        qd.y = vec.y * s;
        qd.z = vec.y * s;
        return qd;
    };

    Quat.setRotateX = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = Math.sin(angle*0.5);
        qd.y = 0;
        qd.z = 0;
        return qd;
    };

    Quat.setRotateY = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = Math.sin(angle*0.5);
        qd.z = 0;
        return qd;
    };

    Quat.setRotateZ = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = 0;
        qd.z = Math.sin(angle*0.5);
        return qd;
    };

    Quat.rotateAxis = function(vec,angle){
        var qd = new Quat();
        Quat.setRotateAxis(qd,vec,angle);
        return qd;
    };

    Quat.toArray = function(array,qd,offset){
        offset = offset || 0;
        array[offset + 0] = qd.x
        array[offset + 1] = qd.y
        array[offset + 2] = qd.z
        array[offset + 3] = qd.w
        return array;
    };

    Quat.array = function(){
        return Quat.toArray([],this);
    };

    proto.float32 = function(){
        return Mat4.toArray(new Float32Array(4),this);
    };

})(exports);

});

require.define("/engine/transform2.js",function(require,module,exports,__dirname,__filename,process,global){// Modula 2D Transforms
(function(exports){

    var vec = require('./vec.js');
    var V2 = vec.V2, Mat3 = vec.Mat3;

    var epsilonEquals = function(a,b){
        return Math.abs(a-b) <= 0.0000001;
    };

    function Transform2(tr){
        tr = tr || {};
        this.pos = tr.pos ? tr.pos.clone() : new V2();
        if(tr.scale){
            if(typeof tr.scale === 'number'){
                this.scale = new V2(tr.scale,tr.scale);
            }else{
                this.scale = tr.scale.clone();
            }
        }else{
            this.scale = new V2(1,1);
        }
        this.rotation = tr.rotation !== undefined ? tr.rotation : 0;

        this.parent = null;
        this.childs = [];

        if(tr.parent){
            tr.parent.addChild(this);
        }
        if(tr.childs){
            for(var i = 0, len = tr.childs.length; i < len; i++){
                this.addChild(tr.childs[i]);
            }
        }
        this.localToParentMatrix = null;
        this.parentToLocalMatrix = null;
        this.localToWorldMatrix  = null;
        this.worldToLocalMatrix  = null;
    }

    exports.Transform2 = Transform2;

    var proto = Transform2.prototype;

    function reset_matrix(tr){
        if(tr.localToParentMatrix){
            tr.localToParentMatrix = null;
            tr.parentToLocalMatrix = null;
            tr.localToWorldMatrix  = null;
            tr.worldToLocalMatrix  = null;
            for(var i = 0, len = tr.childs.length; i < len; i++){
                reset_matrix(tr.childs[i]);
            }
        }
    }
    function make_matrix(tr){
        if(!tr.localToParentMatrix){
            tr.localToParentMatrix = Mat3.transform(tr.pos,tr.scale,tr.rotation);
            tr.parentToLocalMatrix = tr.localToParentMatrix.invert();
            if(tr.parent){
                make_matrix(tr.parent);
                // tr.localToWorldMatrix = tr.parent.localToWorldMatrix.mult(tr.localToParentMatrix); 
                tr.localToWorldMatrix = tr.localToParentMatrix.mult(tr.parent.localToWorldMatrix);  //INVERTED
                tr.worldToLocalMatrix = tr.localToWorldMatrix.invert();
            }else{
                tr.localToWorldMatrix = tr.localToParentMatrix;
                tr.worldToLocalMatrix = tr.parentToLocalMatrix;
            }
        }
    }
    proto.getLocalToParentMatrix = function(){
        if(!this.localToParentMatrix){
            make_matrix(this);
        }
        return this.localToParentMatrix;
    };
    proto.getParentToLocalMatrix = function(){
        if(!this.parentToLocalMatrix){
            make_matrix(this);
        }
        return this.parentToLocalMatrix;
    };
    proto.getLocalToWorldMatrix = function(){
        if(!this.localToWorldMatrix){
            make_matrix(this);
        }
        return this.localToWorldMatrix;
    };
    proto.getWorldToLocalMatrix = function(){
        if(!this.worldToLocalMatrix){
            make_matrix(this);
        }
        return this.worldToLocalMatrix;
    };
    proto.getDistantToLocalMatrix = function(dist){
        //return this.getWorldToLocalMatrix().mult(dist.getLocalToWorldMatrix());
        return dist.getLocalToWorldMatrix().mult(this.getWorldToLocalMatrix());
    }
    proto.getLocalToDistantMatrix = function(dist){
        //return this.getLocalToWorldMatrix().mult(dist.getWorldToLocalMatrix());
        return dist.getWorldToLocalMatrix().mult(this.getLocalToWorldMatrix()); //FIXME looks fishy ...
    }
    proto.equals = function(tr){
        return  this.fullType === tr.fullType &&
            this.pos.equals(tr.pos) &&
            epsilonEquals(this.rotation, tr.rotation) &&
            epsilonEquals(this.scale.x, tr.scale.y);
    };
    proto.clone = function(){
        var tr = new Transform2();
        tr.pos  = this.pos.clone();
        tr.scale = this.scale.clone();
        tr.rotation = this.rotation;
        return tr;
    };
    proto.setPos = function(vec){
        this.pos.x = vec.x;
        this.pos.y = vec.y;
        reset_matrix(this);
        return this;
    };
    proto.setScale = function(scale){
        if((typeof scale) === 'number'){
            this.scale.x = scale;
            this.scale.y = scale;
        }else{
            this.scale.x = scale.x; 
            this.scale.y = scale.y; 
        }
        reset_matrix(this);
        return this;
    };
    proto.setRotation = function(rotation){
        this.rotation = rotation;
        reset_matrix(this);
        return this;
    };
    proto.getPos = function(){
        return this.pos.clone();
    };
    proto.getScale = function(){
        return this.scale.clone();
    };
    proto.getScaleFac = function(){
        return Math.max(this.scale.x,this.scale.y);
    };
    proto.getRotation = function(){
        return this.rotation;
    };
    proto.getWorldPos = function(){
        return this.getLocalToWorldMatrix().mult(new V2());
    };
    proto.parentToLocal = function(vec){
        return this.getParentToLocalMatrix().mult(vec);
    };
    proto.worldToLocal = function(vec){
        return this.getWorldToLocalMatrix().mult(vec);
    };
    proto.localToParent = function(vec){
        return this.getLocalToParentMatrix().mult(vec);
    };
    proto.localToWorld = function(vec){
        return this.getLocalToWorldMatrix().mult(vec);
    };
    proto.distantToLocal = function(distTransform, vec){
        vec = distTransform.localToWorld(vec);
        return this.worldToLocal(vec);
    };
    proto.localToDistant = function(dist, vec){
        vec = this.localToWorld(vec);
        return dist.worldToLocal(vec);
    };
    proto.X = function(){
        return this.localToWorld(new V2(1,0)).sub(this.getWorldPos()).normalize();
    };
    proto.Y = function(){
        return this.localToWorld(new V2(0,1)).sub(this.getWorldPos()).normalize();
    };
    proto.dist = function(tr){
        return tr.getWorldPos().sub(this.getWorldPos());
    };
    proto.addChild = function(tr){
        if(tr.parent != this){
            tr.makeRoot();
            tr.parent = this;
            this.childs.push(tr);
        }
        return this;
    };
    proto.remChild = function(tr){
        if(tr && tr.parent === this){
            tr.makeRoot();
        }
        return this;
    };
    proto.getChildCount = function(){
        return this.childs.length;
    };
    proto.getChild = function(index){
        return this.childs[index];
    };
    proto.getRoot  = function(){
        if(this.parent){
            return this.parent.getRoot();
        }else{
            return this;
        }
    };
    proto.makeRoot = function(){
        if(this.parent){
            var pchilds = this.parent.childs;
            for(var i = 0; i < pchilds.length; i++){
                while(pchilds[i] === this){
                    pchilds.splice(i,1);
                }
            }
            this.parent = null;
        }
        return this;
    };
    proto.isLeaf   = function(){ return this.childs.length === 0; };
    proto.isRoot   = function(){ return !this.parent; };
    proto.rotate = function(angle){ 
        this.rotation += angle;
        reset_matrix(this);
        return this;
    };
    proto.scale = function(scale){
        this.scale.x *= scale.x;
        this.scale.y *= scale.y;
        reset_matrix(this);
        return this;
    };
    proto.scaleFac = function(f){
        this.scale.x *= f;
        this.scale.y *= f;
        reset_matrix(this);
        return this;
    };
    proto.translate = function(deltaPos){
        this.pos.x += deltaPos.x;
        this.pos.y += deltaPos.y;
        reset_matrix(this);
        return this;
    };

})(exports);

});

require.define("/engine/bounds2.js",function(require,module,exports,__dirname,__filename,process,global){// Modla 2D Bounding Volumes
(function(exports){

    var V2 = require('./vec.js').V2;
    function Bound(){
    }
    exports.Bound = Bound;
    // A bounding rectangle
    // x,y the minimum coordinate contained in the rectangle
    // sx,sy the size of the rectangle along the x,y axis
    function Rect(x,y,sx,sy,centered){
        this.sx = sx;           // width of the rectangle on the x axis
        this.sy = sy;           // width of the rectangle on the y axis
        this.hx = sx/2;         // half of the rectangle width on the x axis
        this.hy = sy/2;         // half of the rectangle width on the y axis
        this.x  = x;            // minimum x coordinate contained in the rectangle  
        this.y  = y;            // minimum y coordinate contained in the rectangle
        this.cx = x + this.hx;   // x coordinate of the rectangle center
        this.cy = y + this.hy;   // y coordinate of the rectangle center
        this.mx = this.x + sx;   // maximum x coordinate contained in the rectangle
        this.my = this.y + sy;   // maximum x coordinate contained in the rectangle
        if(centered){
            this.x -= this.hx;
            this.cx -= this.hx;
            this.mx -= this.hx;
            this.y -= this.hy;
            this.cy -= this.hy;
            this.my -= this.hy;
        }
    }

    exports.BRect = Rect;

    Rect.prototype = new Bound();
    Rect.prototype.min = function(){  return new V2(this.x, this.y); };
    Rect.prototype.minX = function(){ return this.x; };
    Rect.prototype.minY = function(){ return this.y; };
    Rect.prototype.max = function(){  return new V2(this.mx, this.my); };
    Rect.prototype.maxX = function(){ return this.mx; };
    Rect.prototype.maxY = function(){ return this.my; };
    Rect.prototype.size = function(){ return new V2(this.sx, this.sy); };
    Rect.prototype.center = function(){return new V2(this.cx, this.cy); };
    Rect.prototype.equals = function(b){ return ( this.cx === b.cx && this.cy === b.cy && this.sx === b.sx && this.sy === b.sy); };
    Rect.prototype.clone  = function(){  return new Rect(this.x,this.y,this.sx, this.sy)};
    Rect.prototype.cloneAt = function(center){ return new Rect(center.x - this.hx, center.y -this.hy, this.sx, this.sy); };

    //intersect line a,b with line c,d, returns null if no intersection
    function lineIntersect(a,b,c,d){
        // http://paulbourke.net/geometry/lineline2d/
        var f = ((d.y - c.y)*(b.x - a.x) - (d.x - c.x)*(b.y - a.y)); 
        if(f == 0){
            return null;
        }
        f = 1 / f;
        var fab = ((d.x - c.x)*(a.y - c.y) - (d.y - c.y)*(a.x - c.x)) * f ;
        if(fab < 0 || fab > 1){
            return null;
        }
        var fcd = ((b.x - a.x)*(a.y - c.y) - (b.y - a.y)*(a.x - c.x)) * f ;
        if(fcd < 0 || fcd > 1){
            return null;
        }
        return new V2(a.x + fab * (b.x-a.x), a.y + fab * (b.y - a.y) );
    }

    // returns an unordered list of vector defining the positions of the intersections between the ellipse's
    // boundary and a line segment defined by the start and end vectors a,b

    Rect.prototype.collideSegment = function(a,b){
        var collisions = [];
        var corners = [ new V2(this.x,this.y), new V2(this.x,this.my), 
                        new V2(this.mx,this.my), new V2(this.mx,this.y) ];
        var pos = lineIntersect(a,b,corners[0],corners[1]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[1],corners[2]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[2],corners[3]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[3],corners[0]);
        if(pos) collisions.push(pos);
        return collisions;
    };
    Rect.prototype.contains = function(arg){
        if(arg instanceof V2){
            return ( arg.x >= this.x && arg.x <= this.mx &&
                     arg.y >= this.y && arg.y <= this.my );
        }else if(arguments.length === 2){
            return this.contains(new V2(arguments[0],arguments[1]));
        }else if( arg instanceof Rect){
            return (arg.x >= this.x && arg.mx <= this.mx &&
                    arg.y >= this.y && arg.my <= this.my );
        }else if(arg instanceof Bound){
            return (arg.minX() >= this.x && arg.maxX() <= this.mx &&
                    arg.minY() >= this.y && arg.maxY() <= this.my );
        }
        return false;
    };

    function boundCollides(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            return amax > bmin;
        }else{
            return amin < bmax;
        }
    }
    
    function boundEscapeDist(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            var disp = bmin - amax;
            if(disp >= 0){
                return 0;
            }else{
                return disp;
            }
        }else{
            var disp = bmax - amin;
            if(disp <= 0){
                return 0;
            }else{
                return disp;
            }
        }
    }

    Rect.prototype.collides = function(b){
        return boundCollides(this.x, this.mx, b.x, b.mx) && 
               boundCollides(this.y, this.my, b.y, b.my);
    };
    
    Rect.prototype.collisionAxis = function(b){
        var dx = boundEscapeDist(this.x, this.mx, b.x, b.mx); 
        var dy = boundEscapeDist(this.y, this.my, b.y, b.my);
        if( Math.abs(dx) < Math.abs(dy) ){
            return new V2(dx,0);
        }else{
            return new V2(0,dy);
        }
    };
    
    Rect.prototype.collisionVector = function(b){
        return new V2( 
            boundEscapeDist(this.x, this.mx, b.x, b.mx),
            boundEscapeDist(this.y, this.my, b.y, b.my)  
        );
    };
    Rect.prototype.transform = function(mat){
        if(Transform2 && (mat instanceof Transform2)){
            mat = mat.getLocalToWorldMatrix();
        }else if(!(mat instanceof Mat2h)){
            mat = new Mat2h(mat);
        }
        var v1,v2,v3,v4,x,y,mx,my;

        v1 = mat.multVec(new V2(this.cx-this.hx, this.cy-this.hy));
        v2 = mat.multVec(new V2(this.cx-this.hx, this.cy+this.hy));
        v3 = mat.multVec(new V2(this.cx+this.hx, this.cy-this.hy));
        v4 = mat.multVec(new V2(this.cx+this.hx, this.cy+this.hy));

        x = Math.min(Math.min(v1.x,v2.x),Math.min(v3.x,v4.x));
        y = Math.min(Math.min(v1.y,v2.y),Math.min(v3.y,v4.y));
        mx = Math.max(Math.max(v1.x,v2.x),Math.max(v3.x,v4.x));
        my = Math.max(Math.max(v1.y,v2.y),Math.max(v3.y,v4.y));

        return new Rect((x+mx)*0.5,(y+my)*0.5,mx-x,my-y);
    };
    Rect.prototype.translate = function(vec){
        return new Rect(this.x+vec.x,this.y+vec.y,this.sx,this.sy);
    };

    Rect.prototype.toString = function(){
        return "["+this.cx+","+this.cy+"|"+this.sx+","+this.sy+"]";
    };
})(exports);

});

require.define("/engine/core.js",function(require,module,exports,__dirname,__filename,process,global){// Modula core
(function(exports){
	
	exports.use = function(modules){
        if(typeof window !== 'undefined'){
            //browser
            var namespace = window;
        }else if(typeof global !== 'undefined'){
            //nodejs
            var namespace = global;
        }
        if(arguments.length){
            for (var i = 0, len = arguments.length; i < len; i++){
                var module = arguments[i];
                if(!namespace[module]){
                    if(this.hasOwnProperty(module)){
                        namespace[module] = this[module];
                    }else{
                        throw new Error('use(): could not find module: '+module);
                    }
                }
            }
        }else{
            for (var module in this){
                if(	module !== this.use && this.hasOwnProperty(module) && !namespace[module]){
                    namespace[module] = this[module];
                }
            }
        }
		return namespace;
	};
    exports.serverSide = typeof window === 'undefined';
    exports.clientSide = !exports.serverSide;
	
    /* Simple JavaScript Inheritance
     * By John Resig http://ejohn.org/
     * MIT Licensed.
     */
    // Inspired by base2 and Prototype
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

        // The base Class implementation
        this.Class = function(){
        };
      
        this.Class.extend = function(prop) {
            if(arguments.length > 1){
                var c = this.extend(arguments[arguments.length-1]);
                for(var i = arguments.length-2; i >= 0; i--){
                    c.mixin(arguments[i]);
                }
                return c;
            }
            var _super = this.prototype;
            
            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;
            
            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" && 
                    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                        (function(name, fn){
                            return function() {
                                var tmp = this._super;
                                
                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this._super = _super[name];
                                
                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);        
                                this._super = tmp;
                                
                                return ret;
                            };
                        })(name, prop[name]) : 
                        prop[name];
            }
            
            // The dummy class constructor
            function Class() {
                // All construction is actually done in the init method
                if ( !initializing && this.init )
                    this.init.apply(this, arguments);
            }

            Class.mixin = function (properties) {
                for (var name in properties) {
                    if(prototype[name] !== undefined){
                        continue;
                    }
                    if (typeof properties[name] !== 'function'
                            || !fnTest.test(properties[name])) {
                        prototype[name] = properties[name];
                    } else if (typeof prototype[name] === 'function'
                               && prototype.hasOwnProperty(name)) {
                        prototype[name] = (function (name, fn, previous) {
                            return function () {
                                var tmp = this._super;
                                this._super = previous;
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            }
                        })(name, properties[name], prototype[name]);
                    } else if (typeof _super[name] === 'function') {
                        prototype[name] = (function (name, fn) {
                            return function () {
                                var tmp = this._super;
                                this._super = _super[name];
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            }
                        })(name, properties[name]);
                    }
                }
            };
        
            // Populate our constructed prototype object
            Class.prototype = prototype;
            
            // Enforce the constructor to be what we expect
            Class.prototype.constructor = Class;

            // And make this class extendable
            Class.extend = arguments.callee;
            
            return Class;
        };

    }).call(exports);
    
    var Mixin = function(){};

    Mixin.prototype.extend = function(prop){
        var M = new Mixin();
        M.mixin(this);
        for(var i = 0; i < arguments.length; i++){
            M.mixin(arguments[i]);
        }
        return M;
    };

    Mixin.prototype.mixin = function(prop){
        for(var i = 0; i < arguments.length; i++){
            prop = arguments[i];
            for(attr in prop){
                if(this[attr] === undefined && prop.hasOwnProperty(attr)){
                    this[attr] = prop[attr];
                }
            }
        }
    };

    exports.Mixin = new Mixin();

})(exports);



});

require.define("/engine/engine.js",function(require,module,exports,__dirname,__filename,process,global){// Modula Engine
(function(exports){

    var core = require('./core.js');
    var V2 = require('./vec.js').V2;
    var Transform2 = require('./transform2.js').Transform2;
    var Bound = require('./bounds2.js').Bound;

    function getNewUid(){
        uid += 1;
        return uid;
    }

    function array_remove(array, element){
        array.splice(array.indexOf(element),1);
        return array;
    }

    function array_contains(array, element){
        return array.indexOf(element) >= 0;
    }

    exports.Main = core.Class.extend({
        init: function(options){
            options = options || {};
            this._nextUid  = 0;
            this.input = null;
            this.scene = null;
            this.sceneList = [];
            this.rng = null;
            this.running = false;
            this.restartTime = -1;
            this.frame = 0;
            this.time = 0;
            this.timeSystem = 0;
            this.startTime = 0;
            this.fps = options.fps || 60;
            console.log('fps:',this.fps);
            this.minfps = options.minfps || Math.min(this.fps,30);
            this.maxfps = options.maxfps || Math.max(this.fps,120);
            this.fixedDeltaTime = 1 / this.fps;
            this.deltaTime = 1 / this.fps
            this.input = options.input || this.input;
            if(this.input){
                this.input.main = this;
            }
            if(options.scene){
                this.add(options.scene);
            }
        },
        getNewUid: function(){
            this._nextUid += 1;
            return this._nextUid;
        },
        add: function(scene){
            scene.main = this;
            this.sceneList.push(scene);
            if(!this.scene){
                this.scene = scene;
            }
            if(!scene.uid){
                scene.uid = this.getNewUid();
            }
        },
        setFps: function(fps){
            this.fps = fps;
            this.fixedDeltaTime = 1/fps;
            this.deltaTime = 1/fps;
        },
        exit:       function(){
            this.running = false;
        },
        _runFrame:   function(){
            var date = new Date();
            this.deltaTime  = Math.min(1/this.minfps,Math.max(1/this.maxfps,
                        date.getTime() * 0.001 - this.timeSystem));
            this.timeSystem = date.getTime() * 0.001;
            this.time = this.timeSystem - this.startTime;

            if(this.input){
                this.input.processEvents();
            }
            for(i = 0; i < this.sceneList.length; i++){
                this.scene = this.sceneList[i];
                var camera = this.scene.camera;
                var renderer = this.scene.renderer;
                if(!this.scene._started){
                    this.scene._started = true;
                    this.scene.time = this.time;
                    this.scene.startTime = this.time;
                    this.scene.onSceneStart();
                }
                this.scene.onFrameStart();
                this.scene.step(this.deltaTime);
                
                if(camera && renderer){
                    if(renderer.zsort){
                        scene._rootEntityList.sort(function(a,b){
                            var za = a.zindex || 0;
                            var zb = b.zindex || 0;
                            return (za - zb);
                        });
                    }
                    renderer.drawFrame(this.scene,camera);
                }
                this.scene.onFrameEnd();
            }
        
            this.frame += 1;

        },
        run: function(){
            var self = this;
            if(self.running){
                return;
            }
            self.running = true;

            var date = new Date();
            this.running = true;
            this.startTime = date.getTime() * 0.001;
            this.time = 0;
            this.timeSystem = this.startTime;
            this.restartTime = -1;
            this.frame = 0;

            function loop(){
                if(self.running && (self.restartTime < 0 || self.time < self.restartTime)){
                    self._runFrame();
                    var elapsedTimeMillis = ((new Date).getTime() - self.timeSystem*1000);
                    var waitTime = (self.fixedDeltaTime * 1000) - elapsedTimeMillis;
                    if(waitTime < 0){
                        waitTime = 0;
                    }
                    setTimeout(loop,waitTime);
                }else{
                    if(self.running){
                        self.run();
                    }
                }
            }
            loop();
        },
        restart:    function(delay){
            this.restartTime = this.time;
        },
    });

    exports.Input = core.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            if(core.serverSide){ return; }
            this._mouseStatus = 'out'; // 'out' | 'over' | 'entering' | 'leaving'
            this._mouseStatusPrevious = 'out';
            this._mouseStatusSystem = 'out';

            this._mousePosSystem = new V2();
            this._mousePos = new V2();
            this._mousePosPrevious = new V2();
            this._mousePosDelta = new V2();

            this._mouseDragPos = new V2();
            this._mouseDragDeltaPos = new V2();
            this._mouseDrag = 'no'; // 'no' | 'dragging' | 'dragStart' | 'dragEnd'
            this._mouseEvents = [];

            this._keyStatus = {}; // 'up' | 'down' | 'press' | 'release' , undefined == 'up'
            this._keyUpdateTime = {};
            this._keyEvents = [];

            this._alias = {};
            this.main   = null;
            this.setAlias({
                'mouse-left'  : 'mouse0',
                'mouse-middle': 'mouse1',
                'mouse-right' : 'mouse2',
            });
            this.setAlias(options.alias || {});

            
            var $elem = options.$elem || $(options.selector || 'body');
            
            $elem.keyup(function(e){
                self._keyEvents.push({type:'up', key: String.fromCharCode(e.which).toLowerCase()});
            });
            $elem.keydown(function(e){
                self._keyEvents.push({type:'down', key: String.fromCharCode(e.which).toLowerCase()});
            });
            
            function relativeMouseCoords(domElement,event){
                var totalOffsetX = 0;
                var totalOffsetY = 0;
                
                do{
                    totalOffsetX += domElement.offsetLeft;
                    totalOffsetY += domElement.offsetTop;
                }while((domElement = domElement.offsetParent));
                
                return new V2(
                    event.pageX - totalOffsetX,
                    event.pageY - totalOffsetY 
                );
            }
            function eventMousemove(event){
                self._mousePosSystem = relativeMouseCoords(this,event);
            }
            
            $elem[0].addEventListener('mousemove',eventMousemove,false);
            
            function eventMouseover(event){
                self._mouseStatusSystem = 'over';
            }
            
            $elem[0].addEventListener('mouseover',eventMouseover,false);

            function eventMouseout(event){
                self._mouseStatusSystem = 'out';
            }
            $elem[0].addEventListener('mouseout',eventMouseout,false);
            
            function eventMousedown(event){
                self._keyEvents.push({type:'down', key:'mouse'+event.button});

            }
            $elem[0].addEventListener('mousedown',eventMousedown,false);

            function eventMouseup(event){
                self._keyEvents.push({type:'up', key:'mouse'+event.button});
            }
            $elem[0].addEventListener('mouseup',eventMouseup,false);
            
        },
        processEvents: function(){
            if(core.serverSide){ return; }
            var time = this.main.timeSystem;
            
            for(var i = 0; i < this._keyEvents.length; i++){
                var e =  this._keyEvents[i];
                var previous = this._keyStatus[e.key];
                if(e.type === 'up'){
                    if(previous === 'down' || previous === 'press'){
                        this._keyStatus[e.key] = 'release';
                    }else{
                        this._keyStatus[e.key] = 'up';
                    }
                }else if(e.type === 'down'){
                    if(previous !== 'down'){
                        this._keyStatus[e.key] = 'press';
                    }
                    if(previous === 'press'){
                        this._keyStatus[e.key] = 'down';
                    }
                }
                this._keyUpdateTime[e.key] = time;
            }
            for(key in this._keyStatus){
                if(this._keyUpdateTime[key] === undefined || this._keyUpdateTime[key] < time ){
                    var status = this._keyStatus[key];
                    if(status === 'press'){
                        this._keyStatus[key] = 'down';
                    }else if(status === 'release'){
                        this._keyStatus[key] = 'up';
                    }
                    this._keyUpdateTime[key] = time;
                }
            }
            this._keyEvents = [];

            this._mousePosPrevious = this._mousePos || new V2();
            this._mousePos = this._mousePosSystem || new V2();
            this._mousePosDelta = this._mousePos.sub(this._mousePosPrevious);
            
            this._mouseStatusPrevious = this._mouseStatus;
            if(this._mouseStatusSystem === 'over'){
                if(this._mouseStatus === 'out' || this._mouseStatus === 'leaving'){
                    this._mouseStatus = 'entering';
                }else{ // over || entering
                    this._mouseStatus = 'over';
                }
            }else{ //out
                for(key in this._keyStatus){
                    this._keyStatus[key] = 'up';
                }
                if(this._mouseStatus === 'over' || this._mouseStatus === 'entering'){
                    this._mouseStatus = 'leaving';
                }else{  // leaving || out
                    this._mouseStatus = 'out';
                }
            }
        },

        /* key: a,b,c,...,y,z,1,2,..0,!,    _,$,...,
         * 'left','right','up','down','space',
         * 'alt','shift','left-shift','right-shift','ctrl','super',
         * 'f1','f2','enter','esc','insert','delete','home','end',
         * 'pageup','pagedown'
         * 'mouseX','mouse-left','mouse-right','mouse-middle','scroll-up','scroll-down'
         */

        // return true the first frame of a key being pressed
        isKeyPressing : function(key){
            if(core.serverSide){ return false; }
            key = this.getAlias(key);
            return this._keyStatus[key] === 'press';
        },
        // return true the first frame of a key being depressed
        isKeyReleasing : function(key){
            if(core.serverSide){ return false; }
            key = this.getAlias(key);
            return this._keyStatus[key] === 'release';
        },
        // return true as long as a key is pressed
        isKeyDown: function(key){
            if(core.serverSide){ return false; }
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === 'down' || s === 'press';
        },
        // return true as long as a key is depressed. equivalent to !isKeyDown() 
        isKeyUp: function(key){
            if(core.serverSide){ return true; }
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === undefined || s === 'up' || s === 'release';
        },

        // return true if the mouse is over the canvas
        isMouseOver: function(){
            if(core.serverSide){ return false; }
            return this._mouseStatus === 'over' || this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is over the canvas
        isMouseEntering: function(){
            if(core.serverSide){ return false; }
            return this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is outside the canvas
        isMouseLeaving: function(){
            if(core.serverSide){ return false; }
            return this._mouseStatus === 'leaving';
        },
        // return -1 if scrolling down, 1 if scrolling up, 0 if not scrolling
        getMouseScroll: function(){
            if ( this.isKeyDown('scroll-up')){
                return 1;
            }else if (this.isKeyDown('scroll-down')){
                return -1;
            }
            return 0;
        },
        // returns the mouse position over the canvas in pixels
        getMousePos: function(){
            return this._mousePos || new V2();
        },
        setAlias: function(action,key){
            if(core.serverSide){ return; }
            if(typeof action === 'object'){
                var aliases = action;
                for(act in aliases){
                    this.setAlias(act,aliases[act]);
                }
            }
            this._alias[action] = key;
        },
        getAlias: function(alias){
            if(core.serverSide){ return ''; }
            while(alias in this._alias){
                alias = this._alias[alias];
            }
            return alias;
        },
    });

    exports.Camera = core.Class.extend({
        scene: null,
        main: null, 
        tr : new Transform2(),
        onUpdate : function(){},
        getMouseWorldPos: function(){
            if(!this.main || !this.main.input){
                return new V2();
            }
            var mpos = this.main.input.getMousePos();
            if(this.scene.renderer){
                mpos = mpos.sub(this.scene.renderer.getSize().scale(0.5));
            }
            mpos = this.tr.localToWorld(mpos);
            return mpos;
        },
    });

    exports.Camera2d = exports.Camera.extend({
        height: 1,
        parallax: false,
    });

    exports.Renderer = core.Class.extend({
        _size : new V2(),
        alwaysRedraw:true,
        renderBackground: function(){},
        drawFrame: function(scene,camera){},
        passes : [],
        mustRedraw: function(){
            return false;
        },
    });
    
    exports.Renderer.Drawable = core.Class.extend({
        pass: null,
        draw: function(renderer, entity, camera){},
    });

    exports.Renderer.Drawable2d = exports.Renderer.Drawable.extend({
        zindex: 0,
        height: 0,
    });

    exports.RendererCanvas2d = exports.Renderer.extend({
        init: function(options){
            options = options || {};
            this.canvas = options.canvas || this.canvas; 
            this.alwaysRedraw = options.alwaysRedraw;
            if(!this.canvas){ throw new Error('RendererCanvas2d: init(): please provide a canvas to the renderer!'); }
            this.context = this.canvas.getContext('2d');
            this.background = options.background;
            this.compose = options.compose || 'source-over'; 
            this.globalAlpha = options.globalAlpha || 1; 
            this.getSize = options.getSize || this.getSize;
            this._size = new V2();
            this.passes = options.passes || this.passes;
        },
        getSize: function(){
            return new V2(this.canvas.width, this.canvas.height);
        },
        mustRedraw: function(){
            return !this._size.equals(this.getSize());
        },
        drawInit: function(camera){
            if(exports.draw){
                exports.draw.setContext(this.context);
            }
            
            this._size = this.getSize();
            this.canvas.width = this._size.x;
            this.canvas.height = this._size.y;

            this.context.save();
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
            if(this.background){
                this.context.fillStyle = this.background;
                this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
            }
            this.context.globalCompositeOperation = this.compose;
            this.context.globalAlpha = this.globalAlpha;
            if(camera){
                this.context.translate(this.canvas.width/2, this.canvas.height/2);
                if(camera.parallax && camera.height){
                    this.context.scale( 1/(camera.tr.scale.x * camera.height), 
                                        1/(camera.tr.scale.y * camera.height));
                }else{
                    this.context.scale(1/camera.tr.scale.x, 1/camera.tr.scale.y);
                }
                this.context.rotate(-camera.tr.rotation);
                this.context.translate(-camera.tr.pos.x,-camera.tr.pos.y);
            }
        },
        drawEnd: function(){
            this.context.restore();
        },
        drawFrame: function(scene,camera){
            this.drawInit(camera);
            for(var i = 0, len = this.passes.length; i < len; i++){
                this.drawPass(scene,camera,this.passes[i]);
            }
            this.drawPass(scene,camera,null);
            for(var i = 0, len = scene._entityList.length; i < len; i++){
                scene._entityList[i].onDrawGlobal();
            }
            this.drawEnd();
        },
        drawPass: function(scene,camera,pass){
            var self = this;
            
            function drawEntity(ent,pass){
                self.context.save();
                self.context.translate(ent.tr.pos.x, ent.tr.pos.y);
                self.context.scale(ent.tr.scale.x, ent.tr.scale.y);
                self.context.rotate(ent.tr.rotation);
                if(ent.render){
                    var drawables = ent.drawable;
                    if(!drawables){
                        drawables = [];
                    }else if (!(drawables instanceof Array)){
                        drawables = [drawables];
                    }
                    for(var i = 0, len = drawables.length; i < len; i++){
                        var drawable = drawables[i];
                        self.context.save();
                        if(camera.parallax && camera.height && drawable.height){
                            var fac = camera.height / (camera.height - drawable.height);
                            var cpos = camera.tr.pos;
                            cpos = cpos.scale(1-fac);
                            context.translate(cpos.x,cpos.y);
                            context.scale(fac,fac);
                        }
                        if(pass){
                            if(drawable.pass === pass){
                                drawable.draw(self,ent,camera);
                            }
                        }else{
                            if(!drawable.pass){
                                drawable.draw(self,ent,camera);
                            }
                        }
                        self.context.restore();
                    }
                    if(!pass){
                            ent.onDrawLocal();
                    }
                }
                if(ent.renderChilds){
                    for(var i = 0, len = ent.tr.getChildCount(); i < len; i++){
                        drawEntity(ent.tr.getChild(i).ent,pass);
                    }
                }
                self.context.restore();
            }
            for(var i = 0, len = scene._rootEntityList.length; i < len; i++){
                var ent = scene._rootEntityList[i];
                drawEntity(ent,pass);
            }
        },
    });
    
    exports.RendererCanvas2d.SpriteMap = core.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            this._image = options.image || null;
            this._src = options.src;
            this.centered = options.centered || this.centered;
            this.compose  = options.compose  || this.compose;
            this.pass     = options.pass     || this.pass;
            this.height   = options.height   || this.height;

            if(typeof Image !== 'undefined'){
                if(this._src === undefined){
                    this._src = this.image.src;
                }else{
                    this._image = new Image();
                    this._image.src = this._src;
                }

                function onload(){
                    self._size = new V2(self._image.width, self._image.height);
                }
                this._image.onload = onload;
                onload();
            }else{
                this._src = this._src || '';
                this._image = {};
                this._size = new V2();
            }

            if(options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this._cellSize = new V2(options.cellSize, options.cellSize);
                }else{
                    this._cellSize = options.cellSize.clone();
                }
            }else{ 
                this._cellSize = this.cellSize || this._cellSize || new V2(32,32);
            }
            this._sprites = {};
            this._spriteNames = [];
            if(options.sprites){
                for(var i = 0, l = options.sprites.length; i < l; i++){
                    var sub = options.sprites[i];
                    this._sprites[sub.name] = sub;
                    this._spriteNames.push(sub.name);
                }
            }
        },
        setSprite: function(name,index,size){
            this._sprites[name] = { index: index, size: size };
            this._spriteNames.push(name);
        },
        getSprite: function(name,options){
            options = options || {};
            var sprite = this._sprites[name];
            if(sprite){
                console.log(this);
                arg = {
                    image: this._image,
                    src_x: sprite.index[0] * this._cellSize.x,
                    src_y: sprite.index[1] * this._cellSize.y,
                    src_sx: (sprite.size ? sprite.size[0] : 1) * this._cellSize.x,
                    src_sy: (sprite.size ? sprite.size[1] : 1) * this._cellSize.y,
                    compose: sprite.compose || this.compose || 'source-over',
                    centered: sprite.centered || this.centered || false,
                    pass: sprite.pass || this.pass || undefined,
                    height: sprite.height || this.height || 0,
                };
                for( key in options){
                    arg[key] = options[key];
                }
                return new exports.RendererCanvas2d.DrawableSprite(arg);
            }
        },
        getSpriteNames: function(){
            return this._spriteNames;
        },
    });

    exports.RendererCanvas2d.DrawableSprite = exports.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            var self = this;

            this._image = options.image || null;
            this._src   = options.src;
            this.centered = options.centered || false;
            this.pass   = options.pass || this.pass;
            this.scale  = options.scale || this.scale;
            this.rotation  = options.rotation || this.rotation;
            this.height    = options.height || this.height;
            this.zindex    = options.zindex || this.zindex;

            function onload(){
                self.z     = options.z || 0;    
                self.alpha = options.alpha;
                self.compose = options.compose;
                self._src_x  = options.src_x  || 0;
                self._src_y  = options.src_y  || 0;
                self._src_sx = options.src_sx || self._image.width || 0;
                self._src_sy = options.src_sy || self._image.height ||0;
                self._dst_x  = options.dst_x  || 0;
                self._dst_y  = options.dst_y  || 0;
                self._dst_sx = options.dst_sx || self._src_sx;
                self._dst_sy = options.dst_sy || self._src_sy;

                self.pos   = options.pos ? options.pos.clone() : new V2();
            }
            if(typeof Image !== 'undefined'){
                if(this._src === undefined){
                    this._src = this._image.src;
                }else{
                    this._image = new Image();
                    this._image.src = this._src;
                }
                this._image.onload = onload;
            }else{
                this._src = this._src || (this._image ? this._image.src : null) || '';
                this._image = {};
            }
            onload();
        },
        clone: function(){
            return new exports.RendererCanvas2d.DrawableSprite({
                image : this._image,
                pos   : this.pos,
                alpha : this.alpha,
                scale: this.scale,
                rotation: this.rotation,
                pass  : this.pass,
                centered : this.centered,
                height: this.height,
                zindex: this.zindex,
                compose: this.compose,
                src_x : this._src_x,
                src_y : this._src_y,
                src_sx: this._src_sx,
                src_sy: this._src_sy,
                dst_x : this._dst_x,
                dst_y : this._dst_y,
                dst_sx: this._dst_sx,
                dst_sy: this._dst_sy,
            });
        },
        draw: function(renderer,ent,camera){
            var context = renderer.context;
            context.save();
            if(this.alpha !== undefined){
                context.globalAlpha *= this.alpha;
            }
            if(this.compose){
                context.globalCompositeOperation = this.compose;
            }
            if(this.scale){
                context.scale(this.scale,this.scale);
            }
            if(this.rotation){
                context.rotate(this.rotation);
            }
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            if(this.centered){
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x - this._dst_sx/2, 
                        this._dst_y + this.pos.y - this._dst_sy/2,
                        this._dst_sx, this._dst_sy );
            }else{
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x, this._dst_y + this.pos.y,
                        this._dst_sx, this._dst_sy );
            }
            context.restore();
        },
    });

    exports.Timer = core.Class.extend({
        init: function(scene,opt){
            this.scene = scene;
            this.duration = 0;
            opt = opt || {};
            if(typeof opt === 'number'){
                this.duration = opt;
            }else{
                this.duration = opt.duration || this.duration;
            }
            this.startTime = this.scene.time;
        },
        expired: function(){
            return this.scene.time >= this.startTime + this.duration;
        },
        period: function(){
            if(this.expired()){
                this.startTime += this.duration;
                return true;
            }
            return false;
        },
        remaining: function(){
            return Math.max(0,this.startTime + duration - this.scene.time);
        },

    });

    /*
     
     Signals:
     
     var s = new Signal('1 + cos( period: $p sec, amp: %a)', {
                            p:   0.12, 
                            amp: new Signal('cos(15 Hz) * 0.1')});

     */

    exports.RunningMean = core.Class.extend({
        init: function(opt){
            var len = opt.length || 10;
            var val = opt.value  || 0;
            this.queue = [];
            for(var i = 0; i < len; i++){
                this.queue.push(val);
            }
            this.mean = val;
            this.value  = val
        },
        push: function(val){
            this.mean -= this.queue[0] / this.queue.length;
            this.queue.shift();
            this.queue.push(val);
            this.mean += val / this.queue.length;
            this.value = val;
        },
    });

    exports.AssetManager = core.Class.extend({
        init: function(){
            this.db = []
            this.onsync = function(){};
            this.onfail = function(reason){};
            this.onprogress = function(progress){};
            this.protocol = 'ws://';
            this.hostname = 'localhost';
            this.port = 8081;
        },
        add: function(url,data,version){
            var record = this.db[url] || {version:0};
            record.data = data;
            record.version = version || record.version + 1;
            this.db[url] = record;
        },
        get: function(url){
            if(this.db[url]){
                return this.db[url].data;
            }
            return undefined;
        },
        rem: function(url){
            delete this.db[url];
        },
        schema: function(){
            var schema = {};
            for(url in this.db){
                schema[url] = this.db[url].version;
            }
            return schema;
        },
        delta: function(newSchema){
            var oldSchema = this.schema();
            var delta = {};
            for(url in newSchema){
                if(!oldSchema[url] || ( oldSchema[url] && oldSchema[url].version < newSchema[url].version)){
                    delta[url] = newSchema.version;
                }
            }
            for(url in oldSchema){
                if(!newSchema[url]){
                    delta[url] = -1;
                }
            }
        },
        sync: function(assets){
            var delta = this.delta(assets.schema());
            for(var url in delta){
                if(progress){ progress(); }
                if(delta[url] < 0){
                    this.rem(url);
                }else{
                    this.add(url,assets.get(url),delta[url]);
                }
            }
            if(progress){ progress(); }
        },
        serve: function(){},
    });

    exports.Ray = function(opt){
        var opt = opt || {};
        this.start = opt.start || opt.pos || new V2();
        this.length = opt.length || Number.MAX_VALUE;
        this.dir = (opt.dir || new V2(1,0)).normalize();
        if(opt.end){
            this.length = this.start.dist(opt.end);
            this.dir = opt.end.sub(this.start).normalize();
        }
    };
    exports.Ray.prototype.scale = function(fac){
        if(typeof fac === 'number'){
            this.length *= fac;
            if(fac < 0){
                this.dir = this.dir.neg();
            }
        }else{
            this.dir = this.dir.mult(fac);
            this.length *= this.dir.len();
            this.dir = this.dir.normalize();
        }
        return this;
    };
    exports.Scene = core.Class.extend({
        init: function(options){
            options = options || {};
            this._started = false;
            this._entityList = [];
            this._rootEntityList = [];
            this._newEntityList = [];
            this._destroyedEntityList = [];
            this.uid = options.uid || this.uid || undefined;

            this.frame = 0;
            this.time = 0;
            this.startTime = -1;
            this.timeSpeed = 1;
            this.deltaTime = 1;

            this._entityByUid = {};
            this._entityByName = {};
            this.camera = options.camera || this.camera || null; 
            this.renderer = options.renderer || this.renderer || null;
            this.name = options.name || this.name || 'Scene';
            this.main = null;
        },
        add: function(ent){
            if(ent.main && ent.main !== this.main){
                throw new Error('Cannot add an entity to the scene: it belongs to another exports instance');
                return;
            }else if(this.main){
                ent.main = this.main;
                if(!ent.uid){
                    ent.uid = this.main.getNewUid();
                }
            }
            if(ent.scene && ent.scene !== this){
                ent.scene.remove(ent);
            }
            if(ent.scene !== this){
                ent.scene = this;
                this._newEntityList.push(ent);
                this._entityByUid[ent.uid] = ent;
                var name = ent.name;
                if(!(name in this._entityByName)){
                    this._entityByName[name] = [ent];
                }else{
                    this._entityByName[name].push(ent);
                }
            }
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this.add(ent.getChild(i));
                }
            }
        },
        remove: function(ent){
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this.remove(ent.getChild(i));
                }
            }
            if(ent.scene = this){
                array_remove(this._newEntityList,ent);
                array_remove(this._entityList,ent);
                delete this._entityByUid[ent.uid];
                var s = this._entityByName[ent.name];
                array_remove(s.ent);
                if(s.length == 0){
                    delete this._entityByName[ent.name];
                }
                if(ent.isRoot()){
                    array_remove(_rootEntityList,ent);
                }
                ent.scene = null;
            }
        },
        timer: function(opt){
            return new exports.Timer(this,opt);
        },
        getEntities: function(){
            return this._entityList;
        },
        getRootEntities : function(index){
            if(index !== undefined && index !== null){
                return this._rootEntityList[index];
            }else{
                return this._rootEntityList;
            }
        },
        _entUpdate : function(ent){
            if(ent.active){
                if(!ent.main){
                    ent.main = this.main;
                }
                if(!ent.scene){
                    ent.scene = this.scene;
                }
                if(ent._state === 'new'){
                    ent._state = 'alive';
                    ent._currentFrame = this.main.frame;
                    ent.onInstanciation();
                    ent.onUpdate();
                }else if(ent._currentFrame != this.main.frame){
                    ent._currentFrame = this.main.frame;
                    ent.onUpdate();
                }
            }
            //update child entities too !
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount();i++){
                    this._entUpdate(ent.getChild(i));
                }
            }
        },
        instanciationStep: function(){
            for(var i = 0, len = this._newEntityList.length; i < len; i++){
                var ent = this._newEntityList[i];
                this._entityList.push(ent);
                if(ent.isRoot()){
                    this._rootEntityList.push(ent);
                }
                if(ent.startTime < 0){
                    ent.startTime = this.time;
                }
                if(!ent.main){
                    ent.main = this.main;
                }
                //FIXME make it alive and set current frame ? see J2D
            }
            this._newEntityList = [];
        },
        updateStep: function(){
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var ent = this._rootEntityList[i];
                if(ent._state !== 'destroyed'){
                    this._entUpdate(ent);
                    if(ent._destroyTime && ent._destroyTime <= this.main.time){
                        ent.destroy();
                    }
                }
            }
        },
        collisionStep: function(){
            var emitters = [];
            var receivers = [];
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var e = this._rootEntityList[i];
                if(e.collisionBehaviour === 'emit'){
                    emitters.push(e);
                }else if(e.collisionBehaviour === 'receive'){
                    receivers.push(e);
                }else if(e.collisionBehaviour === 'both'){
                    receivers.push(e);
                    emitters.push(e);
                }
            }
            
            var elen = emitters.length;
            var rlen = receivers.length;

            for(var i = 0; i < elen; i++){
                var e = emitters[i];
                //only emitters send collision events
                for(var j = 0; j < rlen; j++){
                    var r = receivers[j];
                    //only receivers receive collision events
                    if( (r !== e) ){
                        if( e.collides(r) ){
                            r.onCollisionReceive(e);
                            e.onCollisionEmit(r);
                        }
                    }
                }
            }                           
        },
        destructionStep: function(){
            for(var i = 0,len = this._entityList.length; i < len; i++){
                var ent = this._entityList[i];
                if(ent._state === "destroyed"){
                    this._destroyedEntityList.push(ent);
                }
            }

            for(var i = 0,len = this._destroyedEntityList.length; i < len; i++){
                var ent = this._destroyedEntityList[i];
                array_remove(this._entityList,ent);
                if(ent.isRoot()){
                    array_remove(this._rootEntityList,ent);
                }
                ent.onDestruction();
            }
            this._destroyedEntityList = [];
        },
        cameraStep: function(){
            if(this.camera){
                this.camera.scene = this;
                this.camera.main  = this.main;
                this.camera.onUpdate();
            }
        },
        step : function(deltaTime){
            this.deltaTime = deltaTime * this.timeSpeed;
            this.time += this.deltaTime;
            this.frame++;
            this.instanciationStep(); 
            this.cameraStep();
            this.updateStep();
            this.collisionStep();
            this.destructionStep();
        },
        onFrameStart: function(){},
        onFrameEnd:   function(){},
        onSceneStart: function(){},
        onSceneEnd:   function(){},
    });

    exports.Ent = core.Class.extend({ 
        init: function( options ){
            options = options || {};

            this.uid = options.uid || this.uid || undefined;  //  The uid is unique to each entity
            this._state = 'new';    //  'new' | 'alive' | 'destroyed'   
            this._currentFrame = 0;
            this._destroyTime = options.duration || this._destroyTime || Number.MAX_VALUE; // TODO correct delay

            this.scene = null;
            this.main  = null;

            // The tr contains the position, rotation, scale, and parent/childs of the entity
            this.tr     = new Transform2();
            this.tr.ent = this;

            if(options.pos){
                this.tr.setPos(options.pos);
            }
            if(options.rotation){
                this.tr.setRotation(options.rotation);
            }
            if(options.scale){
                this.tr.setScale(options.scale);
            }
            
            // the collisionBehaviour decides how collision events are emitted :
            // 'none' : ignores collisions
            // 'emit' : emits collision events to colliding entities
            // 'receive' : receives collision events from colliding entitites
            // 'both'  : both emit and receive
            this.collisionBehaviour = this.collisionBehaviour || options.collisionBehaviour || 'none';
            this.name   =  options.name   || this.name   || 'Ent';
            // if not active, the entity is not updated but still rendered
            this.active = options.active || this.active || true;
            // if false, the entity does not render. (but may render its childs)
            this.render = options.render || this.render || true;
            // if false the entity does not render its childs
            this.renderChilds = options.renderChilds || this.renderChilds || true;
            // the bound is used for collisions
            this.bound    = options.bound || this.bound || undefined;
            // what will be drawn
            this.drawable = options.drawable || this.drawable || undefined;
            // the time (in seconds) when the entity had its first update
            this.startTime = -1; // todo exports.main.time;
        
        },
        // return true if the entity has no childs
        isLeaf : function(){
            return this.tr.isLeaf();
        },
        // return true if the entity has no parents
        isRoot : function(){
            return this.tr.isRoot();
        },
        addChild: function(ent){
            this.tr.addChild(ent.tr);
            return this;
        },
        // removes a child from the entity
        remChild : function(ent){
            this.tr.remChild(ent.tr);
            return this;
        },
        // returns the child entity of index 'index'
        getChild: function(index){
            if(index !== null && index !== undefined){
                var tr = this.tr.getChild(index);
                return tr ? tr.ent : undefined;
            }else{
                var childs = [];
                for(var i = 0, len = this.tr.getChildCount(); i < len; i++){
                    childs.push(this.tr.getChild(index));
                }
                return childs;
            }
        },
        // destroys the entity (and all childs) now or after an optional delay (in seconds) 
        destroy: function(delay){
            if(delay){
                this._destroyTime = Math.min(this._destroyTime, this.main.time + delay);
                for(var i = 0; i < this.tr.getChildCount(); i++){
                    this.tr.getChild(i).ent.destroy(delay);
                }
            }else if(this._state !== "destroyed"){
                this._state = "destroyed";
                for(var i = 0; i < this.tr.getChildCount(); i++){
                    this.tr.getChild(i).ent.destroy();
                }
            }
            return this; 
        },
        isDestroyed: function(){
            return this._state === "destroyed"; 
        },
        // returns true if the entity collides with another bound or entity
        collides: function(ent){
            if(ent instanceof exports.Ent){
                var epos = ent.tr.getWorldPos();
                var epos = epos.sub(this.tr.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collides(ebound);
                }else{
                    return this.contains(epos);
                }
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.tr.getPos()).collides(ent);
            }
        },
        // returns the smallest vector that would make this entity not collide 'ent' by translation
        collisionVector: function(ent){
            if(ent instanceof exports.Ent){
                var epos = ent.tr.getWorldPos();
                var epos = epos.sub(this.tr.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionVector(ebound);
                }
                return new V2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.tr.getPos()).collisionVector(ent);
            }
        },
        // returns the smallest distance on each axis that would make this entity not collide with
        // 'ent' by translation on one axis
        collisionAxis: function(ent){
            if(ent instanceof exports.Ent){
                    var epos = ent.tr.getWorldPos();
                var epos = ent.tr.getWorldPos();
                var epos = epos.sub(this.tr.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionAxis(ebound);
                }
                return new V2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.tr.getPos()).collisionAxis(ent);
            }
        },
        // is called before onUpdate the first time the entity is updated
        onInstanciation: function(){},
        // is called each frame
        onUpdate: function(){},
        // is called when the entity is destroyed
        onDestruction: function(){},
        // is called when the render state has local coordinates. 
        // (drawing a point centered on (0,0) will draw the point centered on the entity world position
        onDrawLocal: function(){},
        // is called when the render state has global coordinates
        // (drawing a point centered on (0,0) will draw it on (0,0)
        onDrawGlobal: function(){},
        // is called when the entity emits a collision to colliding entity 'ent'
        onCollisionEmit: function(ent){},
        // is called when the entity receives a collision from the entity 'ent'
        onCollisionReceive: function(ent){},
    });

})(exports);

});

require.define("/engine/grid.js",function(require,module,exports,__dirname,__filename,process,global){// Modula 2D Grid
(function(exports){
    var core = require('./core.js');
    var V2 = require('./vec.js').V2;
    var BRect = require('./bounds2.js').BRect;
    var engine = require('./engine.js');

    var Ray = engine.Ray;

    exports.Grid = core.Class.extend({
        init: function(options){
            options = options || {};
            this.cellX = this.cellX || options.cellX || 1;
            this.cellY = this.cellY || options.cellY || 1;
            this.cellSize = this.cellSize;
            if(!this.cellSize && options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this.cellSize = new V2(options.cellSize, options.cellSize);
                }else{
                    this.cellSize = options.cellSize.clone();
                }
            }else{
                this.cellSize = new V2(32,32);
            }
            this.invCellSize = new V2(1 / this.cellSize.x, 1 / this.cellSize.y);
            this.size = new V2( this.cellX * this.cellSize.x,
                                  this.cellY * this.cellSize.y  );

            this.cells = this.cells || options.cells || [];
            if(options.fill !== undefined && !options.cells){
                this.fill(options.fill);
            }
        },
        getCellUnsafe: function(x,y){
            return this.cells[y*this.cellX+x];
        },
        getCell: function(x,y){
            if(x >= 0 && y >= 0 && x < this.cellX && y < this.cellY){
                return this.cells[y*this.cellX+x];
            }else{
                return undefined;
            }
        },
        setCell: function(x,y,cell){
            if(x >= 0 && y >= 0 && x < this.cellX && y < this.cellY){
                this.cells[y*this.cellX+x] = cell;
            }
        },
        fill: function(cell){
            for(var x = 0; x < this.cellX; x++){
                for (var y = 0; y < this.cellY; y++){
                    this.cells[y*this.cellX + x] = cell;
                }
            }
        },
        getCellBound: function(x,y){
            return new BRect(x * this.cellSize.x, y * this.cellSize.y, this.cellSize.x, this.cellSize.y);
        },
        getBound: function(){
            return new BRect(0,0,this.size.x, this.size.y);
        },
        getCellAtPixel: function(pos){
            var size = this.size;
            if(pos.x < 0 || pos.x >= size.x || pos.y < 0 || pos.y >= size.y){
                return undefined;
            }else{
                var csize = this.cellSize;
                var x = Math.max(0,Math.min(this.cellX - 1,Math.floor(pos.x/csize.x)));
                var y = Math.max(0,Math.min(this.cellY - 1,Math.floor(pos.y/csize.y)));
                return { x:x, y:y, cell:this.getCellUnsafe(x,y)};
            }
        },
        getCellsInRect: function(minx, miny, maxx, maxy){
            var size = this.size;
            if(maxx <= 0 || maxy <= 0){
                return [];
            }else if(minx >= size.x || miny >= size.y){
                return [];
            }else{
                var csize = this.cellSize.clone();
                csize.x = 1.0 / csize.x;
                csize.y = 1.0 / csize.y;
                minx = Math.floor(Math.max(minx,0) * csize.x);
                miny = Math.floor(Math.max(miny,0) * csize.y);
                maxx = Math.floor(Math.min(maxx,size.x-1) * csize.x);
                maxy = Math.floor(Math.min(maxy,size.y-1) * csize.y);
                var cells = [];
                for(var x = minx; x <= maxx; x++){
                    for(var y = miny; y <= maxy; y++){
                        cells.push({x:x, y:y, cell: this.getCellUnsafe(x,y)});
                       }
                }
                return cells;
            }
        },
        getColldingCells: function(bound){
            var cells = this.getCellsInRect(bound.minX(), bound.minY(), bound.maxX(), bound.maxY());
            var csize = this.cellSize;
            var ccells = [];
            for(var i = 0, len = cells.length; i < len; i++){
                var cell = cells[i];
                var rect = new BRect( cell.x * csize.x,
                                            cell.y * csize.y,
                                            csize.x,
                                            csize.y );
                if( bound.collides(rect)){
                    cell.bound = rect;
                    ccells.push(cell);
                }
            }
            return ccells;
        },
        collisionVec: function(bound, isSolid){
            var self  = this;

            var pos   = bound.center();
            var minX  = bound.minX();
            var minY  = bound.minY();
            var maxX  = bound.maxX();
            var maxY  = bound.maxY();
            var sx    = bound.size().x;
            var sy    = bound.size().y;
     
            var cx    = this.cellX;
            var cy    = this.cellY;
            var csx   = this.cellSize.x;
            var csy   = this.cellSize.y;

            if(maxX <= 0 || maxY <= 0 || minX >= cx*csx || minY >= cy*csy){
                return;
            }

            function is_solid(x,y){
                var cell = self.getCell(x,y);
                return (cell!== undefined) && isSolid(cell,x,y);
            }

            //we transform everything so that the cells are squares of size 1.

            var isx   = 1 / csx;
            var isy   = 1 / csy;

            minX *= isx;
            minY *= isy;
            maxX *= isx;
            maxY *= isy

            var min_px = Math.floor(minX);
            var max_px = Math.floor(maxX);
            var min_py = Math.floor(minY);
            var max_py = Math.floor(maxY);

            // these are the distances the entity should be displaced to escape
            // left blocks, right blocks, up ... 

            var esc_l = (min_px + 1 - minX) * csx;
            var esc_r = -( maxX - max_px )  * csx;  
            var esc_u = (min_py + 1 - minY) * csy;
            var esc_d = -( maxY - max_py )  * csy;


            // at this point we are back in world sizes 

            if(min_px === max_px && min_py === max_py){
                // in the middle of one block
                if(is_solid(min_px,min_py)){
                    var dx = esc_l < -esc_r ? esc_l : esc_r;
                    var dy = esc_u < -esc_d ? esc_u : esc_d;
                    if(Math.abs(dx) < Math.abs(dy)){
                        return new V2(dx,0);
                    }else{
                        return new V2(0,dy);
                    }
                }else{
                    return undefined;
                }
            }else if(min_px === max_px){
                // in the middle of one vertical two-block rectangle
                var solid_u = is_solid(min_px,min_py);
                var solid_d = is_solid(min_px,max_py);
                if(solid_u && solid_d){
                    return null; // error
                }else if(solid_u){
                    return new V2(0,esc_u);
                }else if(solid_d){
                    return new V2(0,esc_d);
                }else{
                    return undefined;
                }
            }else if(min_py === max_py){
                // in the middle of one horizontal two-block rectangle
                var solid_l = is_solid(min_px,min_py);
                var solid_r = is_solid(max_px,min_py);
                if(solid_l && solid_r){
                    return null; // error
                }else if(solid_l){
                    return new V2(esc_l,0);
                }else if(solid_r){
                    return new V2(esc_r,0);
                }else{
                    return undefined;
                }
            }else{
                // touching four blocks
                var solid_ul = is_solid(min_px,min_py);
                var solid_ur = is_solid(max_px,min_py);
                var solid_dl = is_solid(min_px,max_py);
                var solid_dr = is_solid(max_px,max_py);
                var count = 0 + solid_ul + solid_ur + solid_dl + solid_dr;
                if(count === 0){
                    return undefined;
                }else if(count === 4){
                    var dx = 0, dy = 0;
                    if( -esc_r < esc_l){
                        dx = esc_r - csx;
                    }else{
                        dx = esc_l + csx;
                    }
                    if( -esc_d < esc_u){
                        dy = esc_d - csx;
                    }else{
                        dy = esc_u + csx;
                    }
                    if(Math.abs(dx) < Math.abs(dy)){
                        return new V2(dx,0);
                    }else{
                        return new V2(0,dy);
                    }
                }else if(count >= 2){
                    var dx = 0;
                    var dy = 0;
                    if(solid_ul && solid_ur){
                        dy = esc_u;
                    }
                    if(solid_dl && solid_dr){
                        dy = esc_d;
                    }
                    if(solid_dl && solid_ul){
                        dx = esc_l;
                    }
                    if(solid_dr && solid_ur){
                        dx = esc_r;
                    }
                    if(count === 2){
                        // center of the bound relative to the center of the 4
                        // cells. cy goes up
                        var sx = esc_l - esc_r;
                        var sy = esc_u - esc_d;
                        var cx = -esc_r - sx*0.5;
                        var cy = -(-esc_d - sy*0.5);

                        if(solid_dr && solid_ul){
                            // XXXX
                            // XXXX
                            //     XXXX
                            //     XXXX
                            if(cy >= -cx){
                                dx = esc_l;
                                dy = esc_d;
                            }else{
                                dx = esc_r;
                                dy = esc_u;
                            }
                        }else if(solid_dl && solid_ur){
                            //     XXXX
                            //     XXXX
                            // XXXX 
                            // XXXX
                            if(cy >= cx){
                                dx = esc_r;
                                dy = esc_d;
                            }else{
                                dx = esc_l;
                                dy = esc_u;
                            }
                        }
                    }
                    return new V2(dx,dy);
                }else{
                    if(solid_dl){
                        return -esc_d < esc_l ? new V2(0,esc_d) : new V2(esc_l,0);
                    }else if(solid_dr){
                        return -esc_d < -esc_r ? new V2(0,esc_d) : new V2(esc_r,0);
                    }else if(solid_ur){
                        return esc_u < -esc_r ? new V2(0,esc_u) : new V2(esc_r, 0);
                    }else{
                        return esc_u < esc_l ? new V2(0,esc_u) : new V2(esc_l,0);
                    }
                }
            }
        },
    });

    exports.DrawableGrid = engine.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            this.pass = options.pass || this.pass;
            this.height = options.height || this.height;
            this.zindex = options.zindex || this.zindex;
            this.grid = options.grid;
            this._drawables = options.drawables || {};
            if(options.spriteMap){
                sprites = options.spriteMap.getSpriteNames();
                for(var i = 0, len = sprites.length; i < len; i++){
                    this._drawables[sprites[i]] = options.spriteMap.getSprite(sprites[i]);
                }
            }
        },
        clone: function(){
            return new exports.DrawableGrid({
                height: this.height,
                zindex: this.zindex,
                drawables: this._drawables,
                grid: this.grid,
            });
        },
        draw: function(renderer, ent, camera){
            var cx = this.grid.cellX;
            var cy = this.grid.cellY;
            var size = this.grid.cellSize; 

            for(var x = 0; x < cx; x++){
                for(var y = 0; y < cy; y++){
                    var cell = this.grid.getCellUnsafe(x,y);
                    var drawable = this._drawables[cell];
                    if(drawable){
                        var px = x * size.x;
                        var py = y * size.y;
                        renderer.context.save();
                        renderer.context.translate(px,py);
                        drawable.draw(renderer,ent);
                        renderer.context.restore();
                    }
                }
            }
        },
    });
})(exports);

});

require.define("/game/assets.js",function(require,module,exports,__dirname,__filename,process,global){(function(exports){
    require('../engine/modula.js').use();

	exports.shipSprite = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow.png',
        centered:true,
    });

	exports.shipSpriteBlue = exports.shipSprite.clone();
    exports.shipSpriteRed = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_blue.png',
        centered:true,
    });

    exports.buildingSprite = new RendererCanvas2d.DrawableSprite({
        pass:'buildings',
        alpha: 0.5,
        src:'img/blurred-buildings.png',
        centered:true,
        height:-1,
    });

    exports.shipHover = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128blue.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });
    exports.shipHoverBlue = exports.shipHover.clone();
    exports.shipHoverRed = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128red.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });

    exports.shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow_firing.png',
        centered:true,
    });
    
    exports.missileSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-green.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    exports.missileSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-green.png',
        compose: 'lighter',
        centered:true,
    });

    exports.boltSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-red.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    exports.boltSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-red.png',
        compose: 'lighter',
        centered:true,
    });

    exports.boltExplosion = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128red.png',
        compose: 'lighter',
        centered:true,
    });
    
    exports.explosionSprite = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128green.png',
        compose: 'lighter',
        centered:true,
    });
    
    exports.blockSpriteUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-under.png',
        pos:new V2(-12,-16),
    });

    exports.blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpritePurpleUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple-under.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpritePurple = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpriteGray = new RendererCanvas2d.DrawableSprite({
        src:'img/block-gray.png',
        pos:new V2(-12,16),
    });

    exports.blockSpriteDark = new RendererCanvas2d.DrawableSprite({
        src:'img/block-dark-gray.png',
        pos:new V2(-12,16),
    });
})(exports);

});

require.define("/game/settings.js",function(require,module,exports,__dirname,__filename,process,global){(function(exports){
	exports.bindings = {
        'fire':     'mouse-left',
        'altfire':  'mouse-right',
        'left':     'a',
        'right':    'd',
        'down':     's',
        'up':       'w',
        'weapon-missile':   'q',
        'weapon-bolter':    'e',
        'weapon-pewpew':    '2',
        'weapon-blade' :    '1',
        'weapon-shotgun':   '3',
        'weapon-grenades':  'r',
        'weapon-mines':     '4',
        'weapon-vulcan':    'f',
        'weapon-shock':     'c',
        'editlvl':  'l',
        'suicide':  'k',
        'special':  'space',
        'pause'  :  'p',
        'exit'   :  'esc',
     };
 })(exports);

});

require.define("/game/entities.js",function(require,module,exports,__dirname,__filename,process,global){(function(exports){
    require('../engine/modula.js').use();
    var assets = require('./assets.js');
    var settings = require('./settings.js');

    var DEG = 180/Math.PI;
    var RAD = Math.PI/180;

    exports.GameEnt = Ent.extend({
        init: function(opt){
            opt = opt || {};
            this._super(opt);
            this.game = opt.game || this.game || exports.GameEnt.game;
            if(!this.game){
                throw new Error('you must provide a game to a gameEnt constructor');
            }
            this.guid = opt.guid || this.game.newGuid();
        },
    });

	exports.Item = exports.GameEnt.extend({
        name:'item',
        spawn: 0,
        delay: 5,
        collisionBehaviour:'emit',
        bound: new BRect(0,0,50,50,'centered'),
        effect: function(player){
        },
    });

    exports.Flag = exports.Item.extend({
        name:'flag',
        team:'zen',
        effect: function(player){
            player.takeFlag(this.team);
        },
    });

    exports.Armor = exports.Item.extend({
        name: 'armor',
        armor: 5,
        effect: function(player){
            player.addArmor(this.name, this.health);
        },
    });

    exports.HealthKit = exports.Item.extend({
        name:'healthkit',
        health: 50,
        effect: function(player){
            player.addHealth(this.name,this.health);
        },
    });

    exports.SuperPower = exports.Item.extend({
        effect: function(player){
            player.powerup(this.name);
        },
    });

    exports.QuadDamage = exports.SuperPower.extend({
        name:'quad',
        spawn: 20,
        delay: 20,
    });

    exports.Ammo = exports.Item.extend({
        name:'ammo',
        weapon:'none',
        ammo:10,
        effect: function(player){
            player.addAmmo(this.weapon,this.ammo);
        },
    });

    exports.WeaponItem = exports.Ammo.extend({
        name:'weaponItem',
        weapon:'none',
        ammo:10,
        effect: function(player){
            player.addWeapon(this.weapon,this.ammo);
        },
    });

    exports.Level = Ent.extend({
        init: function(options){
            options = options || {};
            this._super(options);
            this.collisionBehaviour = 'receive';
            this.setState(options);
        },
        getState: function(){
            return {
                name:     this.name,
                cellX:    this.grid.cellX,
                cellY:    this.grid.cellY,
                cellSize: this.grid.cellSize,
                cells:    this.grid.cells,
                spawns:   this.spawns,
            };
        },
        setState: function(lvl){
            this.grid = lvl.grid || new Grid({
                cellX: lvl.cellX || 50,
                cellY: lvl.cellY || 50,
                cellSize: lvl.cellSize ? new V2(lvl.cellSize): 103,
                cells: lvl.cells,
                fill: lvl.cells ? undefined : 0,
            });
            this.spawns = lvl.spawns || {
                red: [],
                blue:[],
            };
            this.theme = lvl.theme || {
                grid:{
                    1: assets.blockSprite,
                    2: assets.blockSpritePurple,
                },
                gridbg:{
                    '-1': assets.blockSpriteGray,
                    '-2': assets.blockSpriteDark,
                      1 : assets.blockSpriteUnder,
                      2 : assets.blockSpritePurpleUnder,
                },
                bgcolor: '#333',
            };
            this.name = lvl.name || 'default';
            this.bound   = new BRect(0,0,this.grid.size.x, this.grid.size.y);
            this.drawable = [
                new DrawableGrid({
                    pass:'bgblocks',
                    grid: this.grid,
                    drawables: this.theme.gridbg,
                }),
                new DrawableGrid({
                    pass:'blocks',
                    grid: this.grid,
                    drawables: this.theme.grid,
                }),
            ];
        },
        generate: function(opt){
            opt = opt || {};
            var patterns = [
                [[1,1,1]],
                [[1,1,1,1]],
                [[1],[1],[1],[1]],
                [[0,1,0],
                 [1,1,1],
                 [0,1,0]],
                [[1,1],[1,1]]
            ];
            var density = opt.density || 0.1;
            var patternAvgSize = 4;
            var grid = new Grid({
                cellX: opt.cellX || this.grid.cellX,
                cellY: opt.cellY || this.grid.cellY,
                cellSize: this.grid.cellSize,
                fill:0,
            });
            for(var x = 0, xlen = grid.cellX; x < xlen; x++){
                for(var y = 0, ylen = grid.cellY; y < ylen; y++){
                    var cell = 0;
                    if(x === 0 || x === xlen-1 || y === 0 || y === ylen-1){
                        grid.setCell(x,y,2);
                    }
                }
            }
            var patterncount = Math.round(grid.cellX*grid.cellY*density/patternAvgSize);
            for(var i = 0; i < patterncount; i++){
                var cell = Math.random() < 0.5 ? 1 : 2;
                var pattern = patterns[Math.floor(Math.random()*patterns.length)];
                var cx = Math.round(1+Math.random()*(grid.cellX-2));
                var cy = Math.round(1+Math.random()*(grid.cellY-2));
                for(var y = 0; y < pattern.length; y++){
                    for(var x = 0; x < pattern[y].length; x++){
                        if(pattern[y][x] > 0){
                            grid.setCell(cx+x,cy+y,cell);
                        }
                    }
                }
            }

            var spawnPoints = opt.spawnPoints || 4;
            var spawns = {red:[],blue:[]};
            for(var i = 0; i < spawnPoints; i++){
                for (team in spawns){
                    do {
                        var pos = [Math.floor(Math.random()*grid.cellX),
                                   Math.floor(Math.random()*grid.cellY)];
                    }while(grid.getCell(pos.x,pos.y) > 0);
                    spawns[team].push(pos);
                }
            }
            this.setState({grid: grid, spawns:spawns});
        },
    });

    exports.GridCollider = exports.GameEnt.extend({
        gridCollisionVec: function(){
            var self = this;
            return this.game.level.grid.collisionVec(
                this.bound.cloneAt(this.tr.getPos()),
                function(cell,x,y){ return self.isSolid(cell,x,y); }
            );
        },
        isSolid: function(cell,x,y){
            return cell > 0;
        },
    });

    exports.Particle   = exports.GridCollider.extend({
        name: 'particle',
        radius: 5,
        init: function(opt){
            this._super(opt);
            this.speedVec = opt.speedVec || new V2();
            this.tr.setRotation(this.speedVec.azimuth());
            this.bound = new BRect(0,0,this.radius*2,this.radius*2,'centered');
            this.collisionBehaviour = 'emit';
            this.rotSpeed = opt.rotSpeed || 0;
            this.drawable = this.drawable ? this.drawable.clone() : assets.missileSmoke.clone();
            this.tr.setRotation(Math.random()*6.28);
        },
        onInstanciation:function(){
            this.destroy(0.8);
        },
        onUpdate: function(){
            this._super();
            var  oldpos = this.tr.getPos();
            var  time = this.scene.time - this.startTime;
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            this.tr.rotate(this.rotSpeed*this.scene.deltaTime);
            this.drawable.alpha = Math.max(0,0.15-(0.3*time));
            this.tr.setScale(0.4+3*time);
            this.speedVec = this.speedVec.scale(0.99);
            if(this.gridCollisionVec()){
                this.tr.setPos(oldpos);
                this.destroy();
            }
        },
    });
    exports.Projectile = exports.GridCollider.extend({
        name: 'projectile',
        damage: 95,
        speed: 950,
        range: 2000,
        radius: 5,
        explRadius: 200,
        explDamage: 80,
        explKnockback: 500,
        expl: null,
        init: function(player,opt){ //opt: {game,pos,speed,heritSpeed}
            this._super(opt); 
            this.owner = player.ship || null;
            this.dir = V2(opt.dir);
            this.speedVec = this.dir.scale(this.speed);
            if(opt.heritSpeed){
                this.speedVec = this.speedVec.add(V2(opt.heritSpeed));
            }
            this.tr.setRotation(this.speedVec.azimuth());
            this.bound = new BRect(0,0,this.radius*2, this.radius*2,'centered');
            this.collisionBehaviour = 'emit';
        },
        compensateLag: function(networkDelay){
            console.log("Compensating Lag: "+networkDelay);
            this.tr.translate(this.speedVec.scale(networkDelay));
        },
        onInstantiation: function(){
            this.destroy(this.range/this.speed);
        },
        explosionGFX: function(){
            if(clientSide && this.Expl){
                this.scene.add(new this.Expl({pos:this.tr.getPos()}) );
            }
        },
        explosionDamage: function(){
            if(this.explDamage && this.explRadius){
                var entities = this.scene.getEntities();
                for(var i = 0, len = entities.length; i < len; i++){
                    var ent = entities[i];
                    if(ent instanceof exports.Ship){
                        dist = this.tr.dist(ent.tr);
                        if(dist.len() < this.explRadius){
                            if(ent.damage){
                                var fac = 1 - dist.len() / this.explRadius;
                                ent.damage(this.owner, this.explDamage * fac)
                            }
                        }
                    }
                }
            }
        },
        onUpdate: function(){
            this._super();
            var oldpos = this.tr.getPos();
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            if(this.gridCollisionVec()){
                this.tr.setPos(oldpos);
                this.destroy();
            }
        },
        onDestruction: function(){
            this.explosionGFX();
            this.explosionDamage();
            if(serverSide){
                this.game.destroyProj(this.guid);
            }
        },
        onCollisionEmit: function(ent){
            this._super(ent);
            if(ent instanceof exports.Ship && ent !== this.owner){
                ent.damage(this.owner,this.damage);
                this.destroy();
            }
        }
    });
    
    exports.MissileExplosion = Ent.extend({
        name: 'missileExplosion',
        drawable: assets.explosionSprite,
        smoke: assets.missileSmoke,
        init: function(opt){
            this._super(opt);
            this.drawable = this.drawable.clone();
            this.tr.setRotation( Math.random() * 6.28);
        },
        onUpdate: function(){
            this.drawable.alpha = Math.max(0,1-(5*(this.scene.time - this.startTime)));
            this.tr.scaleFac(1.05);
            return true;
        },
        onInstanciation: function(){
            this._super();
            this.destroy(0.4);
            /*if(!this.smoke){
                return;
            }
            for(var i = 0; i < 40; i++){
                var dir = V2.random().setLen(Math.random()*100 + 200);
                this.scene.add(new exports.Particle({
                    drawable: this.smoke,
                    pos:this.tr.getPos().add(dir.scale(0.1)),
                    speedVec: dir,
                    rotSpeed: Math.random()*4 -2,
                }));

            }
            */
        }
    });

    exports.BoltExplosion = exports.MissileExplosion.extend({
        name: 'boltExplosion',
        drawable: assets.boltExplosion,
        smoke: assets.boltSmoke,
    });

    exports.Missile = exports.Projectile.extend({
        name: 'missile',
        drawable: assets.missileSprite,
        Expl: exports.MissileExplosion,
        smokeInterval : 0.001,
        lastSmokeTime : 0,
        onUpdate: function(){
            this._super();
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            if(false && clientSide && this.lastSmokeTime < this.scene.time - this.smokeInterval){
                this.scene.add(new exports.Particle({
                    drawable: assets.missileSmoke,
                    pos:this.tr.getPos(),
                    speedVec: this.speedVec.scale(0.5).add(V2.random().scale(100)),
                    rotSpeed: Math.random()*2 -1,
                }));
                this.lastSmokeTime = this.scene.time;
            }
            return true;
        },
    });

    exports.Bolt = exports.Projectile.extend({
        name: 'bolt',
        drawable: assets.boltSprite,
        speed:600,
        damage:30,
        explDamage:25,
        Expl: exports.BoltExplosion,
        smokeInterval : 0.001,
        lastSmokeTime : 0,
        onUpdate: function(){
            this._super();
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            if(false && clientSide && this.lastSmokeTime < this.scene.time - this.smokeInterval){
                this.scene.add(new exports.Particle({
                    drawable: assets.boltSmoke,
                    pos:this.tr.getPos(),
                    speedVec: this.speedVec.scale(0.5).add(V2.random().scale(100)),
                    rotSpeed: Math.random()*2 -1,
                }));
                this.lastSmokeTime = this.scene.time;
            }
            return true;
        },
    });

    exports.Weapon = Class.extend({
        name:'BasicWeapon',
        Projectile: null,
        delay: 0.2,
        sequence: 5,
        cooldown: 0.2,
        inheritance: 0.5,
        automatic: true,
        spread: 0,
        ammo: 5,
        maxAmmo: 20,
        init: function(opt){
            this.main   = opt.main;
            this.owner  = opt.owner;
            this.player = opt.owner.player;
            this.game   = opt.owner.game;
            this.game.entclasses[this.name] = this.Projectile;
            this.lastFire = 0;
            this.index    = 0;
        },
        fire: function(pos,dir,heritSpeed){
            if(!this.main){
                this.main = this.owner.main;
            }
            var scene = this.main.scene;

            if(scene.time < this.lastFire + this.delay){
                return false;
            }else if(   this.index === this.sequence - 1 &&
                        scene.time < this.lastFire + this.delay + this.cooldown){
                return false;
            }
            if(this.ammo === 0){
                return false;
            }else if(this.ammo > 0){
                this.ammo--;
            }
            if(   scene.time > this.lastFire + this.delay + this.cooldown*0.5 || 
                  this.index >= this.sequence -1 ){
                this.index = 0;
            }else{
                this.index++;
            }
            console.log('Player: '+this.owner.player.name+' firing weapon: '+this.name);
            this.game.spawnProj(this.name, this.player.name,{
                pos: pos,
                dir: dir,
                heritSpeed: (heritSpeed || new V2()).scale(this.inheritance),
            });
            this.lastFire = scene.time;
        },
    });

    exports.MissileLauncher = exports.Weapon.extend({
        name:'Missile Launcher',
        Projectile: exports.Missile,
        delay: 0.7,
        sequence: 1,
        cooldown: 0,
        automatic: true,
        spread: 0,
        ammo: -1,
    });

    exports.Bolter = exports.Weapon.extend({
        name:'Bolter',
        Projectile: exports.Bolt,
        delay: 0.1,
        sequence: 5,
        cooldown: 0.2,
        automatic: true,
        spread: 0,
        ammo: -1,
    });
    
    exports.Block = Ent.extend({
        name: 'block',
        init: function(opt){
            this._super(opt);
            this.drawable = opt.sprite || Math.random() < 0.5 ? assets.blockSprite : assets.blockSpriteYellow;
            this.width = 110;
            this.collisionBehaviour = 'receive';
            this.bound = new BRect(0,0,this.width,this.width,'centered');
        },
    });

    exports.Building = Ent.extend({
        name: 'building',
        drawable: assets.buildingSprite,
        init: function(opt){
            this._super(opt);
            this.drawable = this.drawable.clone();
            var height = opt.height || this.height || 0;
            this.drawable.height = -0.1 - 0.05*height;
            this.drawable.alpha  = 0.5 - 0.5*height;
            this.tr.setScale(5);
        },
    });

    exports.GameCamera = Camera2d.extend({
        init: function(opt){
            opt = opt || {};
            this.game = opt.game || null;
            this.fps = new RunningMean({length: 60, value: 60});
        },
        onUpdate: function(){
            var lvl    = this.game.level;
            var player = this.game.getLocalPlayer();
            var ship   = player ? player.ship : null;
            var input  = this.main.input;
            this.fps.push(1/this.main.deltaTime);
            if(clientSide){
                $('.fps').html('fps:  '+Math.round(this.fps.mean)+ ' fps');
                $('.ping').html('ping: '+Math.round(this.game.rtt.mean * 1000)+ ' ms');
            }

            if(ship){
                var dpos = ship.tr.getPos().sub(this.tr.getPos());
                
                dpos = dpos.scale( Math.min(1, Math.max(1, dpos.len() /10) * this.main.deltaTime));

                this.tr.translate(dpos);

                var pos = this.tr.getPos();

                var cscale = this.tr.getScaleFac();
                if (ship.moveSpeed.len() > 1){
                    this.tr.setScale(Math.min(2,cscale+0.15*this.main.deltaTime));
                }else{
                    this.tr.setScale(Math.max(1,cscale-0.15*this.main.deltaTime));
                }
            }else{
                var lvlcenter = V2(lvl.grid.cellX,lvl.grid.cellY).mult(lvl.grid.cellSize).mult(0.5);
                var dpos = lvlcenter.sub(this.tr.getPos())
                dpos = dpos.scale(Math.min(1,this.main.deltaTime));
                this.tr.translate(dpos);
            }
        },
    });
    
    exports.ShipSpec = Class.extend({
        name:  'basic',
        type:  'fighter',  // 'fighter' | 'tank' | 'dpm' | 'scout' | 'defense' | 'skills' 
        startSpeed:  160,
        maxSpeed:    950,
        accel:       600,
        ctrlAccel:   10000, 
        deccel:      1000,
        drag:        50,
        bounce:      0.5,
        radius:      45,
        innerRadius: 45,
        knockDuration: 0.002,
        knockSpeed:  1,
        knockAccel:  50,
        knockBounce: 0.9,

        healthStart: 125,
        healthBase : 100,
        healthDecay: 5,
        healthBleed: 200,
        healthMax:   200,

        armorStart:  0,
        armorLimit:  100,
        armorMax:    200,
        armorDecay:  0,
        armorBleed:  0.666,

        regenDelay:  5,
        regenSpeed:  5,

        respawnSpeed: 1,

    });

    exports.Ship = exports.GridCollider.extend({
        init: function(opt){
            var opt = opt || {};
            this._super(opt);
            
            this.spec = opt.spec || this.spec || new exports.ShipSpec();
            this.player = opt.player || null;

            this.history       = [];
            this.frame         = 0;

            this.moveSpeed    = new V2();
            this.moveDir      = new V2();

            this.knockSpeed    = new V2();
            this.knockTime     = 0;

            this.weapons  = {
                'missile': new exports.MissileLauncher({ owner:this, main:this.main }),
                'bolter':  new exports.Bolter({ owner:this, main:this.main }),
            };
            this.weaponIndexes = [
                'missile',
                'bolter',
            ];
            this.weapon = this.weaponIndexes[0];
            
            this.shipSprite   = this.player.team === 'red' ? 
                assets.shipSpriteRed.clone():
                assets.shipSpriteBlue.clone();
            this.shipSpriteFiring = assets.shipSpriteFiring.clone();
            this.shipHover    = this.player.team === 'red' ?
                assets.shipHoverRed.clone():
                assets.shipHoverBlue.clone();
            this.shipHover2    = this.shipHover.clone();
            this.drawable     = opt.drawable || [
                this.shipHover,
                this.shipHover2,
                this.shipSprite,
            ];

            this.collisionBehaviour = 'both';
            this.bound = new BRect(0,0,this.spec.radius*2, this.spec.radius*2,'centered');
        },
        getState: function(){
            return {
                pos: this.tr.getPos(),
                rotation: this.tr.getRotation(),
                moveSpeed: this.moveSpeed.clone(),
                weapon: this.weapon,
                frame: this.frame,
            };
        },
        setState: function(state){
            this.tr.setPos(new V2(state.pos));
            this.tr.setRotation(state.rotation);
            this.weapon = state.weapon;
        },
        mergeState: function(state){
            for(var i = 0, len = this.history.length; i < len; i++){
                if(state.frame === this.history[i].state.frame){
                    var cstate = this.history[i].state;
                    if( !V2.equals(cstate.pos,state.pos) ||
                        !V2.equals(cstate.moveSpeed,state.moveSpeed )){
                        console.log('faulty merge:\n'+ state.frame + '\n' + JSON.stringify(state.pos) + '\n' + JSON.stringify(cstate.pos));
                        this.tr.setPos(new V2(state.pos));
                        this.moveSpeed = new V2(state.moveSpeed);
                        for(var j = i+1; j < len; j++){
                            this.applyControls(this.history[j].controls);
                        }
                    }
                    this.history = this.history.slice(i+1);
                    break;
                }
            }
        },
        damage: function(owner,damage){
            if(!owner ||( owner.player.team !== this.player.team)){
                damage = Math.max(0,Math.round(damage));
                var armordamage = Math.round(damage*2/3);
                if(this.player.armor > armordamage){
                    this.player.armor -= armordamage;
                }else{
                    armordamage = this.player.armor;
                    this.player.armor = 0;
                }
                this.player.health -= (damage - armordamage);
                if(owner){
                    this.player.lastFoe = owner.player;
                }
                return;
            }
        },
        getLocalControls: function(){
            var input = this.main.input;
            var dt = this.scene.deltaTime;
            var aimdir = this.scene.camera.getMouseWorldPos().sub(this.tr.getPos()).normalize();
            var weapon = undefined;
            if(input.isKeyPressing('weapon-missile')){
                weapon = 'missile';
            }else if(input.isKeyPressing('weapon-bolter')){
                weapon = 'bolter';
            }
            var movedir = new V2(
                input.isKeyDown('right') - input.isKeyDown('left'),
                input.isKeyDown('down') - input.isKeyDown('up')
            );
            var fire =  input.isKeyDown('fire');
            return {dt:dt, aimdir:aimdir, weapon:weapon, movedir:movedir, fire:fire, frame:this.frame};
        },
        applyControls: function(controls){
            this.frame = controls.frame;
            var dt = controls.dt;
            var movedir = controls.movedir;

            this.firing = controls.fire;
            if(controls.weapon){
                this.weapon = controls.weapon;
            }
            if(movedir.x === 0){
                if(this.moveSpeed.x > 0){
                    this.moveSpeed.x = Math.max(0,this.moveSpeed.x-this.spec.deccel*dt);
                }else{
                    this.moveSpeed.x = Math.min(0,this.moveSpeed.x+this.spec.deccel*dt);
                }
            }else{
                if(movedir.x > 0){
                    if(this.moveSpeed.x < this.spec.startSpeed){
                        this.moveSpeed.x += this.spec.ctrlAccel*dt;
                    }else{
                        this.moveSpeed.x = Math.min(this.spec.maxSpeed,this.moveSpeed.x+this.spec.accel*dt);
                    }
                }else{
                    if(this.moveSpeed.x > -this.spec.startSpeed){
                        this.moveSpeed.x -= this.spec.ctrlAccel*dt;
                    }else{
                        this.moveSpeed.x = Math.max(-this.spec.maxSpeed,this.moveSpeed.x-this.spec.accel*dt);
                    }
                }
            }
            if(movedir.y === 0){
                if(this.moveSpeed.y > 0){
                    this.moveSpeed.y = Math.max(0,this.moveSpeed.y-this.spec.deccel*dt);
                }else{
                    this.moveSpeed.y = Math.min(0,this.moveSpeed.y+this.spec.deccel*dt);
                }
            }else{
                if(movedir.y > 0){
                    if(this.moveSpeed.y < this.spec.startSpeed){
                        this.moveSpeed.y += this.spec.ctrlAccel*dt;
                    }else{
                        this.moveSpeed.y = Math.min(this.spec.maxSpeed,this.moveSpeed.y+this.spec.accel*dt);
                    }
                }else{
                    if(this.moveSpeed.y > -this.spec.startSpeed){
                        this.moveSpeed.y -= this.spec.ctrlAccel*dt;
                    }else{
                        this.moveSpeed.y = Math.max(-this.spec.maxSpeed,this.moveSpeed.y-this.spec.accel*dt);
                    }
                }
            }
            this.tr.translate(this.moveSpeed.scale(dt));
            var v = this.gridCollisionVec();
            if(v){
                if(v.x && v.x*this.moveSpeed.x < 0){
                    this.moveSpeed.x = 0;
                }
                if(v.y && v.y*this.moveSpeed.y < 0){
                    this.moveSpeed.y = 0;
                }
                this.tr.translate(v);
            }

            this.tr.setRotation((new V2(controls.aimdir).azimuth()*DEG + 90)*RAD);
            if(controls.fire && serverSide){
                var herit = this.moveSpeed.len() > 350  ? this.moveSpeed.scale(0.5 * Math.abs(this.moveSpeed.normalize().dot(controls.aimdir))) : new V2();
                if(this.weapons[this.weapon].fire(this.tr.getPos(), controls.aimdir,herit)){ // this.moveSpeed.scale(0.5))){
                    this.lastFireTime = this.scene.time;
                }
            }
        },
        getRemoteControls: function(){
            if(this.player.controls.length > 0){
                var controls = this.player.controls[0];
                this.player.controls = this.player.controls.splice(1);
            }
            return controls;
        },
        getRemoteState: function(){
            var state = this.player.shipstates[this.player.shipstates.length -1];
            this.player.shipstates = [];
            return state;
        },
        updateGraphics: function(){
            this.shipHover.alpha = 0.25 + 0.5* (1+0.5*Math.cos(this.scene.time*0.5));
            this.shipHover.scale = 0.8  + 0.4* (1-0.5*Math.cos(this.scene.time*0.5));

            this.shipHover2.alpha = 0.25 + 0.5* (1+0.5*Math.cos(this.scene.time*0.7));
            this.shipHover2.scale = 0.8  + 0.4* (1-0.5*Math.cos(this.scene.time*0.7));
        },
        onUpdate: function(){
            if(clientSide){
                this.frame += 1;
                if(this.player === this.game.getLocalPlayer()){
                    var controls = this.getLocalControls();
                    this.applyControls(controls);
                    this.game.send('server','controls',controls);
                    this.history.push({controls: controls, state: this.getState()});
                    var state = this.getRemoteState();
                    if(state){
                        this.mergeState(state);
                    }
                }else{
                    var state = this.getRemoteState();
                    if(state){
                        this.setState(state);
                    }else{
                        //extrapolate
                    }
                }
                this.updateGraphics();
            }else{
                var controls = this.getRemoteControls()
                while(controls){
                    this.applyControls(controls);
                    controls = this.getRemoteControls();
                }
                this.game.send('all','ship_update',{
                    player: this.player.name,
                    state: this.getState(),
                });
            }
        },
        onDestruction: function(){
            this.player.ship = null;
        },
    });
})(exports);

});

require.define("http",function(require,module,exports,__dirname,__filename,process,global){module.exports = require("http-browserify")
});

require.define("/node_modules/http-browserify/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"index.js","browserify":"index.js"}
});

require.define("/node_modules/http-browserify/index.js",function(require,module,exports,__dirname,__filename,process,global){var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');

http.request = function (params, cb) {
    if (!params) params = {};
    if (!params.host) params.host = window.location.host.split(':')[0];
    if (!params.port) params.port = window.location.port;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

});

require.define("events",function(require,module,exports,__dirname,__filename,process,global){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/node_modules/http-browserify/lib/request.js",function(require,module,exports,__dirname,__filename,process,global){var Stream = require('stream');
var Response = require('./response');
var concatStream = require('concat-stream')

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = concatStream()
    
    var uri = params.host + ':' + params.port + (params.path || '/');
    
    xhr.open(
        params.method || 'GET',
        (params.scheme || 'http') + '://' + uri,
        true
    );
    
    if (params.headers) {
        Object.keys(params.headers).forEach(function (key) {
            if (!self.isSafeRequestHeader(key)) return;
            var value = params.headers[key];
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    xhr.setRequestHeader(key, v);
                });
            }
            else xhr.setRequestHeader(key, value)
        });
    }
    
    var res = new Response;
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        res.handle(xhr);
    };
};

Request.prototype = new Stream;

Request.prototype.setHeader = function (key, value) {
    if ((Array.isArray && Array.isArray(value))
    || value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
            this.xhr.setRequestHeader(key, value[i]);
        }
    }
    else {
        this.xhr.setRequestHeader(key, value);
    }
};

Request.prototype.write = function (s) {
    this.body.write(s);
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.write(s);
    this.body.end()
    this.xhr.send(this.body.getBody());
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return (Request.unsafeHeaders.indexOf(headerName.toLowerCase()) === -1)
};

});

require.define("stream",function(require,module,exports,__dirname,__filename,process,global){var events = require('events');
var util = require('util');

function Stream() {
  events.EventEmitter.call(this);
}
util.inherits(Stream, events.EventEmitter);
module.exports = Stream;
// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once, and
  // only when all sources have ended.
  if (!dest._isStdio && (!options || options.end !== false)) {
    dest._pipeCount = dest._pipeCount || 0;
    dest._pipeCount++;

    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest._pipeCount--;

    // remove the listeners
    cleanup();

    if (dest._pipeCount > 0) {
      // waiting for other incoming streams to end.
      return;
    }

    dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('end', cleanup);
    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('end', cleanup);
  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

});

require.define("util",function(require,module,exports,__dirname,__filename,process,global){var events = require('events');

exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

});

require.define("/node_modules/http-browserify/lib/response.js",function(require,module,exports,__dirname,__filename,process,global){var Stream = require('stream');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

Response.prototype = new Stream;

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
                if ((Array.isArray && Array.isArray(headers[key]))
                || headers[key] instanceof Array) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = xhr.responseType.toLowerCase();
    if (respType === "blob") return xhr.responseBlob;
    if (respType === "arraybuffer") return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this.write(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this.write(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
    }
};

Response.prototype.write = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

});

require.define("/node_modules/http-browserify/node_modules/concat-stream/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {}
});

require.define("/node_modules/http-browserify/node_modules/concat-stream/index.js",function(require,module,exports,__dirname,__filename,process,global){var stream = require('stream')
var util = require('util')

function ConcatStream(cb) {
  stream.Stream.call(this)
  this.writable = true
  if (cb) this.cb = cb
  this.body = []
  if (this.cb) this.on('error', cb)
}

util.inherits(ConcatStream, stream.Stream)

ConcatStream.prototype.write = function(chunk) {
  this.body.push(chunk)
}

ConcatStream.prototype.arrayConcat = function(arrs) {
  if (arrs.length === 0) return []
  if (arrs.length === 1) return arrs[0]
  return arrs.reduce(function (a, b) { return a.concat(b) })
}

ConcatStream.prototype.isArray = function(arr) {
  var isArray = Array.isArray(arr)
  var isTypedArray = arr.toString().match(/Array/)
  return isArray || isTypedArray
}

ConcatStream.prototype.getBody = function () {
  if (this.body.length === 0) return
  if (typeof(this.body[0]) === "string") return this.body.join('')
  if (this.isArray(this.body[0])) return this.arrayConcat(this.body)
  if (typeof(Buffer) !== "undefined" && Buffer.isBuffer(this.body[0])) {
    return Buffer.concat(this.body)
  }
  return this.body
}

ConcatStream.prototype.end = function() {
  if (this.cb) this.cb(false, this.getBody())
}

module.exports = function(cb) {
  return new ConcatStream(cb)
}

module.exports.ConcatStream = ConcatStream

});

require.define("/main.js",function(require,module,exports,__dirname,__filename,process,global){var game = require('./game/game.js');

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
        $('.name_select input')[0].focus();

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

});
require("/main.js");
})();
