
window.modula = window.modula || {};

(function(modula){
    
    // A Javascript 2D vector library
    // conventions :
    // method that returns a float value do not modify the vector
    // method that implement operators return a new vector with the modifications without
    // modifying the calling vector or the parameters.
    // 
    //      v3 = v1.add(v2); // v3 is set to v1 + v2, v1, v2 are not modified
    //
    // methods that take a single vector as a parameter are usually also available with
    // q 'XY' suffix. Those method takes two floats representing the x,y coordinates of
    // the vector parameter and allow you to avoid to needlessly create a vector object : 
    //
    //      v2 = v1.add(new Vec2(3,4));
    //      v2 = v1.addXY(3,4);             //equivalent to previous line
    //
    // angles are in radians by default but method that takes angle as parameters 
    // or return angle values usually have a variant with a 'Deg' suffix that works in degrees
    //
     
    // The 2D vector object 
    function Vec2(){
        if (arguments.length === 0) {
           this.x = 0;
           this.y = 0;
        }else if (arguments.length === 1){
           this.x = arguments[0].x;
           this.y = arguments[0].y;
        }else if (arguments.length === 2){
           this.x = arguments[0];
           this.y = arguments[1];
        }
    }

    modula.Vec2 = Vec2;

    var proto = Vec2.prototype;

    proto.type      = 'vec';
    proto.dimension = 2;
    proto.fullType  = 'vec2'

    
    // Multiply a number expressed in radiant by radToDeg to convert it in degrees
    var radToDeg = 57.29577951308232;
    // Multiply a number expressed in degrees by degToRad to convert it to radiant
    var degToRad = 0.017453292519943295;
    // The numerical precision used to compare vector equality
    var epsilon   = 0.0000001;

    // sets vd to a vector of length 'len' and angle 'angle' radians
    Vec2.polar = function(vd,len,angle){
        vd.x = len;
        vd.y = 0;
        Vec2.rotate(vd,vd,angle);
    };
    // sets vd to a vector of length 'len' and angle 'angle' degrees
    Vec2.polarDeg = function(vd,len,angle){
        vd.x = len;
        vd.y = 0;
        Vec2.rotateDeg(vd,vd,angle);
    };
    // This static method creates a new vector from polar coordinates with the angle expressed
    // in degrees
    Vec2.newPolarDeg = function(len,angle){
        var vd = new Vec2();
        Vec2.polarDeg(vd,len,angle);
        return vd
    };
    
    // This static method creates a new vector from polar coordinates with the angle expressed in
    // radians
    Vec2.newPolar = function(len,angle){
        var v = new Vec2(len,0);
        v.rotate(angle);
        return v;
    };
    
    // sets vd.x and vd.y to random values in [0,1]
    Vec2.randomPositive = function(vd){
        vd.x = Math.random();
        vd.y = Math.random();
    };

    // Returns a vector with randomized x and y in [0,1]
    Vec2.newRandomPositive = function(){ 
        return new Vec2(Math.random(),Math.random());
    };
    
    // sets vd.x and vd.y to random values in [-1,1]
    Vec2.random = function(vd){
        vd.x = Math.random()*2 - 1;
        vd.y = Math.random()*2 - 1;
    };

    // Returns a vector with randomized x and y in [-1,1]
    Vec2.newRandom = function(){
        return new Vec2(Math.random()*2 - 1, Math.random()*2 - 1); 
    };
    
    //sets vd to a random vector of length <= 1
    Vec2.randomDisc = function(vd){
        do{
            vd.x = Math.random() * 2 - 1;
            vd.y = Math.random() * 2 - 1;
        }while(vd.lenSq() > 1);
    };
    // Returns  a random position in the unit disc. (vec.len() <= 1) 
    Vec2.newRandomDisc = function(){
        var vd = new Vec2();
        Vec2.randomDisc(vd);
        return vd;
    };

    proto.isZero = function(){
        return this.x === 0 && this.y === 0;
    };
    Vec2.setZero = function(vd){
        vd.x = 0;
        vd.y = 0;
    };
    // returns the length or modulus or magnitude of the vector
    proto.len = function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    
    // returns the squared length of the vector, this method is much faster than len()
    proto.lenSq = function(){
        return this.x*this.x + this.y*this.y;
    };
    
    // returns the distance between v1 and v2
    Vec2.dist = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    // returns the distance between v and [x,y]
    Vec2.distXY = function(v, x, y){
        var dx = v.x - x;
        var dy = v.y - y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    // return the distance between this vector and the vector v
    proto.dist = function(v){
        return Vec2.dist(this,v);
    };
    
    // return the distance between this vector and the vector of coordinates (x,y)
    proto.distXY = function(x,y){
        return Vec2.distXY(this,x,y);
    };

    //returns the squared distance between v1 and v2
    Vec2.distSq = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return dx*dx + dy*dy;
    };

    //returns the squared distance between v and [x,y]
    Vec2.distSqXY = function(v, x, y){
        var dx = v.x - x;
        var dy = v.y - y;
        return dx*dx + dy*dy;
    };

    
    // return the squared distance between this vector and the vector and the vector v
    proto.distSq = function(v){
        return Vec2.distSq(this,v);
    };
    
    // return the squared distance between this vector and the vector of coordinates (x,y)
    proto.distSqXY = function(x,y){
        return Vec2.distSqXY(this,x,y);
    };
    
    //returns the dot product of v1 and v2
    Vec2.dot = function(v1,v2){
        return v1.x*v2.x + v2.y*v2.y;
    }
    Vec2.dotXY = function(v,x,y){
        return v.x*x + v.y*y;
    }
    // return the dot product between this vector and the vector v
    proto.dot = function(v){
        return this.x*v.x + this.y*v.y;
    };
    
    // return the dot product between this vector and the vector of coordinate (x,y)
    proto.dotXY = function(x,y){
        return this.x*x + this.y*y;
    };
    
    //copies v into vd
    Vec2.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
    };

    // return a new vector with the same coordinates as this 
    proto.clone = function(){
        return new Vec2(this.x,this.y);
    };
    
    // sets vd to v1 + v2
    Vec2.add = function(vd,v1,v2){
        vd.x = v1.x + v2.x;
        vd.y = v1.x + v2.y;
    };

    // sets vd to v1 + [x,y]
    Vec2.addXY = function(vd,v, x, y){
        vd.x  = v.x + x;
        vd.y  = v.y + y;
    };
    
    // return the sum of this and vector v as a new vector
    proto.add = function(v){
        return new Vec2(this.x+v.x,this.y+v.y);
    };
    
    // return the sum of this and vector (x,y) as a new vector
    proto.addXY = function(x,y){
        return new Vec2(this.x+x,this.y+y);
    };

    Vec2.addScaled = function(vd,v1,v2,scale){
        vd.x = v1.x + (v2.x * scale);
        vd.y = v1.y + (v2.y * scale);
    };
    
    //sets vd to v1 - v2
    Vec2.sub= function(vd,v1,v2){
        vd.x = v1.x - v2.x;
        vd.y = v1.x - v2.y;
    };

    //sets vd to v1 - [x,y]
    Vec2.subXY = function(vd,v, x, y){
        vd.x  = v.x - x;
        vd.y  = v.y - y;
    };
    
    // returns (this - v) as a new vector where v is a vector and - is the vector subtraction
    proto.sub = function(v){
        return new Vec2(this.x-v.x,this.y-v.y);
    };

    
    // returns (this - (x,y)) as a new vector where - is vector subtraction
    proto.subXY = function(x,y){
        return new Vec2(this.x-x,this.y-y);
    };
    
    // sets vd to the by component product of v1 and v2
    Vec2.mult= function(vd,v1,v2){
        vd.x = v1.x * v2.x;
        vd.y = v1.x * v2.y;
    };

    // sets vd to the by component product of v and [x,y]
    Vec2.multXY = function(vd,v, x, y){
        vd.x  = v.x * x;
        vd.y  = v.y * y;
    };
    
    // return (this * v) as a new vector where v is a vector and * is the by component product
    proto.mult = function(v){
        return new Vec2(this.x*v.x,this.y*v.y);
    };
    
    // return (this * (x,y)) as a new vector where * is the by component product
    proto.multXY = function(x,y){
        return new Vec2(this.x*x,this.y*y);
    };

    // sets vd to v scaled by float factor f
    Vec2.scale = function(vd,v,f){
        vd.x = v.x * f;
        vd.y = v.y * f;
    };
    
    // return this scaled by float f as a new fector
    proto.scale = function(f){
        return new Vec2(this.x*f, this.y*f);
    };
    
    //sets vd to -v
    Vec2.neg = function(vd,v){
        vd.x = -v.x;
        vd.y = -v.y;
    };

    // return the negation of this vector
    proto.neg = function(f){
        return new Vec2(-this.x,-this.y);
    };
   
    //sets vd to the normalized v, or [1,0] if v is zero
    Vec2.normalize = function(vd,v){
        var len = v.lenSq();
        if(len !== 0){
            if(len === 1){
                vd.x = v.x;
                vd.y = v.y;
            }else{
                len = 1 / Math.sqrt(len);
                vd.x = v.x * len;
                vd.y = v.y * len;
            }
        }else{
            v.x = 1;
            v.y = 1;
        }
    };
            
    // return this vector normalized as a new vector
    proto.normalize = function(){
        var vd = new Vec2(0,1);
        Vec2.normalize(vd,this);
        return vd;
    };
    
    // sets vd to have the same direction as v and length l, or [l,0] if v is
    // zero
    Vec2.setLen = function(vd,v,l){
        Vec2.normalize(vd,v);
        Vec2.scale(vd,vd,l);
    };

    // return a new vector with the same direction as this vector of length float l. (negative values of l will invert direction)
    proto.setLen = function(l){
        var vd = new Vec2();
        Vec2.setLen(vd,this,l);
        return vd;
    };

    //sets vd to the projection of v1 onto v2
    Vec2.project = function(vd,v1,v2){
        var dot = Vec2.dot(v1,v2);
        Vec2.setLen(vd,v2,dot);
    };
    
    // return the projection of this onto the vector v as a new vector
    proto.project = function(v){
        var vd = new Vec2();
        Vec2.project(vd.this,v);
        return vd;
    };
    
    // return a string representation of this vector
    proto.toString = function(){
        var str = "";
        str += "[";
        str += this.x;
        str += ",";
        str += this.y;
        str += "]";
        return str;
    };
    
    //sets vd to the rotated v by an angle 'rad' radians
    Vec2.rotate = function(vd,v,rad){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var vx = v.x * c - v.y *s;
        var vy = v.x * s + v.y *c;
        vd.x = vx;
        vd.y = vy;
    };

    //sets vd to the rotated v by an angle 'deg' degrees
    Vec2.rotateDeg = function(vd,v,deg){
        Vec2.rotate(vd,v,deg * degToRad);
    };
        
    //return this vector counterclockwise rotated by rad radians as a new vector
    proto.rotate = function(rad){
        var vd = new Vec2();
        Vec2.rotate(vd,this,rad);
        return vd;
    };
    
    //return this vector counterclockwise rotated by deg degrees as a new vector
    proto.rotateDeg = function(deg){
        return this.rotate(deg * degToRad);
    };
    
    //sets vd to the interpolation of v1 towards v2 by float factor alpha
    Vec2.lerp = function(vd,v1,v2,alpha){
        var invAlpha = 1- alpha;
        vd.x = v1.x * invAlpha + v2.x * alpha;
        vd.y = v1.y * invAlpha + v2.y * alpha;
    };

    //linearly interpolate this vector towards the vector v by float factor alpha.
    // alpha === 0 : does nothing
    // alpha === 1 : sets this to v
    proto.lerp = function(v,alpha){
        var vd = new Vec2();
        Vec2.lerp(vd,this,v,alpha);
        return vd;
    };
    
    // returns the angle between this vector and the vector (1,0) in radians
    proto.angle = function(){
        return Math.atan2(this.y,this.x);
    };
    
    // returns the angle between this vector and the vector (1,0) in degrees
    proto.angleDeg = function(){
        return Math.atan2(this.y,this.x) * radToDeg;
    };
    
    // returns true if this vector is equal to the vector v, with a tolerance defined by the epsilon module constant
    proto.equals = function(v){
        if(Math.abs(this.x-v.x) > epsilon){
            return false;
        }else if(Math.abs(this.y-v.y) > epsilon){
            return false;
        }
        return true;
    };
    
    // returns true if this vector is equal to the vector (x,y) with a tolerance defined by the epsilon module constant
    proto.equalsXY = function(x,y){
        if(Math.abs(this.x-x) > epsilon){
            return false;
        }else if(Math.abs(this.y-y) > epsilon){
            return false;
        }
        return true;
    };
    
    //sets vd to the integer rounded coordinate of v
    Vec2.round  = function(vd,v){
        vd.x = Math.round(v.x);
        vd.y = Math.round(v.y);
    };
    //return an integer coordinates rounded version of this as a new vector
    proto.round = function(){
        var vd = new Vec2();
        Vec2.round(vd,this);
        return vd;
    };

    //returns the area of the parallelogram between this and v
    proto.crossArea = function(v){
        return this.x * v.y - this.y * v.x;
    };

    //sets vd to the reflection of v on the normal vn
    Vec2.reflect = function(vd,v,vn){
        var dot2 = Vec2.dot(v,vn) * 2;
        vd.x = v1.x - vn.x * dot2;
        vd.y = v1.y - vn.y * dot2;
    };

    //returns the reflection of this vector on the normal vn
    proto.reflect = function(vn){
        var vd = new Vec2();
        Vec2.reflect(vd,this,vn);
        return vd;
    };

})(window.modula);
