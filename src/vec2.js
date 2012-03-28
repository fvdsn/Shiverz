
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
    // q '_xy' suffix. Those method takes two floats representing the x,y coordinates of
    // the vector parameter and allow you to avoid to needlessly create a vector object : 
    //
    //      v2 = v1.add(new Vec2(3,4));
    //      v2 = v1.add_xy(3,4);             //equivalent to previous line
    //
    // angles are in radians by default but method that takes angle as parameters 
    // or return angle values usually have a variant with a '_deg' suffix that works in degrees
    //
     
    // The 2D vector object 
    function Vec2(){
        if (arguments.length == 0) {
           this.x = 0;
           this.y = 0;
        }else if (arguments.length == 1){
           this.x = arguments[0].x;
           this.y = arguments[0].y;
        }else if (arguments.length == 2){
           this.x = arguments[0];
           this.y = arguments[1];
        }
    }
    modula.Vec2 = Vec2;
    
    // Multiply a number expressed in radiant by rad2deg to convert it in degrees
    var rad2deg = 57.29577951308232;
    // Multiply a number expressed in degrees by deg2rad to convert it to radiant
    var deg2rad = 0.017453292519943295;
    // The numerical precision used to compare vector equality
    var epsilon   = 0.0000001;

    // This static method creates a new vector from polar coordinates with the angle expressed
    // in degrees
    Vec2.new_polar_deg = function(len,angle){
        var v = new Vec2(len,0);
        return v.rotate_deg(angle);
    };
    // This static method creates a new vector from polar coordinates with the angle expressed in
    // radians
    Vec2.new_polar = function(len,angle){
        var v = new Vec2(len,0);
        v.rotate(angle);
        return v;
    };
    // returns the length or modulus or magnitude of the vector
    Vec2.prototype.len = function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    // returns the squared length of the vector, this method is much faster than len()
    Vec2.prototype.len_sq = function(){
        return this.x*this.x + this.y*this.y;
    };
    // return the distance between this vector and the vector v
    Vec2.prototype.dist = function(v){
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        return Math.sqrt(dx*dx + dy*dy);
    };
    // return the distance between this vector and the vector of coordinates (x,y)
    Vec2.prototype.dist_xy = function(x,y){
        var dx = this.x - x;
        var dy = this.y - y;
        return Math.sqrt(dx*dx + dy*dy);
    };
    // return the squared distance between this vector and the vector and the vector v
    Vec2.prototype.dist_sq = function(v){
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        return dx*dx + dy*dy;
    };
    // return the squared distance between this vector and the vector of coordinates (x,y)
    Vec2.prototype.dist_sq_xy = function(x,y){
        var dx = this.x - x;
        var dy = this.y - y;
        return dx*dx + dy*dy;
    };
    // return the dot product between this vector and the vector v
    Vec2.prototype.dot = function(v){
        return this.x*v.x + this.y*v.y;
    };
    // return the dot product between this vector and the vector of coordinate (x,y)
    Vec2.prototype.dot_xy = function(x,y){
        return this.x*x + this.y*y;
    };
    // return a new vector with the same coordinates as this 
    Vec2.prototype.clone = function(){
        return new Vec2(this.x,this.y);
    };
    // return the sum of this and vector v as a new vector
    Vec2.prototype.add = function(v){
        return new Vec2(this.x+v.x,this.y+v.y);
    };
    // return the sum of this and vector (x,y) as a new vector
    Vec2.prototype.add_xy = function(x,y){
        return new Vec2(this.x+x,this.y+y);
    };
    // returns (this - v) as a new vector where v is a vector and - is the vector subtraction
    Vec2.prototype.sub = function(v){
        return new Vec2(this.x-v.x,this.y-v.y);
    };
    // returns (this - (x,y)) as a new vector where - is vector subtraction
    Vec2.prototype.sub_xy = function(x,y){
        return new Vec2(this.x-x,this.y-y);
    };
    // return (this * v) as a new vector where v is a vector and * is the by component product
    Vec2.prototype.mult = function(v){
        return new Vec2(this.x*v.x,this.y*v.y);
    };
    // return (this * (x,y)) as a new vector where * is the by component product
    Vec2.prototype.mult_xy = function(x,y){
        return new Vec2(this.x*x,this.y*y);
    };
    // return this scaled by float f as a new fector
    Vec2.prototype.scale = function(f){
        return new Vec2(this.x*f, this.y*f);
    };
    // return the negation of this vector
    Vec2.prototype.neg = function(f){
        return new Vec2(-this.x,-this.y);
    };
    // return this vector normalized as a new vector
    Vec2.prototype.normalize = function(){
        var len = this.len();
        if(len == 0){
            return new Vec2(0,1);
        }else if(len != 1){
            return this.scale(1.0/len);
        }
        return new Vec2(this.x,this.y);
    };
    // return a new vector with the same direction as this vector of length float l. (negative values of l will invert direction)
    Vec2.prototype.set_len = function(l){
        return this.normalize().scale(l);
    };
    // return the projection of this onto the vector v as a new vector
    Vec2.prototype.project = function(v){
        return v.set_len(this.dot(v));
    };
    // return a string representation of this vector
    Vec2.prototype.toString = function(){
        var str = "";
        str += "[";
        str += this.x;
        str += ",";
        str += this.y;
        str += "]";
        return str;
    };
    //return this vector counterclockwise rotated by rad radians as a new vector
    Vec2.prototype.rotate = function(rad){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var px = this.x * c - this.y *s;
        var py = this.x * s + this.y *c;
        return new Vec2(px,py);
    };
    //return this vector counterclockwise rotated by deg degrees as a new vector
    Vec2.prototype.rotate_deg = function(deg){
        return this.rotate(deg * deg2rad);
    };
    //linearly interpolate this vector towards the vector v by float factor alpha.
    // alpha == 0 : does nothing
    // alpha == 1 : sets this to v
    Vec2.prototype.lerp = function(v,alpha){
        var inv_alpha = 1 - alpha;
        return new Vec2(    this.x * inv_alpha + v.x * alpha,
                            this.y * inv_alpha + v.y * alpha    );
    };
    // returns the angle between this vector and the vector (1,0) in radians
    Vec2.prototype.angle = function(){
        return Math.atan2(this.y,this.x);
    };
    // returns the angle between this vector and the vector (1,0) in degrees
    Vec2.prototype.angle_deg = function(){
        return Math.atan2(this.y,this.x) * rad2deg;
    };
    // returns true if this vector is equal to the vector v, with a tolerance defined by the epsilon module constant
    Vec2.prototype.equals = function(v){
        if(Math.abs(this.x-v.x) > epsilon){
            return false;
        }else if(Math.abs(this.y-v.y) > epsilon){
            return false;
        }
        return true;
    };
    // returns true if this vector is equal to the vector (x,y) with a tolerance defined by the epsilon module constant
    Vec2.prototype.equals_xy = function(x,y){
        if(Math.abs(this.x-x) > epsilon){
            return false;
        }else if(Math.abs(this.y-y) > epsilon){
            return false;
        }
        return true;
    };
})(window.modula);

        

