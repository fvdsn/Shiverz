window.onload = function() {

    window.canvas = document.getElementById('test_canvas_1');
    window.context = canvas.getContext('2d');
    
    modula.use();   

    var itemSprites = new RendererCanvas2d.SpriteMap({
        src:'img/items.png',
        cellSize: 64,
        centered:true,
        compose:'lighter',
        sprites:[
            { name:'weapon-missiles', index:[0,0] },
            { name:'weapon-bolter',   index:[1,0] },
            { name:'weapon-vulcan',   index:[2,0] },
            { name:'weapon-grenades', index:[3,0] },
            { name:'weapon-shotgun',  index:[4,0] },
            { name:'weapon-razor',    index:[5,0] },
            { name:'weapon-pepew',    index:[6,0] },
            { name:'weapon-mines',    index:[7,0] },

            { name:'ammo-missiles',   index:[0,1] },
            { name:'ammo-bolter',     index:[1,1] },
            { name:'ammo-vulcan',     index:[2,1] },
            { name:'ammo-grenades',   index:[3,1] },
            { name:'ammo-shotgun',    index:[4,1] },
            { name:'ammo-razor',      index:[5,1] },
            { name:'ammo-pepew',      index:[6,1] },
            { name:'ammo-mines',      index:[7,1] },

            { name:'health',          index:[0,2] },
            { name:'armor',           index:[1,2] },
            { name:'quad',            index:[2,2] },
            { name:'xpowah',          index:[3,2] },
            { name:'flag-blue',       index:[4,2] },
            { name:'flag-red',        index:[5,2] },

            { name:'health-small',    index:[0,3] },
            { name:'armor-small',     index:[1,3] },
        ],
    });

    var shipSprite = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow.png',
        centered:true,
    });

    var buildingSprite = new RendererCanvas2d.DrawableSprite({
        pass:'buildings',
        alpha: 0.5,
        src:'img/blurred-buildings.png',
        centered:true,
        height:-1,
    });

    var shipHover = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128blue.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });

    var shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow_firing.png',
        centered:true,
    });
    
    var missileSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-green.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    var missileSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-green.png',
        compose: 'lighter',
        centered:true,
    });

    var boltSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-red.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    var boltSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-red.png',
        compose: 'lighter',
        centered:true,
    });

    var boltExplosion = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128red.png',
        compose: 'lighter',
        centered:true,
    });
    
    var explosionSprite = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128green.png',
        compose: 'lighter',
        centered:true,
    });
    
    var blockSpriteUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-under.png',
        pos:new V2(-12,-16),
    });

    var blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new V2(-12,-16),
    });

    var blockSpritePurpleUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple-under.png',
        pos:new V2(-12,-16),
    });

    var blockSpritePurple = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple.png',
        pos:new V2(-12,-16),
    });

    var blockSpriteGray = new RendererCanvas2d.DrawableSprite({
        src:'img/block-gray.png',
        pos:new V2(-12,16),
    });

    var blockSpriteDark = new RendererCanvas2d.DrawableSprite({
        src:'img/block-dark-gray.png',
        pos:new V2(-12,16),
    });

    var bindings = {
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

    var Item = Ent.extend({
        name:'item',
        spawn: 0,
        delay: 5,
        collisionBehaviour:'emit',
        bound: new Rect(0,0,50,50,'centered'),
        effect: function(player){
        },
    });

    var Flag = Item.extend({
        name:'flag',
        team:'zen',
        effect: function(player){
            player.takeFlag(this.team);
        },
    });

    var Armor = Item.extend({
        name: 'armor',
        armor: 5,
        effect: function(player){
            player.addArmor(this.name, this.health);
        },
    });

    var HealthKit = Item.extend({
        name:'healthkit',
        health: 50,
        effect: function(player){
            player.addHealth(this.name,this.health);
        },
    });

    var SuperPower = Item.extend({
        effect: function(player){
            player.powerup(this.name);
        },
    });

    var QuadDamage = SuperPower.extend({
        name:'quad',
        spawn: 20,
        delay: 20,
    });

    var Ammo = Item.extend({
        name:'ammo',
        weapon:'none',
        ammo:10,
        effect: function(player){
            player.addAmmo(this.weapon,this.ammo);
        },
    });

    var WeaponItem = Ammo.extend({
        name:'weaponItem',
        weapon:'none',
        ammo:10,
        effect: function(player){
            player.addWeapon(this.weapon,this.ammo);
        },
    });

    var Level = Ent.extend({
        init: function(options){
            options = options || {};
            this._super(options);
            this.spawns = {
                zen: [],
                aku: [],
            };
            this.flags = {
                zen: null,
                aku: null,
            };
            this.theme = {
                grid:{
                    1: blockSprite,
                    2: blockSpritePurple,
                },
                gridbg:{
                    '-1': blockSpriteGray,
                    '-2': blockSpriteDark,
                      1 : blockSpriteUnder,
                      2 : blockSpritePurpleUnder,
                },
                bgcolor: '#333',
            };
            if(options.theme){
                for(x in options.theme){
                    this.theme[x] = options.theme[x];
                }
            }
            this.collisionBehaviour = 'receive';
            this.name     = options.name || 'default';
            this.editing  = false;
            this.editCell = 1;
            this.grid     = new Grid({
                cellX: 50,
                cellY: 50,
                cellSize: 103,
                fill:0,
            });
            this.load();
        },
        save: function(){
            localStorage['shivrz_lvl_'+ this.name] = JSON.stringify({
                cellX:    this.grid.get('cellX'),
                cellY:    this.grid.get('cellY'),
                cellSize: this.grid.get('cellSize'),
                cells:    this.grid.get('cells'),
            });
        },
        load: function(){
            var lvl  = localStorage['shivrz_lvl_'+this.name];
            if(lvl){
                lvl = JSON.parse(lvl);
                if(lvl){
                    this.grid = new Grid({
                        cellX: lvl.cellX,
                        cellY: lvl.cellY,
                        cellSize: new V2(lvl.cellSize),
                        cells: lvl.cells,
                    });
                }
            }
            this.bound   = new Rect(0,0,this.grid.get('size').x, this.grid.get('size').y);
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
        onUpdate: function(){
            var input = this.main.input;
            if(!this.scene.camera){
                return;
            }
            var mouse = this.transform.worldToLocal(this.scene.camera.getMouseWorldPos());
            var cell = this.grid.getCellAtPixel(mouse);
            if(cell && this.editing){
                if(input.isKeyDown('mouse-left')){
                    this.grid.set('cell',[cell.x,cell.y],this.editCell);
                    this.save();
                }else if(input.isKeyDown('mouse-middle')){
                    this.grid.set('cell',[cell.x,cell.y],0);
                    this.save();
                }
            }
            if(input.isKeyDown('1')){
                this.editCell = 1;
            }else if(input.isKeyDown('2')){
                this.editCell = 2;
            }else if(input.isKeyDown('3')){
                this.editCell = -1;
            }else if(input.isKeyDown('4')){
                this.editCell = -2;
            }else if(input.isKeyDown('0')){
                this.editCell = 0;
            }else if(input.isKeyPressing('editlvl')){
                this.editing = !this.editing;
            }
        },
    });

    var lvl = new Level();

    var GridCollider = Ent.extend({
        onCollisionEmit: function(ent){
            var self = this;
            if(ent instanceof Level){
                var vec = ent.grid.collisionVec(
                    this.bound.cloneAt(this.transform.getPos()),
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

    var Particle   = GridCollider.extend({
        name: 'particle',
        radius: 5,
        init: function(opt){
            this._super(opt);
            this.speedVec = opt.speedVec || new V2();
            this.transform.setRotation(this.speedVec.azimuth());
            this.bound = new Rect(0,0,this.radius*2,this.radius*2,'centered');
            this.collisionBehaviour = 'emit';
            this.rotSpeed = opt.rotSpeed || 0;
            this.drawable = this.drawable ? this.drawable.clone() : missileSmoke.clone();
            this.transform.setRotation(Math.random()*6.28);
        },
        onInstanciation:function(){
            this.destroy(0.8);
        },
        onUpdate: function(){
            this._super();
            var time = this.scene.time - this.startTime;
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
            this.increase('rotation',this.rotSpeed*this.scene.deltaTime);
            this.drawable.alpha = Math.max(0,0.15-(0.3*time));
            this.transform.setScale(0.4+3*time);
            this.speedVec = this.speedVec.scale(0.99);
            return true;
        },
        onGridCollision: function(grid,vec){
            this.increase('pos',vec);
            this.destroy();
        },
    });
    var Projectile = GridCollider.extend({
        name: 'projectile',
        damage: 100,
        owner: null,
        speed: 950,
        range: 2000,
        radius: 5,
        explRadius: 200,
        explDamage: 90,
        explKnockback: 500,
        expl: null,
        dir : new V2(1,0),
        init: function(opt){
            this._super(opt);
            this.owner = opt.owner || this.owner;
            this.dir = opt.dir || this.dir;
            this.speedVec = this.dir.scale(this.speed);
            if(opt.heritSpeed){
                this.speedVec = this.speedVec.add(opt.heritSpeed);
            }
            this.transform.setRotation(this.speedVec.azimuth());
            this.bound = new Rect(0,0,this.radius*2, this.radius*2,'centered');
            this.collisionBehaviour = 'emit';
        },
        onInstantiation: function(){
            this.destroy(this.range/this.speed);
        },
        explode: function(){
            if(this.explDamage && this.explRadius){
                var ents = this.scene.get('entity');
                for(var i = 0, len = ents.length; i < len; i++){
                    var ent = ents[i];
                    if(ent instanceof PlayerShip){
                        dist = this.transform.dist(ent.transform);
                        if(dist.len() < this.explRadius){
                            if(ent.damage){
                                var fac = 1 - dist.len() / this.explRadius;
                                ent.damage(this.explDamage * fac,
                                           this.explKnockback * fac,
                                           dist.normalize());
                            }
                        }
                    }
                }
            }
            if(this.Expl){
                this.scene.add(new this.Expl({pos:this.transform.pos}) );
            }
        },
        onUpdate: function(){
            this._super();
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
            return true;
        },
        onGridCollision: function(grid,vec){
            this.increase('pos',vec);
            this.explode();
            this.destroy();
        },
    });
    
    var MissileExplosion = Ent.extend({
        name: 'missileExplosion',
        drawable: explosionSprite,
        smoke: missileSmoke,
        init: function(opt){
            this._super(opt);
            this.drawable = this.drawable.clone();
            this.set('rotation', Math.random() * 6.28);
        },
        onInstanciation:function(){
            this.destroy(0.4);
        },
        onUpdate: function(){
            this.drawable.alpha = Math.max(0,1-(5*(this.scene.time - this.startTime)));
            this.transform.scaleFac(1.05);
            return true;
        },
        onInstanciation: function(){
            this._super();
            if(!this.smoke){
                return;
            }
            for(var i = 0; i < 40; i++){
                var dir = V2.random().setLen(Math.random()*100 + 200);
                this.scene.add(new Particle({
                    drawable: this.smoke,
                    pos:this.transform.getPos().add(dir.scale(0.1)),
                    speedVec: dir,
                    rotSpeed: Math.random()*4 -2,
                }));

            }
        }
    });

    var BoltExplosion = MissileExplosion.extend({
        drawable: boltExplosion,
        smoke: boltSmoke,
    });

    var Missile = Projectile.extend({
        name: 'missile',
        drawable: missileSprite,
        Expl: MissileExplosion,
        smokeInterval : 0.001,
        lastSmokeTime : 0,
        onUpdate: function(){
            this._super();
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
            if(this.lastSmokeTime < this.scene.time - this.smokeInterval){
                this.scene.add(new Particle({
                    drawable: missileSmoke,
                    pos:this.transform.getPos(),
                    speedVec: this.speedVec.scale(0.5).add(V2.random().scale(100)),
                    rotSpeed: Math.random()*2 -1,
                }));
                this.lastSmokeTime = this.scene.time;
            }
            return true;
        },
    });

    var Bolt = Projectile.extend({
        name: 'bolt',
        drawable: boltSprite,
        speed:600,
        Expl: BoltExplosion,
        smokeInterval : 0.001,
        lastSmokeTime : 0,
        onUpdate: function(){
            this._super();
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
            if(this.lastSmokeTime < this.scene.time - this.smokeInterval){
                this.scene.add(new Particle({
                    drawable: boltSmoke,
                    pos:this.transform.getPos(),
                    speedVec: this.speedVec.scale(0.5).add(V2.random().scale(100)),
                    rotSpeed: Math.random()*2 -1,
                }));
                this.lastSmokeTime = this.scene.time;
            }
            return true;
        },
    });

    var Weapon = Class.extend({
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
            this.main = opt.main;
            this.owner = opt.owner;
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
            if(this.Projectile){
                var proj = new this.Projectile({ 
                    owner: this.owner,
                    pos: pos,
                    dir: dir,
                    heritSpeed: (heritSpeed || new V2()).scale(this.inheritance),
                });
                this.main.scene.add(proj);
            }
            this.lastFire = scene.time;
            
        },
    });

    var MissileLauncher = Weapon.extend({
        name:'Missile Launcher',
        Projectile: Missile,
        delay: 0.7,
        sequence: 1,
        cooldown: 0,
        automatic: true,
        spread: 0,
        ammo: -1,
    });

    var Bolter = Weapon.extend({
        name:'Bolter',
        Projectile: Bolt,
        delay: 0.1,
        sequence: 5,
        cooldown: 0.2,
        automatic: true,
        spread: 0,
        ammo: -1,
    });
    
    var Block = Ent.extend({
        name: 'block',
        init: function(opt){
            this._super(opt);
            this.drawable = opt.sprite || Math.random() < 0.5 ? blockSprite : blockSpriteYellow;
            this.width = 110;
            this.collisionBehaviour = 'receive';
            this.bound = new Rect(0,0,this.width,this.width,'centered');
        },
    });

    var Building = Ent.extend({
        name: 'building',
        drawable: buildingSprite,
        init: function(opt){
            this._super(opt);
            this.drawable = this.drawable.clone();
            var height = opt.height || this.height || 0;
            this.drawable.height = -0.1 - 0.05*height;
            this.drawable.alpha  = 0.5 - 0.5*height;
            this.transform.setScale(5);
        },
    });

    var PlayerCamera = Camera2d.extend({
        name: 'playerCamera',
        parallax: true,
        init: function(player){
            this.player = player;
            this.set('pos',player.get('pos'));
            this.fpses = [60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60];
        },
        getMinFPS: function(){
            var min = Number.MAX_VALUE;
            for(var i = 0; i < this.fpses.length; i++){
                min = Math.min(min,this.fpses[i]);
            }
            return min;
        },
        getMaxFPS: function(){
            var max = 0;
            for(var i = 0; i < this.fpses.length; i++){
                max = Math.max(max,this.fpses[i]);
            }
            return max;
        },
        getAvgFPS: function(){
            var avg = 0;
            for(var i = 0; i < this.fpses.length; i++){
                avg += this.fpses[i];
            }
            return Math.round(avg / this.fpses.length);
        },
        recordFPS: function(fps){
            this.fpses.shift();
            this.fpses.push(fps);
        },
        onUpdate: function(){
            var input = this.main.input;
            this.recordFPS(1/this.main.deltaTime);
            $('.fps').html(''+this.getAvgFPS()+ ' fps');

            if(input.isKeyDown('z')){
                this.increase('scale',new V2(1*this.main.deltaTime));
            }else if(input.isKeyDown('x')){
                this.increase('scale',new V2(-1*this.main.deltaTime));
            }
            if(input.isKeyDown('c')){
                this.increase('rotation',1*this.main.deltaTime);
            }else if(input.isKeyDown('v')){
                this.increase('rotation',-1*this.main.deltaTime);
            }
            var center = new V2( 
                    window.innerWidth/2,
                    window.innerHeight/2
            );
            var oldpos = this.get('pos');
            var dpos = this.player.get('pos').sub(this.get('pos'));
            var odpos = dpos;
            
            dpos = dpos.scale( Math.max(1, dpos.len() /10) * this.main.deltaTime);

            this.increase('pos',dpos);

            var pos = this.get('pos');

            var cscale = this.get('scaleFac');
            if(!lvl.editing){
                if (this.player.moveSpeed.len() > 1){
                    this.set('scale',Math.min(2,cscale+0.15*this.main.deltaTime));
                }else{
                    this.set('scale',Math.max(1,cscale-0.15*this.main.deltaTime));
                }
            }
            return true;
        },
    });
    
    
    var ShipSpec = Class.extend({
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

    var PlayerShip = GridCollider.extend({
        name: 'player',
        init: function(opt){
            var opt = opt || {};
            this._super(opt);
            
            this.spec = opt.spec || this.spec || new ShipSpec();

            this.moveSpeed    = new V2();
            this.moveDir      = new V2();
            this.aimdir       = new V2();

            this.knockSpeed    = new V2();
            this.knockTime     = 0;

            this.weapons  = {
                'missile': new MissileLauncher({ owner:this, main:this.main }),
                'bolter':  new Bolter({ owner:this, main:this.main }),
            };
            this.weaponIndexes = [
                'missile',
                'bolter',
            ];
            this.weapon = this.get('weapon',0);
            
            this.shipSprite   = shipSprite.clone();
            this.shipSpriteFiring = shipSpriteFiring.clone();
            this.shipHover    = shipHover.clone();
            this.shipHover2    = shipHover.clone();
            this.drawable     = opt.drawable || [
                this.shipHover,
                this.shipHover2,
                this.shipSprite,
            ];

            this.collisionBehaviour = 'emit';
            this.bound = new Rect(0,0,this.spec.radius*2, this.spec.radius*2,'centered');
            this.colVec = new V2();


        },
        _get_weapon: function(index){
            if(typeof index === 'number'){
                return this.weapons[this.weaponIndexes[index]];
            }else if(index){
                return this.weapons[index];
            }else{
                return this.weapon;
            }
        },
        _set_weapon: function(weapon){
            this.weapon = this.get('weapon',weapon);
        },
        damage: function(damage,knockback,dir){
            var knockTime = Math.max(0.5,Math.min(1.5,knockback * this.spec.knockDuration));
            var knockSpeed = dir.scale(knockback*this.spec.knockSpeed);
            if(this.knockTime > this.scene.time){
                this.knockSpeed = this.knockSpeed.add(knockSpeed);
                this.knockTime += knockTime;
            }else{
                this.knockTime = this.scene.time + knockTime;
                this.knockSpeed = knockSpeed;
            }
        },

        onInstanciation: function(){
            this.scene.camera = new PlayerCamera(this);
        },
    
        onUpdate: function(){
            var input = this.main.input;
            var dt = this.scene.deltaTime;
            var knocked = this.knockTime > this.scene.time;
            this.aimdir = this.scene.camera.getMouseWorldPos().sub(this.transform.pos).normalize();

            if(input.isKeyPressing('weapon-missile')){
                this.set('weapon','missile');
            }else if(input.isKeyPressing('weapon-bolter')){
                this.set('weapon','bolter');
            }

            if(input.isKeyDown('pause')){
                this.main.exit();
            }
            
            if(input.isKeyDown('left')){
                this.moveDir.x = -1;
            }else if(input.isKeyDown('right')){
                this.moveDir.x = 1;
            }else{
                this.moveDir.x = 0;
            }
            if(input.isKeyDown('up')){
                this.moveDir.y = -1;
            }else if(input.isKeyDown('down')){
                this.moveDir.y = 1;
            }else{
                this.moveDir.y = 0;
            }

            if(this.moveDir.x === 0){
                if(this.moveSpeed.x > 0){
                    this.moveSpeed.x = Math.max(0,this.moveSpeed.x-this.spec.deccel*dt);
                }else{
                    this.moveSpeed.x = Math.min(0,this.moveSpeed.x+this.spec.deccel*dt);
                }
            }else{
                if(this.moveDir.x > 0){
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
            if(this.moveDir.y === 0){
                if(this.moveSpeed.y > 0){
                    this.moveSpeed.y = Math.max(0,this.moveSpeed.y-this.spec.deccel*dt);
                }else{
                    this.moveSpeed.y = Math.min(0,this.moveSpeed.y+this.spec.deccel*dt);
                }
            }else{
                if(this.moveDir.y > 0){
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
            
            if(!lvl.editing &&input.isKeyDown('fire')){
                var herit = this.moveSpeed.len() > 350  ? this.moveSpeed.scale(0.5 * Math.abs(this.moveSpeed.normalize().dot(this.aimdir))) : new V2();
                if(this.weapon.fire(this.get('pos'), this.aimdir,herit)){ // this.moveSpeed.scale(0.5))){
                    this.lastFireTime = this.scene.time;
                }
            }

            if( this.scene.time - this.lastFireTime < 0.05 ){
                this.drawable = [this.shipHover, this.shipHover2, this.shipSpriteFiring];
            }else{
                this.drawable = [this.shipHover, this.shipHover2, this.shipSprite];
            }
            if(knocked){
                this.moveSpeed = this.knockSpeed.clone();
            }
            
            this.increase('pos',this.moveSpeed.scale(this.scene.deltaTime));
            
            var prevRotation = this.get('rotation'); 
            if(knocked){
                this.increase('rotation',90*degToRad*this.scene.deltaTime);
            }else{
                this.set('rotation',this.aimdir.azimuth() + 90*degToRad);
            }
            var deltaRot = Math.abs(prevRotation - this.get('rotation'));

            this.shipHover.alpha = 0.25 + 0.5* (1+0.5*Math.cos(this.scene.time*0.5));
            this.shipHover.scale = 0.8  + 0.4* (1-0.5*Math.cos(this.scene.time*0.5));

            this.shipHover2.alpha = 0.25 + 0.5* (1+0.5*Math.cos(this.scene.time*0.7));
            this.shipHover2.scale = 0.8  + 0.4* (1-0.5*Math.cos(this.scene.time*0.7));
            
            if(this.moveSpeed.len() >= 1 || deltaRot > 0.001){
                return true;
            }
        },

        onGridCollision: function(grid,colVec){
            var knocked = this.knockTime > this.scene.time;
            this.colVec = colVec;
            this.increase('pos',this.colVec);
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
                
    });
    
    var ShivrzScene = Scene.extend({
        onSceneStart: function(){
            this.lastTime = -1;
            this.add(new PlayerShip({
                pos: new V2(
                    window.innerWidth/2,
                    window.innerHeight/2
                ),
            }));
            this.add(lvl);
            /*
            for(var i = 0; i < 50; i++){
                this.add(new Building({
                    pos:V2.newRandomPositive().scale(4000,2000).add(new V2(-1000,-1000)),
                    height: Math.random(), //-(Math.random()+0.1),
                }))
            }*/
        },
        onFrameEnd: function(){
        },
    });

    window.main   = new Main({
        input: new Input({
            alias: bindings,
        }),
        scene: new ShivrzScene({
            renderer: new RendererCanvas2d({
                passes:[
                    'buildings',
                    'bgblocks',
                    'ships',
                    'projectiles',
                    'explosions',
                    'blocks',
                ],
                canvas:window.canvas,
                getSize: function(){
                    return new V2(window.innerWidth,window.innerHeight);
                },
                background: 'rgba(40,35,30,1)',
                alwaysRedraw: false,
            }),
        }),
    });

    window.main.set('fps',60);
    window.main.run();
};
