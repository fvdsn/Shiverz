// Modula 3D Vectors
window.modula = window.modula || {};
(function(modula){
    function Vec3(){
        if(arguments.length === 0){
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }else if (arguments.length === 1){
            if(typeof arguments[0] === 'number'){
                this.x = arguments[0];
                this.y = arguments[0];
                this.z = arguments[0];
            }else{
                this.x = arguments[0].x;
                this.y = arguments[0].y;
                this.z = arguments[0].z;
            }
        }else if (arguments.length === 2){
            this.x = arguments[0];
            this.y = arguments[1];
            this.z = 0;
        }else if (arguments.length === 3){
            this.x = arguments[0];
            this.y = arguments[1];
            this.z = arguments[2];
        }else{
            console.error("new Vec3(): wrong number of arguments:"+arguments.length);
        }
    };

    Vec3.zero = new Vec3();
    Vec3.x    = new Vec3(1,0,0);
    Vec3.y    = new Vec3(0,1,0);
    Vec3.z    = new Vec3(0,0,1);

    modula.Vec3 = Vec3;
    var proto = Vec3.prototype;

    // Multiply a number expressed in radiant by radToDeg to convert it in degrees
    var radToDeg = 57.29577951308232;
    // Multiply a number expressed in degrees by degToRad to convert it to radiant
    var degToRad = 0.017453292519943295;
    // The numerical precision used to compare vector equality
    var epsilon   = 0.0000001;

    Vec3.randomPositive = function(){
        return new Vec3(Math.random(), Math.random(), Math.random());
    };

    Vec3.random = function(){
        return new Vec3( Math.random()*2 - 1, 
                         Math.random()*2 - 1, 
                         Math.random()*2 - 1 );
    };

    Vec3.randomSphere = function(){
        var v = new Vec3();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
            v.z = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    proto.isZero = function(){
        return this.x === 0 && this.y === 0 && this.z === 0;
    };

    proto.len = function(){
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    };

    proto.lenSq = function(){
        return this.x*this.x + this.y*this.y + this.z*this.z;
    };

    proto.dist = function(v){
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };

    proto.distSq = function(v){
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        return dx*dx + dy*dy + dz*dz;
    };

    proto.dot = function(v){
        return this.x*v.x + this.y*v.y + this.z*v.z;
    };

    proto.clone = function(){
        return new Vec3(this);
    };

    proto.add = function(v){
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    };

    proto.sub = function(v){
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    };

    proto.mult = function(v){
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    };

    proto.scale = function(f){
        return new Vec3(this.x * f, this.y * f, this.z * f);
    };

    proto.neg = function(){
        return new Vec3(-this.x, - this.y, - this.z);
    };

    proto.normalize = function(){
        var len = this.lenSq();
        var v   = this.clone();
        if(len !== 0){
            if(len !== 1){
                len = 1 / Math.sqrt(len);
                v.x *= len;
                v.y *= len;
                v.z *= len;
            }
        }
        return v;
    };

    proto.setLen = function(l){
        return this.normalize().scale(l);
    };

    proto.project = function(v){
        return v.setLen(this.dot(v));
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

    proto.lerp = function(v,f){
        var nf = 1.0 - f;
        return new Vec3(
                this.x*nf + v.x*f,
                this.y*nf + v.y*f,
                this.z*nf + v.z*f );
    };

    proto.equals = function(v){
        return Math.abs(this.x - v.x) <= epsilon &&
               Math.abs(this.y - v.y) <= epsilon &&
               Math.abs(this.z - v.z) <= epsilon;
    };

    proto.round = function(){
        return new Vec3( Math.round(this.x), Math.round(this.y), Math.round(this.z));
    };

    proto.reflect = function(vn){
        var dot2 = this.dot(vn) * 2;
        return new Vec3( this.x - vn.x * dot2,
                         this.y - vn.y * dot2,
                         this.z - vn.z * dot2 );
    };

    proto.cross = function(v){
        var u = this;
        return new Vec3( u.y*v.z - u.z*v.y,
                         u.z*v.x - u.x*v.z,
                         u.x*v.y - u.y*v.x  );
    };
    proto.i       = function(i){
        if(i === 0){
            return this.x;
        }else if(i === 1){
            return this.y;
        }else if(i === 2){
            return this.z;
        }
    };
    
    proto.array   = function(){
        return [this.x,this.y,this.z];
    };

    proto.float32 = function(){
        return new Float32Array(this.array());
    };

    proto.float64 = function(){
        return new Float64Array(this.array());
    };

    proto.uint8 = function(){
        return new Uint8Array(this.array());
    };

})(modula);
