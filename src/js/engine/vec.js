var module = window;

/* --------- 2D Vectors ---------- */

(function(module){

     
    // The 2D vector object 
    function Vec2(){
        if (arguments.length === 0) {
           this.x = 0;
           this.y = 0;
        }else if (arguments.length === 1){
            if(typeof arguments[0] === 'number'){
                this.x = arguments[0];
                this.y = arguments[0];
            }else{
                this.x = arguments[0].x;
                this.y = arguments[0].y;
            }
        }else if (arguments.length === 2){
           this.x = arguments[0];
           this.y = arguments[1];
        }else{
            console.error("new Vec2(): wrong number of arguments:",arguments.length);
        }
    }

    module.Vec2 = Vec2;

    var proto = Vec2.prototype;

    Vec2.radToDeg = 180.0 / math.PI;
    Vec2.degToRad = math.PI / 180.0;
    Vec2.epsilon  = 0.00000001;  
    
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

    proto.randomPositive = function(){
        this.x = Math.random();
        this.y = Math.random();
    };

    proto.random = function(){
        this.x = Math.random()*2 - 1; 
        this.y = Math.random()*2 - 1; 
    };
    
    Vec2.randomDisc = function(vd){
        do{
            vd.x = Math.random() * 2 - 1;
            vd.y = Math.random() * 2 - 1;
        }while(vd.lenSq() > 1);
    };

    proto.randomSphere = function(){
        do{
            this.x = Math.random() * 2 - 1;
            this.y = Math.random() * 2 - 1;
        }while(this.lenSq() > 1);
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

    // return the distance between this vector and the vector v
    proto.dist = function(v){
        return Vec2.dist(this,v);
    };
    
    //returns the squared distance between v1 and v2
    Vec2.distSq = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return dx*dx + dy*dy;
    };

    
    // return the squared distance between this vector and the vector and the vector v
    proto.distSq = function(v){
        return Vec2.distSq(this,v);
    };
    
    //returns the dot product of v1 and v2
    Vec2.dot = function(v1,v2){
        return v1.x*v2.x + v2.y*v2.y;
    }
    // return the dot product between this vector and the vector v
    proto.dot = function(v){
        return this.x*v.x + this.y*v.y;
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

    // return the sum of this and vector v as a new vector
    proto.add = function(v){
        return new Vec2(this.x+v.x,this.y+v.y);
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

    // returns (this - v) as a new vector where v is a vector and - is the vector subtraction
    proto.sub = function(v){
        return new Vec2(this.x-v.x,this.y-v.y);
    };

    
    // sets vd to the by component product of v1 and v2
    Vec2.mult= function(vd,v1,v2){
        vd.x = v1.x * v2.x;
        vd.y = v1.x * v2.y;
    };

    // return (this * v) as a new vector where v is a vector and * is the by component product
    proto.mult = function(v){
        return new Vec2(this.x*v.x,this.y*v.y);
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
            vd.x = 1;
            vd.y = 0;
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
        var str = "[";
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

})(module);

/* --------- 3D Vectors ---------- */

(function(module){

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
    Vec3.radToDeg = 180.0 / math.PI;
    Vec3.degToRad = math.PI / 180.0;
    Vec3.epsilon  = 0.00000001;    
    
    module.Vec3 = Vec3;

    var proto = Vec3.prototype;

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

    proto.angle = function(v){
    	return math.acos(this.dot(v)/(this.len()*v.len());
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
        return Math.abs(this.x - v.x) <= Vec3.epsilon &&
               Math.abs(this.y - v.y) <= Vec3.epsilon &&
               Math.abs(this.z - v.z) <= Vec3.epsilon;
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

})(module);

/* --------- 3D Matrix ---------- */

(function(module){

    var Vec3 = module.Vec3;

    function Mat3(){
        var alen = arguments.length;
        if(alen === 0){
            this.xx = 1;
            this.xy = 0;
            this.xz = 0;
            this.yx = 0;
            this.yy = 1;
            this.yz = 0;
            this.zx = 0;
            this.zy = 0;
            this.zz = 1;
        }else if (alen === 1){
            var arg = arguments[0];
            if( typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            this.xx = arg.xx;
            this.xy = arg.xy;
            this.xz = arg.xz;
            this.yx = arg.yx;
            this.yy = arg.yy;
            this.yz = arg.yz;
            this.zx = arg.zx;
            this.zy = arg.zy;
            this.zz = arg.zz;
        }else if (alen === 9){
            this.xx = arguments[0];
            this.xy = arguments[1];
            this.xz = arguments[2];
            this.yx = arguments[3];
            this.yy = arguments[4];
            this.yz = arguments[5];
            this.zx = arguments[6];
            this.zy = arguments[7];
            this.zz = arguments[8];
        }else{
            throw new Error('new Mat3(): wrong number of arguments:'+alen);
        }
    };

    module.Mat3 = Mat3;

    Mat3.radToDeg = 180.0 / math.PI;
    Mat3.degToRad = math.PI / 180.0;
    Mat3.epsilon  = 0.00000001;    
    Mat3.id       = new Mat3();
    Mat3.zero     = new Mat3(0,0,0,0,0,0,0,0,0);

    var proto = Mat3.prototype;

    function epsilonEquals(a,b){  return Math.abs(a-b) <= Mat3.epsilon };

    proto.equals = function(mat){
        return epsilonEquals(this.xx, mat.xx) &&
               epsilonEquals(this.xy, mat.xy) &&
               epsilonEquals(this.xz, mat.xz) &&
               epsilonEquals(this.yx, mat.yx) &&
               epsilonEquals(this.yy, mat.yy) &&
               epsilonEquals(this.yz, mat.yz) &&
               epsilonEquals(this.zx, mat.zx) &&
               epsilonEquals(this.zy, mat.zy) &&
               epsilonEquals(this.zz, mat.zz);
    };

    proto.clone = function(){
        return new Mat3(this);
    };

    proto.scale = function(fac){
        var m = new Mat3();
        m.xx = this.xx * fac;
        m.xy = this.xy * fac;
        m.xz = this.xz * fac;
        m.yx = this.yx * fac;
        m.yy = this.yy * fac;
        m.yz = this.yz * fac;
        m.zx = this.zx * fac;
        m.zy = this.zy * fac;
        m.zz = this.zz * fac;
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",\n ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",\n ";
        str += this.zx + ",";
        str += this.zy + ",";
        str += this.zz + "]";
        return str;
    };

    proto.add = function(mat){
        var m = new Mat3();
        m.xx = this.xx + mat.xx;
        m.xy = this.xy + mat.xy;
        m.xz = this.xz + mat.xz;
        m.yx = this.yx + mat.yx;
        m.yy = this.yy + mat.yy;
        m.yz = this.yz + mat.yz;
        m.zx = this.zx + mat.zx;
        m.zy = this.zy + mat.zy;
        m.zz = this.zz + mat.zz;
        return m;
    };

    proto.sub = function(mat){
        var m = new Mat3();
        m.xx = this.xx - mat.xx;
        m.xy = this.xy - mat.xy;
        m.xz = this.xz - mat.xz;
        m.yx = this.yx - mat.yx;
        m.yy = this.yy - mat.yy;
        m.yz = this.yz - mat.yz;
        m.zx = this.zx - mat.zx;
        m.zy = this.zy - mat.zy;
        m.zz = this.zz - mat.zz;
        return m;
    };

    Mat3.mult = function(a,b,dst){
        // xx xy xz   xx xy xz
        // yx yy yz * yx yy yz
        // zx zy zz   zx zy zz
        dst.xx = a.xx*b.xx + a.xy*b.yx + a.xz*b.zx; 
        dst.xy = a.xx*b.xy + a.xy*b.yy + a.xz*b.zy; 
        dst.xz = a.xx*b.xz + a.xy*b.yz + a.xz*b.zz; 

        dst.yx = a.yx*b.xx + a.yy*b.yx + a.yz*b.zx; 
        dst.yy = a.yx*b.xy + a.yy*b.yy + a.yz*b.zy; 
        dst.yz = a.yx*b.xz + a.yy*b.yz + a.yz*b.zz; 

        dst.zx = a.zx*b.xx + a.zy*b.yx + a.zz*b.zx; 
        dst.zy = a.zx*b.xy + a.zy*b.yy + a.zz*b.zy; 
        dst.zz = a.zx*b.xz + a.zy*b.yz + a.zz*b.zz; 
    };

    proto.mult = function(mat){
        var m = new Mat3();
        Mat3.mult(this,mat,m);
        return m;
    };

    proto.multVec = function(v){
        var m = this;
        return new Vec3( m.xx * v.x + m.xy * v.y + m.xz * v.z,
                         m.yx * v.x + m.yy * v.y + m.yz * v.z,
                         m.zx * v.x + m.zy * v.y + m.zz * v.z );
    };

    Mat3.rotationX = function(angle){
        var m = new Mat3();
        if(!angle){
            return m;
        }
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.yy = c;
        m.yz = -s;
        m.zy = s;
        m.zz = c;
        return m;
    };

    Mat3.rotationY = function(angle){
        var m = new Mat3();
        if(!angle){
            return m;
        }
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xz = -s;
        m.zx = s;
        m.zz = c;
        return m;
    };

    Mat3.rotationZ = function(angle){
        var m = new Mat3();
        if(!angle){
            return m;
        }
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
        return m;
    };

    Mat3.rotation = function(anglex,angley,anglez){
        if(anglex){
            var m = Mat3.rotateX(anglex);
        }
        if(angley){
            if(m){
                m = m.mult(Mat3.rotateY(angley));
            }else{
                m = Mat3.rotateY(angley);
            }
        }
        if(anglez){
            if(m){
                m = m.mult(Mat3.rotateZ(anglez));
            }else{
                m = Mat3.rotateZ(anglez);
            }
        }
        return m || new Mat3();
    };

    Mat3.rotationAxis = function(axis,angle){
        var u = axis.normalize();
        var c = Math.cos(angle);
        var nc = (1-c);
        var s = Math.sin(angle);
        var m = new Mat3();

        m.xx = c + u.x*u.x*nc;
        m.xy = u.x*u.y*nc - u.z*s;
        m.xz = u.x*u.z*nc + u.y*s;
        
        m.yx = u.y*u.x*nc + u.z*s;
        m.yy = c + u.y*u.y*nc;
        m.yz = u.y*u.z*nc - u.x*s;

        m.zx = u.z*u.x*nc - u.y*s;
        m.zy = u.z*u.y*nc + u.x*s;
        m.zz = c + u.z*u.z*nc;

        return m;
    };

    proto.det = function(){
        var m = this;
        return m.xx*(m.zz*m.yy-m.zy*m.yz) - m.yx*(m.zz*m.xy-m.zy*m.xz) + m.zx*(m.yz*m.xy-m.yy*m.xz);
    };

    proto.invert = function(){
        var det  = this.det();
        var m = new Mat3();
        if(!det){
            return m;
        }
        var d = 1/det;

        m.xx =  d*( m.zz*m.yy-m.zx*m.yz );
        m.xy = -d*( m.zz*m.xy-m.zx*m.xz );
        m.xz =  d*( m.yz*m.xy-m.yy*m.xz );
        
        m.yx = -d*( m.zz*m.yx-m.zx*m.yz );
        m.yy =  d*( m.zz*m.xx-m.zx*m.xz );
        m.yz = -d*( m.yz*m.xx-m.yx*m.xz );

        m.zx =  d*( m.zy*m.yx-m.zx*m.yy );
        m.zy = -d*( m.zy*m.xx-m.zx*m.xy );
        m.yy =  d*( m.yy*m.xx-m.yz*m.xy );
    };

    proto.trace = function(){
        return this.xx + this.yy + this.zz;
    };

    proto.transpose = function(){
        var m = new Mat3();

        m.xx = this.xx;
        m.xy = this.yx;
        m.xz = this.zx;

        m.yx = this.xy;
        m.yy = this.yy;
        m.yz = this.zy;

        m.zx = this.xz;
        m.zy = this.yz;
        m.zz = this.zz;

        return m;
    };

    proto.row = function(i){
        var m = this;
        if(i === 0){
            return new Vec3(m.xx,m.xy,m.xz);
        }else if(i === 1){
            return new Vec3(m.yx,m.yy,m.yz);
        }else if(i === 2){
            return new Vec3(m.zx,m.zy,m.zz);
        }
    };
    
    proto.col = function(j){
        var m = this;
        if(j === 0){
            return new Vec3(m.xx,m.yx,m.zx);
        }else if(j === 1){
            return new Vec3(m.xy,m.yy,m.zy);
        }else if(j === 2){
            return new Vec3(m.xz,m.yz,m.zz);
        }
    };

    proto.diag = function(){
        return new Vec3(this.xx,this.yy,this.zz);
    };

    var map = [ ['xx','xy','xz'],
                ['yx','yy','yz'],
                ['zx','zy','zz'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

})(module);