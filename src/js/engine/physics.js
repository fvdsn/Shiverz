window.modula = window.modula || {};

(function(modula){
    var Vec2 = modula.Vec2;

    modula.PhysicsMixin = modula.Mixin.extend({
        physicsActive : true,
        speed : undefined,
        maxSpeed : -1,
        acceleration: undefined,
        gravity : undefined,
        gravityFactor: 1,
        drag: 0,
        friction: 0,
        mass: 1,
        force: undefined,
        initPhysics: function(options){
            if(!options){
                return;
            }
            this.physicsActive = options.physicsActive || this.physicsActive;
            this.speed = (options.speed || this.speed).clone();
            this.maxSpeed = options.maxSpeed || this.maxSpeed;
            this.acceleration = (options.acceleration || this.acceleration).clone();
            this.gravity = (options.gravity || this.gravity).clone();
            this.gravityFactor = options.gravityFactor || this.gravityFactor;
            this.drag = options.drag || this.drag;
            this.friction = options.friction || this.friction;
            this.mass = options.mass || this.mass;
            this.force = (options.force || this.force).clone();
        },
        doPhysics : function(deltaTime){
            if(!deltaTime){
                deltaTime = this.main.deltaTime;
            }
            var tmp = new Vec2();
            if(this.speed){
                if(this.acceleration && !this.acceleration.isZero()){
                    Vec2.addScaled(this.speed,this.speed,this.acceleration,deltaTime);
                }
                if(this.gravityFactor && this.gravity && !this.gravity.isZero()){
                    Vec2.addScaled(this.speed,this.speed,this.gravity, this.gravityFactor * deltaTime);
                }
                var invMass = this.mass;
                if(invMass){
                    invMass = 1/this.mass;
                }
                if(this.drag && this.mass && !this.speed.isZero()){
                    var dragForce = tmp;
                    Vec2.setZero(dragForce);
                    Vec2.mult(dragForce,this.speed,this.speed);
                    Vec2.scale(dragForce,dragForce,0.5*this.drag*this.drag*invMass);
                    Vec2.addScaled(this.speed,this.speed,dragForce,deltaTime);
                }
                if(this.friction && this.mass && !this.speed.isZero()){
                    var dir = tmp;
                    Vec2.normalize(dir,this.speed);
                    Vec2.addScaled(this.speed,this.speed,dir,-this.friction*invMass*deltaTime);
                }
                if(this.force && this.mass && !this.force.isZero()){
                    Vec2.addScaled(this.speed,this.speed,this.force,deltaTime*invMass);
                }
                if(this.transform && !this.speed.isZero()){
                    Vec2.copy(tmp,this.speed);
                    if(this.maxSpeed >= 0 ){
                        if(tmp.lenSq() > this.maxSpeed* this.maxSpeed){
                            Vec2.setLen(tmp,tmp,this.maxSpeed);
                        }
                    }
                    Vec2.scale(tmp,this.speed,deltaTime);
                    //console.log(this.speed.toString(), tmp.toString(), deltaTime);
                    this.transform.translate(tmp);
                    return true;
                }
                return false;
            }
        },
    });

    modula.Physics2DMixin = modula.PhysicsMixin.extend({
        speed : new Vec2(),
        acceleration: new Vec2(),
        gravity : new Vec2(),
        force: new Vec2(),
    });

    modula.PhysicsPass = modula.ScenePass.extend({
        process: function(scene,updated){
            var draw = false;
            var entList = scene.getAllEnt();
            var deltaTime = scene.main.deltaTime;
            //console.log(deltaTime);
            for(var i = 0, len = entList.length; i < len; i++){
                var ent = entList[i];
                if(ent.doPhysics){
                    var updated = ent.doPhysics(deltaTime);
                    draw = draw || updated;
                }
            }
            return draw;
        }
    });

})(modula);
