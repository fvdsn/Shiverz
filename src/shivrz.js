window.onload = function() {

    window.canvas = document.getElementById('test_canvas_1');
    window.context = canvas.getContext('2d');
    
    modula.use();   

    var shipSprite = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow.png',
        centered:true,
    });

    var shipHover = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128blue.png',
        globalCompositeOperation: 'lighter',
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
        globalCompositeOperation: 'lighter',
        pos: new Vec2(-20,0),
        centered:true,
    });
    var boltSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-red.png',
        globalCompositeOperation: 'lighter',
        pos: new Vec2(-20,0),
        centered:true,
    });
    
    var explosionSprite = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128blue.png',
        globalCompositeOperation: 'lighter',
        centered:true,
    });
    
    var blockSpriteUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-under.png',
        pos:new Vec2(-12,-16),
    });

    var blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new Vec2(-12,-16),
    });

    var blockSpritePurpleUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple-under.png',
        pos:new Vec2(-12,-16),
    });

    var blockSpritePurple = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple.png',
        pos:new Vec2(-12,-16),
    });

    var blockSpriteGray = new RendererCanvas2d.DrawableSprite({
        src:'img/block-gray.png',
        pos:new Vec2(-12,16),
    });

    var blockSpriteDark = new RendererCanvas2d.DrawableSprite({
        src:'img/block-dark-gray.png',
        pos:new Vec2(-12,16),
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
        pass:'blocks',
        grid: grid,
        drawables:{
            1: blockSprite,
            2: blockSpritePurple,
        },
    });

    var bgdrawgrid = new DrawableGrid({
        pass:'bgblocks',
        grid: grid,
        drawables:{
            '-1': blockSpriteGray,
            '-2': blockSpriteDark,
            1: blockSpriteUnder,
            2: blockSpritePurpleUnder,
        },
    });

    var GridEnt = Ent.extend({
        name: 'TheGrid',
        drawable: [
            bgdrawgrid,
            drawgrid,
        ],
            
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
            }else if(input.isKeyDown('3')){
                this.editCell = -1;
            }else if(input.isKeyDown('4')){
                this.editCell = -2;
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
                var vec = this.collideGrid(ent.grid);
                if(vec){
                    this.onGridCollision(ent.grid,vec);
                }
            }
        },
        collideGrid: function(grid){
           //o var pos  = this.transform.getPos().sub(grid.transform.getPos());
            var pos  = this.transform.getPos();
            var minX  = this.bound.minX() + pos.x;
            var minY  = this.bound.minY() + pos.y;
            var maxX  = this.bound.maxX() + pos.x;
            var maxY  = this.bound.maxY() + pos.y;
     
            var cx    = grid._cellX;
            var cy    = grid._cellY;
            var csx   = grid._cellSize.x;
            var csy   = grid._cellSize.y;


            if(maxX <= 0 || maxY <= 0 || minX >= cx*csx || minY >= cy*csy){
                return;
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
                if(this._is_solid(grid,min_px,min_py)){
                    var dx = esc_l < -esc_r ? esc_l : esc_r;
                    var dy = esc_u < -esc_d ? esc_u : esc_d;
                    if(Math.abs(dx) < Math.abs(dy)){
                        return new Vec2(dx,0);
                    }else{
                        return new Vec2(0,dy);
                    }
                }else{
                    return undefined;
                }
            }else if(min_px === max_px){
                // in the middle of one vertical two-block rectangle
                var solid_u = this._is_solid(grid,min_px,min_py);
                var solid_d = this._is_solid(grid,min_px,max_py);
                if(solid_u && solid_d){
                    return null; // error
                }else if(solid_u){
                    return new Vec2(0,esc_u);
                }else if(solid_d){
                    return new Vec2(0,esc_d);
                }else{
                    return undefined;
                }
            }else if(min_py === max_py){
                // in the middle of one horizontal two-block rectangle
                var solid_l = this._is_solid(grid,min_px,min_py);
                var solid_r = this._is_solid(grid,max_px,min_py);
                if(solid_l && solid_r){
                    return null; // error
                }else if(solid_l){
                    return new Vec2(esc_l,0);
                }else if(solid_r){
                    return new Vec2(esc_r,0);
                }else{
                    return undefined;
                }
            }else{
                // touching four blocks
                var solid_ul = this._is_solid(grid,min_px,min_py);
                var solid_ur = this._is_solid(grid,max_px,min_py);
                var solid_dl = this._is_solid(grid,min_px,max_py);
                var solid_dr = this._is_solid(grid,max_px,max_py);
                var count = 0 + solid_ul + solid_ur + solid_dl + solid_dr;
                if(count === 0){
                    return undefined;
                }else if(count === 4){
                    return null; // error
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
                        if(solid_dr && solid_ul){
                            return null; //WIP
                        }else if(solid_dl && solid_ur){
                            return null; //WIP
                        }
                    }
                    return new Vec2(dx,dy);
                }else{
                    if(solid_dl){
                        return -esc_d < esc_l ? new Vec2(0,esc_d) : new Vec2(esc_l,0);
                    }else if(solid_dr){
                        return -esc_d < -esc_r ? new Vec2(0,esc_d) : new Vec2(esc_r,0);
                    }else if(solid_ur){
                        return esc_u < -esc_r ? new Vec2(0,esc_u) : new Vec2(esc_r, 0);
                    }else{
                        return esc_u < esc_l ? new Vec2(0,esc_u) : new Vec2(esc_l,0);
                    }
                }
            }
        },
        _is_solid: function(grid,x,y){
            var cell = grid.getCell(x,y);
            return cell && this.isSolid(cell,x,y);
        },
        isSolid: function(cell,x,y){
            return cell > 0;
        },
        onGridCollision: function(cells){
            console.log("GridCollide:",cells);
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
        explKnockback: 1000,
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
        onGridCollision: function(grid,vec){
            this.increase('pos',vec);
            this.explode();
            this.destroy();
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

    var PlayerCamera = Camera2d.extend({
        name: 'playerCamera',
        parallax: true,
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
            
            this.moveSpeed    = new Vec2();
            this.moveDir      = new Vec2();
            this.aimdir       = new Vec2();
            this.startSpeed   = 160;
            this.maxSpeed     = 350;
            this.accel        = 500;
            this.deccel       = 1500;
            this.color        = '#F00';
            this.radius       = 45;

            this.knockSpeed    = new Vec2();
            this.knockTime     = 0;
            this.knockDuration = 0.005;
            this.knockBounce   = 0.9;

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
            this.shipHover    = shipHover.clone();
            this.shipHover2    = shipHover.clone();
            this.drawable     = [
                this.shipHover,
                this.shipHover2,
                this.shipSprite,
            ];
            console.log('drawable:',this.drawable);
            
            
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
            var knockTime = Math.max(0.5,Math.min(1.5,knockback * this.knockDuration));
            var knockSpeed = dir.scale(knockback);
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
            $('.fps').html(''+Math.round(1/this.main.deltaTime)+ ' fps');

            if(input.isKeyPressing('q')){
                this.set('weapon','missile');
            }else if(input.isKeyPressing('e')){
                this.set('weapon','bolter');
            }

            if(input.isKeyDown('p')){
                this.main.exit();
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
            
            if(!this.boosting && !knocked && !gridEnt.editing &&input.isKeyDown('mouse0')){
                if(this.weapon.fire(this.get('pos'), this.aimdir, this.moveSpeed.scale(0.5))){
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
                this.increase('rotationDeg',90*this.scene.deltaTime);
            }else{
                this.set('rotationDeg',(this.aimdir.angleDeg() + 90));
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
                    this.knockSpeed.x = - this.knockSpeed.x * this.knockBounce;
                    this.moveSpeed.x = this.knockSpeed.x ;
                }else{
                    this.moveSpeed.x = 0;
                }
            }else{
                if(knocked){
                    this.knockSpeed.y = - this.knockSpeed.y * this.knockBounce;
                    this.moveSpeed.y = this.knockSpeed.y ;
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
                passes:[
                    'bgblocks',
                    'ships',
                    'projectiles',
                    'explosions',
                    'blocks',
                ],
                canvas:window.canvas,
                getSize: function(){
                    return new Vec2(window.innerWidth,window.innerHeight);
                },
                background: '#222',
                alwaysRedraw: false,
            }),
        }),
    });

    window.main.set('fps',60);
    window.main.run();
};
