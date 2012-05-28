window.modula = window.modula || {};
// This animation module provides jquery style animation for all modula objects implementing this mixin.
// by jquery style animation i mean fire and forget animation, with an easing function and a duration

(function(modula){

    // a linear easing function...
    var easing_linear = function(delta){
        return delta;
    };
    
    //simulates acceleration
    var easing_accel = function(delta){
        return delta * delta;
    };

    //simulates deceleration
    var easing_decel = function(delta){
        delta -=1;
        return 1-(delta*delta);  
    };
    
    //smooth acceleration and deceleration
    var easing_smooth = function(delta){
        return -0.5*Math.cos(delta*Math.PI) + 0.5;
    };
    
    // An animation contains the definition of an animation of a single attribute for an object.
    // it contains the easing function, the target value, the duration, and a callback to call when
    // the animation is over.
    modula.Animation = modula.Class.extend({
        init: function(options){
            this.startTime = this.startTime || options.startTime || undefined;
            this.duration  = this.duration  || options.duration  || 1;
            if(options.easing){
                if( typeof options.easing === 'function'){
                    this.easing = options.easing;
                }else if( options.easing === 'linear'){
                    this.easing = easing_linear;
                }else if( options.easing === 'accelerating'){
                    this.easing = easing_accel;
                }else if( options.easing === 'decelerating'){
                    this.easing = easing_decel;
                }else if( options.easing === 'smooth'){
                    this.easing = easing_smooth;
                }else{
                    this.easing = easing_linear;
                }
            }else{
                this.easing = easing_linear;
            }
            this.attr = options.attr;
            this.end_val = options.value; 
            this.start_val = undefined;

            this.finished = false;
            this.callback = this.callback || options.callback || undefined;
        },
        //called to finish an animation
        finish: function(){
            if(!this.finished){
                this.finished = true;
                if(this.callback){
                    return this.callback();
                }
            }
            return false;
        },
        // applies the effect of this animation to object obj at the time 'time'
        // note that the startTime attribute must be well defined before calling this
        doAnimation: function(obj, time){
            if(this.finished){
                return false;
            }else if(time < this.startTime){
                return false;
            }else if(time > this.startTime + this.duration){
                return this.finish(); //TODO set the last value to target value...
            }

            if(this.start_val === undefined){
                var val = obj.get(attr);
                if(val === null || val === undefined){
                    return false;
                }
                if(val.clone){
                    this.start_val = val.clone();
                }else{
                    this.start_val = val;
                }
            }

            var fac = this.easing((time - this.startTime) / this.duration);

            if( (typeof this.end_val) === 'number'){
                obj.set(attr, this.end_val * fac + this.start_val * (1-fac));
            }else if(this.start_val.lerp){
                obj.set(attr,this.start_val.lerp(this.end_val,fac));
            }

            return true;
        },
    });

    // This is the mixin to add to the objects that you want to be animatable
    modula.AnimationsMixin = modula.Mixin.extend({
        animations: {}, // contains pairs 'attributes' => the Animation animating the attribute
        // you can provide a list of animation objects in the options
        initAnimations : function(options){
            if(options.animations){
                for(var i = 0; i < options.animations.length; i++){
                    this.addAnimation(options.animations[i]);
                }
            }
        },
        // Compute the effect of the animation on the entity
        doAnimations: function(time){
            var redraw = false;
            for(attr in this.animations){
                var animation = this.animations[attr];
                if(animation.startTime === undefined){
                    animation.startTime = time;
                }
                var updated = animation.doAnimation(this,time);
                redraw = redraw || updated;
            }
            return redraw;
        },
        // adds a new animation to the object. If there is already an animation with the same attribute
        // that has not finished, it is immediately finished, and the callback called before the new one
        // is added.
        addAnimation: function(animation){
            var attr = animation.attr;
            if(this.animations[attr]){
                this.animations[attr].finish();
            }
            this.animations[attr] = animation;
        },
        // same as addAnimation, but creates the animation object for you :
        // attr : the attribute to be animated. Must be public, and must be a number or implement clone() and lerp()
        // value : the target value for the animation, must be of the same type as the attr
        // duration: the duration of the animation in seconds.
        // easing (optional) : either a function returning [0,1] in the domain [0,1] or one of the following strings :
        // 'linear' (default)
        // 'accelerating', 'decelerating', 'smooth'
        // callback (optional) : the callback is called after the animation is over
        anim: function(attr, value, duration, easing, callback){
            this.addAnimation(new Animation({
                attr: attr,
                value: value,
                duration: duration,
                easing: easing,
                callback: callback,
            }));
        },
    });

    modula.AnimationsPass = modula.ScenePass.extend({
        process: function(scene,updated){
            var redraw = false;
            var entList = scene.get('entities');
            var time = scene.main.time;

            for(var i = 0, len = entList.length; i < len; i++){
                var ent = entList[i];
                if(ent.doAnimations){
                   var updated = ent.doAnimations(time);
                   redraw = redraw || updated;
                }
            }
            return redraw;
        },
    });

})(modula);
