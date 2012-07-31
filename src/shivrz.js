window.onload = function() {

    window.canvas = document.getElementById('test_canvas_1');
    window.context = canvas.getContext('2d');
    
    modula.use();   

    var shipSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/ship_yellow.png',
        centered:true,
    });

    var shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
        src:'img/ship_yellow_firing.png',
        centered:true,
    });
    
    var missileSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/projectile-green.png',
        globalCompositeOperation: 'lighter',
        pos: new Vec2(-20,0),
        centered:true,
    });
    var boltSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/projectile-red.png',
        globalCompositeOperation: 'lighter',
        pos: new Vec2(-20,0),
        centered:true,
    });
    
    var explosionSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/explosion128blue.png',
        globalCompositeOperation: 'lighter',
        centered:true,
    });
    
    var blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new Vec2(-12,-12),
    });

    var blockSpriteYellow = new RendererCanvas2d.DrawableSprite({
        src:'img/blockyellow.png',
        pos:new Vec2(-12,-12),
    });

    var grid = new Grid({
        cellX: 50,
        cellY: 50,
        cellSize: 103,
        fill:0,
        /*
        cells: [ 
            2,0,1,0,1,0,1,0,2,2,0,1,0,1,0,1,0,2,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,1,1,0,1,1,0,0,0,0,1,1,0,1,1,0,2,
            0,0,1,2,0,2,1,0,0,0,0,2,1,0,2,1,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
            0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,2,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            2,0,1,0,1,0,1,0,0,2,0,0,1,2,1,2,1,2,
            2,0,1,0,1,0,1,0,0,2,0,0,2,1,0,1,0,2,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            1,0,1,1,0,1,1,0,0,0,0,1,1,0,1,1,0,2,
            0,0,1,2,0,2,1,0,0,0,0,2,1,0,2,1,0,1,
            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,
            0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,
            1,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,2,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
            2,0,1,0,1,0,1,0,2,2,0,1,1,2,1,2,1,2,
        ],*/
    });

    var drawgrid = new DrawableGrid({
        grid: grid,
        drawables:{
            1: blockSprite,
            2: blockSpriteYellow,
        },
    });

    var GridEnt = Ent.extend({
        name: 'TheGrid',
        drawable: drawgrid,
        grid: grid,
        bound: new Rect(0,0,grid.get('size').x, grid.get('size').y),
        collisionBehaviour: 'receive',
        editing:  false,
        editCell: 1,
        onUpdate: function(){
            var input = this.main.input;
            if(!this.scene.camera){
                return;
            }
            var mouse = this.transform.worldToLocal(this.scene.camera.getMouseWorldPos());
            var cell = this.grid.getCellAtPixel(mouse);
            if(cell && this.editing){
                if(input.isKeyDown('mouse0')){
                    this.grid.set('cell',[cell.x,cell.y],this.editCell);
                }else if(input.isKeyDown('mouse1')){
                    this.grid.set('cell',[cell.x,cell.y],0);
                }
            }
            if(input.isKeyDown('1')){
                this.editCell = 1;
            }else if(input.isKeyDown('2')){
                this.editCell = 2;
            }else if(input.isKeyDown('0')){
                this.editCell = 0;
            }else if(input.isKeyPressing('m')){
                this.editing = !this.editing;
            }
        },
    });

    var gridEnt = new GridEnt();

    var GridCollider = Ent.extend({
        onCollisionEmit: function(ent){
            if(ent instanceof GridEnt){
                var cells = ent.grid.getColldingCells(this.bound.cloneAt(this.get('pos')));
                for(var i = 0, len = cells.length; i < len; i++){
                    this.onGridCollision(cells[i]);
                }
            }
        },
        onGridCollision: function(cell){
            console.log("GridCollide:",cell);
        },
    });

    var Projectile = GridCollider.extend({
        name: 'projectile',
        damage: 100,
        owner: null,
        speed: 700,
        range: 2000,
        radius: 5,
        explRadius: 100,
        explDamage: 90,
        explKnockback: 500,
        expl: null,
        dir : new Vec2(1,0),
        init: function(opt){
            this._super(opt);
            this.owner = opt.owner || this.owner;
            this.dir = opt.dir || this.dir;
            this.speedVec = this.dir.scale(this.speed);
            if(opt.heritSpeed){
                this.speedVec = this.speedVec.add(opt.heritSpeed);
            }
            this.transform.setRotation(this.speedVec.angle());
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
        onGridCollision: function(cell){
            if(cell.cell){
                this.increase('pos',this.collisionAxis(cell.bound));
                this.explode();
                this.destroy();
            }
        },
    });
    
    var MissileExplosion = Ent.extend({
        name: 'missileExplosion',
        init: function(opt){
            this._super(opt);
            this.drawable = explosionSprite.clone();
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
    });

    var Missile = Projectile.extend({
        name: 'missile',
        drawable: missileSprite,
        Expl: MissileExplosion,
        onUpdate: function(){
            this._super();
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
            return true;
        },
    });

    var Bolt = Projectile.extend({
        name: 'bolt',
        drawable: boltSprite,
        speed:500,
        Expl: MissileExplosion,
        onUpdate: function(){
            this._super();
            this.increase('pos',this.speedVec.scale(this.scene.deltaTime));
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
                    heritSpeed: (heritSpeed || new Vec2()).scale(this.inheritance),
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

    var PlayerCamera = Camera.extend({
        name: 'playerCamera',
        init: function(player){
            this.player = player;
            this.set('pos',player.get('pos'));
        },
        onUpdate: function(){
            var input = this.main.input;
            if(input.isKeyDown('z')){
                this.increase('scale',new Vec2(1*this.main.deltaTime));
            }else if(input.isKeyDown('x')){
                this.increase('scale',new Vec2(-1*this.main.deltaTime));
            }
            if(input.isKeyDown('c')){
                this.increase('rotation',1*this.main.deltaTime);
            }else if(input.isKeyDown('v')){
                this.increase('rotation',-1*this.main.deltaTime);
            }
            var center = new Vec2( 
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
            if(!gridEnt.editing){
                if (this.player.moveSpeed.len() > 1){
                    this.set('scale',Math.min(2,cscale+0.15*this.main.deltaTime));
                }else{
                    this.set('scale',Math.max(1,cscale-0.15*this.main.deltaTime));
                }
            }
            return true;
        },
    });
    
    
    var PlayerShip = GridCollider.extend({
        name: 'player',
        init: function(opt){
            this._super(opt);
            
            this.moveSpeed   = new Vec2();
            this.moveDir     = new Vec2();
            this.aimdir       = new Vec2();
            this.startSpeed   = 160;
            this.maxSpeed    = 350;
            this.accel        = 500;
            this.deccel       = 1500;
            this.color        = '#F00';
            this.radius       = 20;

            this.knockSpeed    = new Vec2();
            this.knockFac      = 0;
            this.knockRecovery = 1;

            this.weapons  = {
                'missile': new MissileLauncher({ owner:this, main:this.main }),
                'bolter':  new Bolter({ owner:this, main:this.main }),
            };
            this.weaponIndexes = [
                'missile',
                'bolter',
            ];
            this.weapon = this.get('weapon',0);

            this.boost        = 1.5;

            this.incSpeed = function(cspeed,dt){
                var t = Math.log(1 - cspeed/this.maxSpeed)/-this.accel;
                return this.maxSpeed * ( 1 - Math.exp(-this.accel*(t+dt)));
            }
            
            this.shipSprite   = shipSprite.clone();
            this.shipSpriteFiring = shipSpriteFiring.clone();
            this.drawable     = this.shipSprite;  
            
            
            this.lastFireTime = 0;
            this.fireInterval = 0.1;
            this.fireSequence = 0;
            this.clipSize     = 5;
            this.reloadTime   = 2;
            this.collisionBehaviour = 'emit';
            this.bound = new Rect(0,0,this.radius*2, this.radius*2,'centered');
            this.colVec = new Vec2();


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
            console.log('damage',damage,knockback,dir.toString());
            this.knockSpeed = dir.scale(knockback);
            this.knockFac = 1;
        },

        onInstanciation: function(){
            this.scene.camera = new PlayerCamera(this);
        },
    
        onUpdate: function(){
            var input = this.main.input;
            var dt = this.scene.deltaTime;
            this.aimdir = this.scene.camera.getMouseWorldPos().sub(this.transform.pos).normalize();

            if(input.isKeyPressing('q')){
                this.set('weapon','missile');
            }else if(input.isKeyPressing('e')){
                this.set('weapon','bolter');
            }

            if(input.isKeyDown(' ')){
                this.boosting = true;
            }else{
                this.boosting = false;
            }
            
            if(input.isKeyDown('a')){
                this.moveDir.x = -1;
            }else if(input.isKeyDown('d')){
                this.moveDir.x = 1;
            }else{
                this.moveDir.x = 0;
            }
            if(input.isKeyDown('w')){
            
                this.moveDir.y = -1;
            }else if(input.isKeyDown('s')){
                
                this.moveDir.y = 1;
            }else{
                this.moveDir.y = 0;
            }

            if(this.moveDir.x === 0){
                if(this.moveSpeed.x > 0){
                    this.moveSpeed.x = Math.max(0,this.moveSpeed.x-this.deccel*dt);
                }else{
                    this.moveSpeed.x = Math.min(0,this.moveSpeed.x+this.deccel*dt);
                }
            }else{
                if(this.moveDir.x > 0){
                    if(this.moveSpeed.x < this.startSpeed){
                        this.moveSpeed.x = this.startSpeed;
                    }else{
                        this.moveSpeed.x = Math.min(this.maxSpeed,this.moveSpeed.x+this.accel*dt);
                    }
                }else{
                    if(this.moveSpeed.x > -this.startSpeed){
                        this.moveSpeed.x = -this.startSpeed;
                    }else{
                        this.moveSpeed.x = Math.max(-this.maxSpeed,this.moveSpeed.x-this.accel*dt);
                    }
                }
            }
            if(this.moveDir.y === 0){
                if(this.moveSpeed.y > 0){
                    this.moveSpeed.y = Math.max(0,this.moveSpeed.y-this.deccel*dt);
                }else{
                    this.moveSpeed.y = Math.min(0,this.moveSpeed.y+this.deccel*dt);
                }
            }else{
                if(this.moveDir.y > 0){
                    if(this.moveSpeed.y < this.startSpeed){
                        this.moveSpeed.y = this.startSpeed;
                    }else{
                        this.moveSpeed.y = Math.min(this.maxSpeed,this.moveSpeed.y+this.accel*dt);
                    }
                }else{
                    if(this.moveSpeed.y > -this.startSpeed){
                        this.moveSpeed.y = -this.startSpeed;
                    }else{
                        this.moveSpeed.y = Math.max(-this.maxSpeed,this.moveSpeed.y-this.accel*dt);
                    }
                }
            }
            
            if(!this.boosting && !gridEnt.editing &&input.isKeyDown('mouse0')){
                if(this.weapon.fire(this.get('pos'), this.aimdir, this.moveSpeed.scale(0.5))){
                    this.lastFireTime = this.scene.time;
                }
            }

            if( this.scene.time - this.lastFireTime < 0.05 ){
                this.drawable = this.shipSpriteFiring;
            }else{
                this.drawable = this.shipSprite;
            }
            if(this.knockFac > 0){
                this.moveSpeed = this.moveSpeed.lerp(this.knockSpeed,this.knockFac);
                this.knockFac *= (1 - this.knockRecovery*this.scene.deltaTime);
                if(this.knockFac < 0.01){
                    this.knockFac = 0;
                }
            }
            
            if(this.boosting){
                this.increase('pos',this.moveSpeed.scale(this.boost * this.scene.deltaTime));
            }else{
                this.increase('pos',this.moveSpeed.scale(this.scene.deltaTime));
            }
            
            var prevRotation = this.get('rotation'); 
            this.set('rotationDeg',(this.aimdir.angleDeg() + 90));
            var deltaRot = Math.abs(prevRotation - this.get('rotation'));
            
            if(this.moveSpeed.len() >= 1 || deltaRot > 0.001){
                return true;
            }
        },

        onGridCollision: function(cell){
            var bound = cell.bound;
            if(cell.cell){
                this.colVec = this.collisionAxis(bound);
                this.increase('pos',this.colVec);
                if(this.colVec.x){
                    this.moveSpeed.x = 0;
                }else{
                    this.moveSpeed.y = 0;
                }
                if(this.colVec.len() > 1){
                    return true;
                }
            }
        },
                
    });
    
    var ShivrzScene = Scene.extend({
        onSceneStart: function(){
            this.lastTime = -1;
            this.add(new PlayerShip({
                pos: new Vec2(
                    window.innerWidth/2,
                    window.innerHeight/2
                ),
            }));
            this.add(gridEnt);
        },
        onFrameEnd: function(){
        },
    });

    window.main   = new Main({
        input: new Input('body'),
        scene: new ShivrzScene({
            renderer: new RendererCanvas2d({
                canvas:window.canvas,
                getSize: function(){
                    return new Vec2(window.innerWidth,window.innerHeight);
                },
                background: '#333',
                alwaysRedraw: false,
            }),
        }),
    });

    window.main.set('fps',60);
    window.main.run();
};
