(function(exports){
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
            var density = opt.density || 0.1;
            var bgdensity = opt.bgdensity || 0.1;
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
                        cell = 1;
                    }else{
                        var r = Math.random();
                        if(r < density){
                            cell = r < density * 0.5 ? 1 : 2;
                        }else if(r - density < bgdensity){
                            cell = r - density < bgdensity*0.5 ? -1 : -2;
                        }
                    }
                    grid.setCell(x,y,cell);
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
        onCollisionEmit: function(ent){
            var self = this;
            if(ent instanceof exports.Level){
                var vec = ent.grid.collisionVec(
                    this.bound.cloneAt(this.tr.getPos()),
                    function(cell,x,y){ return self.isSolid(cell,x,y); }
                );
                if(vec){
                    this.onGridCollision(ent.grid,vec);
                }
            }
        },
        isSolid: function(cell,x,y){
            return cell > 0;
        },
        onGridCollision: function(cells){},
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
            var  time = this.scene.time - this.startTime;
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            this.tr.rotate(this.rotSpeed*this.scene.deltaTime);
            this.drawable.alpha = Math.max(0,0.15-(0.3*time));
            this.tr.setScale(0.4+3*time);
            this.speedVec = this.speedVec.scale(0.99);
            return true;
        },
        onGridCollision: function(grid,vec){
            this.tr.translate(vec);
            this.destroy();
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
        onInstantiation: function(){
            this.destroy(this.range/this.speed);
        },
        explode: function(){
            /*
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
            if(this.Expl){
                this.scene.add(new this.Expl({pos:this.tr.getPos()}) );
            }*/
        },
        onUpdate: function(){
            this._super();
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
        },
        onGridCollision: function(grid,vec){
            this.tr.translate(vec);
            this.explode();
            this.destroy();
        },
        onDestruction: function(){
            if(serverSide){
                this.game.destroyEnt(this.guid);
            }
        },
        onCollisionEmit: function(ent){
            this._super(ent);
            if(ent instanceof exports.Ship && ent !== this.owner){
                ent.damage(this.owner,this.damage);
                if(this.Expl){
                    this.scene.add(new this.Expl({pos:this.tr.getPos()}));
                }
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
        onInstanciation:function(){
            this.destroy(0.4);
        },
        onUpdate: function(){
            this.drawable.alpha = Math.max(0,1-(5*(this.scene.time - this.startTime)));
            this.tr.scaleFac(1.05);
            return true;
        },
        onInstanciation: function(){
            this._super();
            if(!this.smoke){
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
        }
    });

    exports.BoltExplosion = exports.MissileExplosion.extend({
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
            if(this.lastSmokeTime < this.scene.time - this.smokeInterval){
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
        explosionDamage:25,
        Expl: exports.BoltExplosion,
        smokeInterval : 0.001,
        lastSmokeTime : 0,
        onUpdate: function(){
            this._super();
            this.tr.translate(this.speedVec.scale(this.scene.deltaTime));
            if(this.lastSmokeTime < this.scene.time - this.smokeInterval){
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
            this.game.spawnEnt(this.name, this.player.name,{
                pos: pos,
                dir: dir,
                heritSpeed: (heritSpeed || new V2()).scale(this.inheritance),
            });
            /*
            if(this.Projectile){
                var proj = new this.Projectile({ 
                    owner: this.owner,
                    pos: pos,
                    dir: dir,
                    heritSpeed: (heritSpeed || new V2()).scale(this.inheritance),
                });
                this.main.scene.add(proj);
            }*/
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
        accel:       500,
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

            this.moveSpeed    = new V2();
            this.moveDir      = new V2();
            this.aimdir       = new V2(1,0);

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
            this.colVec = new V2();
        },
        getState: function(){
            return {
                pos: this.tr.getPos(),
                rotation: this.tr.getRotation(),
                moveSpeed: this.moveSpeed.clone(),
                weapon: this.weapon,
            };
        },
        setState: function(state){
            this.tr.setPos(new V2(state.pos));
            this.tr.setRotation(state.rotation);
            this.weapon = state.weapon;
        },
        mergeState: function(state){
            var lpos = this.tr.getPos();
            var rpos = new V2(state.pos);
            if(lpos.dist(rpos) < 0){
                this.tr.setPos(lpos.lerp(rpos,0.1));
            }else{
                this.tr.setPos(rpos);
            }
        },
        damage: function(owner,damage){
            if(owner.player.team !== this.player.team){
                this.player.health -= damage;
                console.log(owner.player.name+' inflicted '+damage+' damage to player '+this.player.name);
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
            return {dt:dt, aimdir:aimdir, weapon:weapon, movedir:movedir, fire:fire};
        },
        applyControls: function(controls){
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
            this.tr.setRotation((new V2(controls.aimdir).azimuth()*DEG + 90)*RAD);
            if(controls.fire && serverSide){
                var herit = this.moveSpeed.len() > 350  ? this.moveSpeed.scale(0.5 * Math.abs(this.moveSpeed.normalize().dot(this.aimdir))) : new V2();
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
                if(this.player.type === 'local'){
                    var controls = this.getLocalControls();
                    this.applyControls(controls);
                    this.game.send('server','controls',controls);
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
        onGridCollision: function(grid,colVec){
            var knocked = this.knockTime > this.scene.time;
            this.colVec = colVec;
            this.tr.translate(this.colVec);
            if(this.colVec.x){
                if(knocked){
                    this.knockSpeed.x = - this.knockSpeed.x * this.spec.knockBounce;
                    this.moveSpeed.x = this.knockSpeed.x ;
                }else if(this.moveDir.x * this.moveSpeed.x <= 0){
                    this.moveSpeed.x = -this.moveSpeed.x * this.spec.bounce;
                }else{
                    this.moveSpeed.x = 0;
                }
            }else{
                if(knocked){
                    this.knockSpeed.y = - this.knockSpeed.y * this.spec.knockBounce;
                    this.moveSpeed.y = this.knockSpeed.y ;
                }else if(this.moveDir.y * this.moveSpeed.y <= 0){
                    this.moveSpeed.y = -this.moveSpeed.y * this.spec.bounce;
                }else{
                    this.moveSpeed.y = 0;
                }
            }
        },
        onDestruction: function(){
            this.player.ship = null;
        },
    });
})(exports);
