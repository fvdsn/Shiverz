var module = window;

/* ------------------------------ 2D Vectors -------------------------------- */

(function(module){
    
    function Vec2(){
    	var alen = arguments.length;      
    	if(alen=== 0){
            this.x = 0.0;
            this.y = 0.0;
        }else if (alen === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                this.x = arg;
                this.y = arg;
            }else if(typeof arg.angle === 'number' || typeof arg.len === 'number'){
                console.log('polar form activated');
                console.log(arg);
                Vec2.setPolar(this, (arg.len === undefined ? 1 : arg.len), arg.angle || 0);
            }else if(arg[0] !== undefined){
                this.x = arg[0] || 0;
                this.y = arg[1] || 0;
            }else{
            	this.x = arg.x || 0;
            	this.y = arg.y || 0;
            }
        }else if (alen === 2){
            this.x = arguments[0];
            this.y = arguments[1];
        }else{
            console.error("new Vec2(): wrong number of arguments:"+arguments.length);
        }
    }

    module.Vec2 = Vec2;

    var proto = Vec2.prototype;
    
    Vec2.NaN      = new Vec2(Number.NaN,Number.NaN);
    Vec2.zero     = new Vec2();
    Vec2.x        = new Vec2(1,0);
    Vec2.y        = new Vec2(0,1);
    Vec2.epsilon  = 0.00000001;
    Vec2.tmp      = new Vec2();
    Vec2.tmp1     = new Vec2();
    Vec2.tmp2     = new Vec2();

    var tmp       = new Vec2();
    var tmp1      = new Vec2();
    var tmp2      = new Vec2();
    
    // sets vd to a vector of length 'len' and angle 'angle' radians
    Vec2.setPolar = function(vd,len,angle){
    	vd.x = len;
        vd.y = 0;
        Vec2.rotate(vd,vd,angle);
        return vd;
    };

    Vec2.polar = function(len,angle){
        var v = new Vec2();
        Vec2.setPolar(v,len,angle);
        return v;
    };

	Vec2.random = function(){
		return new Vec2(Math.random()*2 - 1, Math.random()*2 - 1);
	}

    Vec2.randomPositive = function(){
        return new Vec2(Math.random(),Math.random());
    };

    Vec2.randomDisc = function(){
    	var v = new Vec2();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    Vec2.isZero  = function(v){
        return v.x === 0 && v.y === 0;
    };

    proto.isZero = function(){
        return this.x === 0 && this.y === 0;
    };

    Vec2.isNaN = function(v){
        return Number.isNaN(v.x) || Number.isNaN(v.y);
    };

    proto.isNaN = function(){
    	return Number.isNaN(this.x) || Number.isNaN(this.y);
    };

    Vec2.len = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y);
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

    proto.addScaled = function(v,scale){
        var vd = new Vec2();
        Vec2.addScaled(vd,this,v,scale);
        return vd;
    };
    
    //sets vd to v1 - v2
    Vec2.sub = function(vd,v1,v2){
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

    Vec2.div = function(vd,u,v){
        vd.x = u.x / v.x;
        vd.y = u.y / v.y;
    };

    proto.div = function(v){
        return new Vec2(this.x/v.x,this.y/v.y);
    };

    Vec2.invert = function(vd,v){
        vd.x = 1.0/v.x;
        vd.y = 1.0/v.y;
    };

    proto.invert = function(){
        return new Vec2(1/this.x,1/this.y);
    };

    Vec2.pow = function(vd,v,pow){
        vd.x = Math.pow(v.x,pow);
        vd.y = Math.pow(v.y,pow);
    };

    proto.pow = function(pow){
        return new Vec2(Math.pow(this.x,pow), Math.pow(this.y,pow));
    };

    Vec2.sq = function(vd,v){
        vd.x = v.x * v.x;
        vd.y = v.y * v.y;
    };
    
    proto.sq = function(){
        return new Vec2(this.x*this.x,this.y*this.y);
    };
   
    //sets vd to the normalized v, or [NaN,NaN] if v is zero
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
            vd.x = Number.NaN;
            vd.y = Number.NaN;
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
        Vec2.normalize(tmp,v2);
        var dot = Vec2.dot(v1,tmp);
        Vec2.setLen(vd,tmp,dot);
    };
    
    // return the projection of this onto the vector v as a new vector
    proto.project = function(v){
        var vd = new Vec2();
        Vec2.project(vd,this,v);
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
        
    //return this vector counterclockwise rotated by rad radians as a new vector
    proto.rotate = function(rad){
        var vd = new Vec2();
        Vec2.rotate(vd,this,rad);
        return vd;
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
    
    Vec2.azimuth = function(v){
        return Math.atan2(v.y,v.x);
    };

    // returns the angle between this vector and the vector (1,0) in radians
    proto.azimuth = function(){
        return Math.atan2(this.y,this.x);
    };
    
    Vec2.equals = function(u,v){
        return Math.abs(u.x-v.x) <= Vec2.epsilon && Math.abs(u.y - v.y) <= Vec2.epsilon;
    };

    proto.equals = function(v){
        return Vec2.equals(this,v);
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

    Vec2.crossArea = function(u,v){
        return u.x * v.y - u.y * v.y;
    };

    //returns the area of the parallelogram between this and v
    proto.crossArea = function(v){
        return this.x * v.y - this.y * v.x;
    };

    //sets vd to the reflection of v on the normal vn
    Vec2.reflect = function(vd,v,vn){
        var dot2 = Vec2.dot(v,vn) * 2;
        vd.x = v.x - vn.x * dot2;
        vd.y = v.y - vn.y * dot2;
    };

    //returns the reflection of this vector on the normal vn
    proto.reflect = function(vn){
        var vd = new Vec2();
        Vec2.normalize(tmp,vn);
        Vec2.reflect(vd,this,tmp);
        return vd;
    };

    proto.array   = function(){
        return [this.x,this.y];
    };

    proto.float32 = function(){
        var a = Float32Array(2);
        a[0] = this.x;
        a[1] = this.y;
        return a;
    };

})(module);

/* ------------------------------ 3D Vectors -------------------------------- */

(function(module){

    function Vec3(){
        if(arguments.length === 0){
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }else if (arguments.length === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                this.x = arg;
                this.y = arg;
                this.z = arg;
            }else if(arg[0] !== undefined){
                this.x = arg[0] || 0;
                this.y = arg[1] || 0;
                this.z = arg[2] || 0;
            }else{
            	this.x = arg.x || 0;
            	this.y = arg.y || 0;
            	this.z = arg.z || 0;
            }
        }else if (arguments.length === 3){
            this.x = arguments[0];
            this.y = arguments[1];
            this.z = arguments[2];
        }else{
            console.error("new Vec3(): wrong number of arguments:"+arguments.length);
        }
    };

    Vec3.NaN  = new Vec3(Number.NaN,Number.NaN,Number.NaN);
    Vec3.zero = new Vec3();
    Vec3.x    = new Vec3(1,0,0);
    Vec3.y    = new Vec3(0,1,0);
    Vec3.z    = new Vec3(0,0,1);
    Vec3.epsilon  = 0.00000001;    
    Vec3.tmp  = new Vec3();
    Vec3.tmp1 = new Vec3();
    Vec3.tmp2 = new Vec3();

    var tmp  = new Vec3();
    var tmp1 = new Vec3();
    var tmp2 = new Vec3();
    
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

    Vec3.isZero  = function(v){
        return v.x === 0 && v.y === 0 && v.z === 0;
    };

    proto.isZero = function(){
        return Vec3.isZero(this);
    };
    
    Vec3.isNaN  = function(v){
    	return Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z);
    };

    proto.isNaN = function(){
        return Vec3.isNaN(this);
    };
    
    Vec3.len  = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    };

    proto.len = function(){
        return Vec3.len(this);
    };
    
    Vec3.lenSq = function(v){
        return v.x*v.x + v.y*v.y + v.z*v.z;
    };

    proto.lenSq = function(){
        return Vec3.lenSq(this);
    };

    Vec3.dist = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };
    
    proto.dist = function(v){
        return Vec3.dist(this,v);
    };

    Vec3.distSq = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return dx*dx + dy*dy + dz*dz;
    };

    proto.distSq = function(v){
        return Vec3.distSq(this,v);
    };

    Vec3.dot = function(u,v){
        return u.x*v.x + u.y*v.y + u.z*v.z;
    };

    proto.dot = function(v){
        return Vec3.dot(this,v);
    };
    
    Vec3.angle = function(u,v){
        return math.acos(Vec3.dot(u,v)/(Vec3.len(u)*Vec3.len(v)));
    };

    proto.angle = function(v){
        return Vec3.angle(this,v);
    };

    Vec3.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
        vd.z = v.z;
    };

    proto.clone = function(){
        return new Vec3(this);
    };

    Vec3.add = function(vd,u,v){
        vd.x = u.x+v.x;
        vd.y = u.y+v.y;
        vd.z = u.z+v.z;
    };

    proto.add = function(v){
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    };

    Vec3.sub = function(vd,u,v){
        vd.x = u.x-v.x;
        vd.y = u.y-v.y;
        vd.z = u.z-v.z;
    };

    proto.sub = function(v){
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    };

    Vec3.mult = function(vd,u,v){
        vd.x = u.x*v.x;
        vd.y = u.y*v.y;
        vd.z = u.z*v.z;
    };

    proto.mult = function(v){
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    };

    Vec3.scale = function(vd,u,f){
        vd.x = u.x*f;
        vd.y = u.y*f;
        vd.z = u.z*f;
    };

    proto.scale = function(f){
        return new Vec3(this.x * f, this.y * f, this.z * f);
    };

    proto.neg = function(){
        return new Vec3(-this.x, - this.y, - this.z);
    };

    Vec3.div = function(vd,u,v){
        vd.x = u.x/v.x;
        vd.y = u.y/v.y;
        vd.z = u.z/v.z;
    };
    
    proto.div = function(v){
        var vd = new Vec3();
        Vec3.div(vd,this,v);
        return vd;
    };

    Vec3.invert = function(vd,v){
        vd.x = 1.0/v.x;
        vd.y = 1.0/v.y;
        vd.z = 1.0/v.z;
    };

    proto.invert = function(){
        var v = new Vec3();
        Vec3.invert(v,this);
        return v;
    };

    Vec3.pow = function(vd,v,pow){
        vd.x = Math.pow(v.x,pow);
        vd.y = Math.pow(v.y,pow);
        vd.z = Math.pow(v.z,pow);
    };

    proto.pow = function(pow){
        var v = new Vec3();
        Vec3.pow(v,this,pow);
        return v;
    };

    Vec3.sq = function(vd,v){
        vd.x = v.x * v.x;
        vd.y = v.y * v.y;
        vd.z = v.z * v.z;
    };

    proto.sq = function(){
        var v = new Vec3();
        Vec3.sq(v,this);
        return v;
    };

    Vec3.normalize = function(vd,v){
        var len = Vec3.lenSq(v);
        if(len === 0){
            vd.x = Number.NaN;
            vd.y = Number.NaN;
            vd.z = Number.NaN;
        }else{
            if(len !== 1){
                len = 1 / Math.sqrt(len);
                vd.x = v.x * len;
                vd.y = v.y * len;
                vd.z = v.z * len;
            }else{
                Vec3.copy(vd,v);
            }
        }
    };

    proto.normalize = function(){
        var v   = new Vec3();
        Vec3.normalize(v,this);
        return v;
    };
    
    Vec3.setLen = function(vd,v,l){
        Vec3.normalize(vd,v);
        Vec3.scale(vd,vd,l);
    };

    proto.setLen = function(l){
        var v = new Vec3();
        Vec3.setLen(v,this,l);
        return v;
    };

    Vec3.project = function(vd,u,v){
        Vec3.normalize(tmp,v);
        var dot = Vec3.dot(u,tmp);
        Vec3.setLen(vd,tmp,dot);
    };

    proto.project = function(v){
        var vd = new Vec3();
        Vec3.project(vd,this,v);
        return vd;
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

    Vec3.lerp = function(vd,u,v,f){
        var nf = 1.0 - f;
        vd.x = u.x*nf + v.x*f;
        vd.y = u.y*nf + v.y*f;
        vd.z = u.z*nf + v.z*f;
    };

    proto.lerp = function(v,f){
        var vd = new Vec3();
        Vec3.lerp(vd,this,v,f);
        return vd;
    };

    Vec3.equals  = function(u,v){
        return Math.abs(u.x - v.x) <= Vec3.epsilon &&
               Math.abs(u.y - v.y) <= Vec3.epsilon &&
               Math.abs(u.z - v.z) <= Vec3.epsilon;
    };

    proto.equals = function(v){
        return Vec3.equals(this,v);
    };
    
    Vec3.round  = function(vd,v){
        vd.x = Math.round(v.x);
        vd.y = Math.round(v.y);
        vd.z = Math.round(v.z);
    };

    proto.round = function(){
        return new Vec3( Math.round(this.x), Math.round(this.y), Math.round(this.z));
    };

    Vec3.reflect = function(vd,v,vn){
        Vec3.normalize(tmp,vn);
        var dot2 = Vec3.dot(v,tmp) * 2;
        vd.x = v.x - tmp.x * dot2;
        vd.y = v.y - tmp.y * dot2;
        vd.z = v.z - tmp.z * dot2;
    };

    proto.reflect = function(vn){
        var vd = new Vec3();
        Vec3.reflect(vd,this,vn);
        return vd;
    };

    Vec3.cross  = function(vd,u,v){
        vd.x = u.y*v.z - u.z*v.y;
        vd.y = u.z*v.x - u.x*v.z;
        vd.z = u.x*v.y - u.y*v.x;
    }

    proto.cross = function(v){
        var vd = new Vec3();
        Vec3.cross(vd,this,v);
        return vd;
    };

    proto.i       = function(i){
        if(i === 0){
            return this.x;
        }else if(i === 1){
            return this.y;
        }else if(i === 2){
            return this.z;
        }else{
            return 0.0;
        }
    };
    
    proto.array   = function(){
        return [this.x,this.y,this.z];
    };

    proto.float32 = function(){
        var a = Float32Array(3);
        a[0] = this.x;
        a[1] = this.y;
        a[2] = this.z;
        return a;
    };

})(module);

/* ------------------------------ 3x3 Matrix -------------------------------- */

(function(module){

    var Vec3 = module.Vec3;
        
    // 1 4 7 | xx xy xz
    // 2 5 8 | yx yy yz
    // 3 6 9 | zx zy zz

    var set  = function(md,components_){
        md.xx = arguments[1];
        md.xy = arguments[4];
        md.xz = arguments[7];
        md.yx = arguments[2];
        md.yy = arguments[5];
        md.yz = arguments[8];
        md.zx = arguments[3];
        md.zy = arguments[6];
        md.zz = arguments[9];
    };

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
            if(arg[0] !== undefined){
                set(this,arg);
            }else if(   typeof arg.rotation === 'number'
                     || typeof arg.scale === 'number'
                     || typeof arg.translation === 'number'){
                Mat3.setTransform(this,
                        arg.translation || new Vec2(),
                        arg.scale|| new Vec2(1,1),
                        arg.rotation || 0
                );
            }else{
                this.xx = arg.xx || 0;
                this.xy = arg.xy || 0;
                this.xz = arg.xz || 0;
                this.yx = arg.yx || 0;
                this.yy = arg.yy || 0;
                this.yz = arg.yz || 0;
                this.zx = arg.zx || 0;
                this.zy = arg.zy || 0;
                this.zz = arg.zz || 0;
            }
        }else if (alen === 9){
            set(this,arguments);
        }else{
            throw new Error('new Mat3(): wrong number of arguments:'+alen);
        }
    };

    module.Mat3 = Mat3;

    Mat3.epsilon  = 0.00000001;    
    Mat3.id       = new Mat3();
    Mat3.zero     = new Mat3(0,0,0,0,0,0,0,0,0);
    var nan = Number.NaN;
    Mat3.NaN      = new Mat3(nan,nan,nan,
                             nan,nan,nan,
                             nan,nan,nan);
    Mat3.tmp      = new Mat3();
    Mat3.tmp1     = new Mat3();
    Mat3.tmp2     = new Mat3();

    var tmp_a = new Mat3();
    var tmp_b = new Mat3();
    var tmp_vec = new Vec3();

    var proto = Mat3.prototype;

    function epsilonEquals(a,b){  return Math.abs(a-b) <= Mat3.epsilon };

    Mat3.equals  = function(m,n){
        return epsilonEquals(m.xx, n.xx) &&
               epsilonEquals(m.xy, n.xy) &&
               epsilonEquals(m.xz, n.xz) &&
               epsilonEquals(m.yx, n.yx) &&
               epsilonEquals(m.yy, n.yy) &&
               epsilonEquals(m.yz, n.yz) &&
               epsilonEquals(m.zx, n.zx) &&
               epsilonEquals(m.zy, n.zy) &&
               epsilonEquals(m.zz, n.zz);
    };
        
    proto.equals = function(mat){
        return Mat3.equals(this,mat);
    };

    Mat3.copy = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.xz = m.xz;
        md.yx = m.yx;
        md.yy = m.yy;
        md.yz = m.yz;
        md.zx = m.zx;
        md.zy = m.zy;
        md.zz = m.zz;
    };

    Mat3.set = set;

    Mat3.setId = function(md){
        Mat3.copy(md,Mat3.id);
    };

    Mat3.setZero = function(md){
        Mat3.copy(md,Mat3.zero);
    };

    proto.clone = function(){
        var m = new Mat3();
        Mat3.copy(m,this);
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",\n  ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",\n  ";
        str += this.zx + ",";
        str += this.zy + ",";
        str += this.zz + "]";
        return str;
    };

    Mat3.add = function(md,m,n){
        md.xx = m.xx + n.xx;
        md.xy = m.xy + n.xy;
        md.xz = m.xz + n.xz;
        md.yx = m.yx + n.yx;
        md.yy = m.yy + n.yy;
        md.yz = m.yz + n.yz;
        md.zx = m.zx + n.zx;
        md.zy = m.zy + n.zy;
        md.zz = m.zz + n.zz;
    };

    proto.add = function(mat){
        var m = new Mat3();
        Mat3.add(m,this,mat);
        return m;
    };

    Mat3.sub = function(md,m,n){
        md.xx = m.xx - n.xx;
        md.xy = m.xy - n.xy;
        md.xz = m.xz - n.xz;
        md.yx = m.yx - n.yx;
        md.yy = m.yy - n.yy;
        md.yz = m.yz - n.yz;
        md.zx = m.zx - n.zx;
        md.zy = m.zy - n.zy;
        md.zz = m.zz - n.zz;
    };

    proto.sub = function(mat){
        var m = new Mat3();
        Mat3.sub(m,this,mat);
        return m;
    };

    Mat3.neg = function(md,m){
        md.xx = -m.xx;
        md.xy = -m.xy;
        md.xz = -m.xz;
        md.yx = -m.yx;
        md.yy = -m.yy;
        md.yz = -m.yz;
        md.zx = -m.zx;
        md.zy = -m.zy;
        md.zz = -m.zz;
    };

    proto.neg = function(mat){
        var m = new Mat3();
        Mat3.neg(m,this);
        return m;
    };

    Mat3.tr = function(md,m){
        if(md === m){
            Mat3.copy(tmp_a,m);
            m = tmp_a;
        }
        md.xx = m.xx;
        md.xy = m.yx;
        md.xz = m.zx;
        md.yx = m.xy;
        md.yy = m.yy;
        md.yz = m.zy;
        md.zx = m.xz;
        md.zy = m.yz;
        md.zz = m.zz;
    };

    proto.tr = function(){
        var m = new Mat3();
        Mat3.tr(m,this);
        return m;
    };

    Mat3.mult = function(dst,a,b){
        if(dst === a){
            Mat3.copy(tmp_a,a);
            a = tmp_a;
        }
        if(dst === b){
            Mat3.copy(tmp_b,b);
            b = tmp_b;
        }
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

    Mat3.multFac  = function(md,m,fac){
        md.xx = m.xx * fac;
        md.xy = m.xy * fac;
        md.xz = m.xz * fac;
        md.yx = m.yx * fac;
        md.yy = m.yy * fac;
        md.yz = m.yz * fac;
        md.zx = m.zx * fac;
        md.zy = m.zy * fac;
        md.zz = m.zz * fac;
    };

    Mat3.multVec3 = function(vd,m,v){
        var vx = v.x, vy = v.y, vz = v.z;
        vd.x = m.xx * vx + m.xy * vy + m.xz * vz;
        vd.y = m.yx * vx + m.yy * vy + m.yz * vz;
        vd.z = m.zx * vx + m.zy * vy + m.zz * vz;
    };

    Mat3.multVec2 = function(vd,m,v){
        var vx = v.x, vy = v.y;
        var d  = 1.0 / ( vx * m.zx + vy * m.zy + m.zz);
        vd.x = d * ( m.xx * vx + m.xy * vy + m.xz );
        vd.y = d * ( m.yx * vx + m.yy * vy + m.yz );
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var m = new Mat3();
            Mat3.multFac(m,this,arg);
            return m;
        }else if(arg instanceof Mat3){
            var m = new Mat3();
            Mat3.mult(m,this,arg);
            return m;
        }else if(arg instanceof Vec2){
            var v = new Vec2();
            Mat3.multVec2(v,this,arg);
            return v;
        }else if(arg instanceof Vec3){
            var v = new Vec3();
            Mat3.multVec3(v,this,arg);
            return v;
        }else{
            throw new Error('Mat3: mult(), cannot multiply with an object of this type:',arg);
        }
    };

    Mat3.setRotation = function(m,angle){
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        Mat3.setId(m);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
    };

    Mat3.rotation = function(angle){
        var m = new Mat3();
        Mat3.setRotation(m,angle);
        return m;
    };

    Mat3.setScale = function(m,scale){
        Mat3.setId(m);
        m.xx = scale.x;
        m.yy = scale.y;
    };

    Mat3.scale    = function(sv){
        var m = new Mat3();
        Mat3.setScale(m,sv);
        return m;
    };

    Mat3.setTranslation = function(m,vec){
        Mat3.setId(m);
        m.xz = vec.x;
        m.yz = vec.y;
    };

    Mat3.translation = function(v){
        var m = new Mat3();
        Mat3.setTranslation(m,v);
        return m;
    };

    Mat3.setTransform = function(m,pos,scale,angle){
        Mat3.setScale(m,scale);
        Mat3.setRotation(tmp_a,angle);
        Mat3.mult(m,tmp_a,m);
        Mat3.setTranslation(tmp_a,pos);
        Mat3.mult(m,tmp_a,m);
        return m;
    };

    Mat3.transform   = function(pos,scale,angle){
        var m = new Mat3();
        Mat3.setTransform(m,pos,scale,angle);
        return m;
    };

    proto.getScale = function(){};
    proto.getRotation = function(){};
    proto.getTranslation = function(){};

    proto.det = function(){
        var m = this;
        return m.xx*(m.zz*m.yy-m.zy*m.yz) - m.yx*(m.zz*m.xy-m.zy*m.xz) + m.zx*(m.yz*m.xy-m.yy*m.xz);
    };

    Mat3.invert  = function(md,m){
        var det = m.det();
        if(!det){
            Mat3.copy(md,Mat3.NaN);
        }
        if(md === m){
            Mat3.copy(tmp_a,m);
            m = tmp_a;
        }

        // http://www.dr-lex.be/random/matrix_inv.html
        // | m.xx m.xy m.xz |               |   m.zz m.yy-m.zy m.yz  -(m.zz m.xy-m.zy m.xz)   m.yz m.xy-m.yy m.xz  |
        // | m.yx m.yy m.yz |    =  1/DET * | -(m.zz m.yx-m.zx m.yz)   m.zz m.xx-m.zx m.xz  -(m.yz m.xx-m.yx m.xz) |
        // | m.zx m.zy m.zz |               |   m.zy m.yx-m.zx m.yy  -(m.zy m.xx-m.zx m.xy)   m.yy m.xx-m.yx m.xy  |
        
        det = 1 / det;

        md.xx =  det*( m.zz*m.yy-m.zy*m.yz );
        md.xy = -det*( m.zz*m.xy-m.zy*m.xz );
        md.xz =  det*( m.yz*m.xy-m.yy*m.xz );
        
        md.yx = -det*( m.zz*m.yx-m.zx*m.yz );
        md.yy =  det*( m.zz*m.xx-m.zx*m.xz );
        md.yz = -det*( m.yz*m.xx-m.yx*m.xz );

        md.zx =  det*( m.zy*m.yx-m.zx*m.yy );
        md.zy = -det*( m.zy*m.xx-m.zx*m.xy );
        md.zz =  det*( m.yy*m.xx-m.yx*m.xy );
    };

    proto.invert = function(){
        var m = new Mat3();
        Mat3.invert(m,this);
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

    var map = [ ['xx','xy','xz'],
                ['yx','yy','yz'],
                ['zx','zy','zz'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

    Mat3.toArray = function(array,m,offset){
        offset = offset || 0;
        // 0 3 6 | xx xy xz
        // 1 4 7 | yx yy yz
        // 2 5 8 | zx zy zz
        array[0+offset] = m.xx;
        array[1+offset] = m.yx;
        array[2+offset] = m.zx;
        array[3+offset] = m.xy;
        array[4+offset] = m.yy;
        array[5+offset] = m.zy;
        array[6+offset] = m.xz;
        array[7+offset] = m.yz;
        array[8+offset] = m.zz;
    };

    proto.array = function(){
        var array = [];
        Mat3.toArray(array,this);
        return array;
    };

    proto.float32 = function(){
        var array = Float32Array(9);
        Mat3.toArray(array,this);
        return array;
    };

})(module);

/* ------------------------------ 4x4 Matrix -------------------------------- */

(function(module){

    var Vec3 = module.Vec3;

    var set = function(md,components_){

        // 1 5 9  13 | xx xy xz xw
        // 2 6 10 14 | yx yy yz yw
        // 3 7 11 15 | zx zy zz zw
        // 4 8 12 16 | wx wy wz ww
        
        md.xx = arguments[1];
        md.yx = arguments[2];
        md.zx = arguments[3];
        md.wx = arguments[4];
        
        md.xy = arguments[5];
        md.yy = arguments[6];
        md.zy = arguments[7];
        md.wy = arguments[8];
        
        md.xz = arguments[9];
        md.yz = arguments[10];
        md.zz = arguments[11];
        md.wz = arguments[12];
        
        md.xw = arguments[13];
        md.yw = arguments[14];
        md.zw = arguments[15];
        md.ww = arguments[16];
    };

    function Mat4(){
        var alen = arguments.length;
        if(alen === 0){
            this.xx = 1;
            this.xy = 0;
            this.xz = 0;
            this.xw = 0;
            this.yx = 0;
            this.yy = 1;
            this.yz = 0;
            this.yw = 0;
            this.zx = 0;
            this.zy = 0;
            this.zz = 1;
            this.zw = 0;
            this.wx = 0;
            this.wy = 0;
            this.wz = 0;
            this.ww = 1;
        }else if(alen === 1){
            var arg = arguments[0];
            if(typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            if(arg[0] !== undefined){
                set(this,arg);
            }else{
                this.xx = arg.xx || 0;
                this.xy = arg.xy || 0;
                this.xz = arg.xz || 0;
                this.xw = arg.xw || 0;
                this.yx = arg.yx || 0;
                this.yy = arg.yy || 0;
                this.yz = arg.yz || 0;
                this.yw = arg.yw || 0;
                this.zx = arg.zx || 0;
                this.zy = arg.zy || 0;
                this.zz = arg.zz || 0;
                this.zw = arg.zw || 0;
                this.wx = arg.wx || 0;
                this.wy = arg.wy || 0;
                this.wz = arg.wz || 0;
                this.ww = arg.ww || 0;
            }
        }else if(alen === 16){
            set(this,arguments);
        }
    };

    var tmp_a = new Mat4();
    var tmp_b = new Mat4();

    module.Mat4 = Mat4;

    Mat4.epsilon  = 0.00000001;    
    Mat4.id       = new Mat4();
    Mat4.zero     = new Mat4(0,0,0,0,
                             0,0,0,0,
                             0,0,0,0,
                             0,0,0,0);
    var nan = Number.NaN;
    Mat4.NaN      = new Mat4(nan,nan,nan,nan,
                             nan,nan,nan,nan,
                             nan,nan,nan,nan,
                             nan,nan,nan,nan);
    Mat4.tmp  = new Mat4();
    Mat4.tmp1 = new Mat4();
    Mat4.tmp2 = new Mat4();

    var proto = Mat4.prototype;

    function epsilonEquals(a,b){  return Math.abs(a-b) <= Mat4.epsilon };

    Mat4.equals  = function(m,n){
        return epsilonEquals(m.xx, n.xx) &&
               epsilonEquals(m.xy, n.xy) &&
               epsilonEquals(m.xz, n.xz) &&
               epsilonEquals(m.xw, n.xw) &&
               epsilonEquals(m.yx, n.yx) &&
               epsilonEquals(m.yy, n.yy) &&
               epsilonEquals(m.yz, n.yz) &&
               epsilonEquals(m.yw, n.yw) &&
               epsilonEquals(m.zx, n.zx) &&
               epsilonEquals(m.zy, n.zy) &&
               epsilonEquals(m.zz, n.zz) &&
               epsilonEquals(m.zw, n.zw) &&
               epsilonEquals(m.wx, n.wx) &&
               epsilonEquals(m.wy, n.wy) &&
               epsilonEquals(m.wz, n.wz) &&
               epsilonEquals(m.ww, n.ww);
    };
        
    proto.equals = function(mat){
        return Mat4.equals(this,mat);
    };

    Mat4.set  = set;

    Mat4.copy = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.xz = m.xz;
        md.xw = m.xw;
        
        md.yx = m.yx;
        md.yy = m.yy;
        md.yz = m.yz;
        md.yw = m.yw;
        
        md.zx = m.zx;
        md.zy = m.zy;
        md.zz = m.zz;
        md.zw = m.zw;
        
        md.wx = m.wx;
        md.wy = m.wy;
        md.wz = m.wz;
        md.ww = m.ww;
    };

    proto.clone = function(){
        var m = new Mat4();
        Mat4.copy(m,this);
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",";
        str += this.xw + ",\n ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",";
        str += this.yw + ",\n ";
        str += this.zx + ",";
        str += this.zy + ",";
        str += this.zz + ",";
        str += this.zw + ",\n ";
        str += this.wx + ",";
        str += this.wy + ",";
        str += this.wz + ",";
        str += this.ww + "]";
        return str;
    };

    Mat4.add = function(md,m,n){
        md.xx = m.xx + n.xx;
        md.xy = m.xy + n.xy;
        md.xz = m.xz + n.xz;
        md.xw = m.xw + n.xw;
        md.yx = m.yx + n.yx;
        md.yy = m.yy + n.yy;
        md.yz = m.yz + n.yz;
        md.yw = m.yw + n.yw;
        md.zx = m.zx + n.zx;
        md.zy = m.zy + n.zy;
        md.zz = m.zz + n.zz;
        md.zw = m.zw + n.zw;
        md.wx = m.wx + n.wx;
        md.wy = m.wy + n.wy;
        md.wz = m.wz + n.wz;
        md.ww = m.ww + n.ww;
    };

    proto.add = function(mat){
        var m = new Mat4();
        Mat4.add(m,this,mat);
        return m;
    };

    Mat4.sub = function(md,m,n){
        md.xx = m.xx - n.xx;
        md.xy = m.xy - n.xy;
        md.xz = m.xz - n.xz;
        md.xw = m.xw - n.xw;
        md.yx = m.yx - n.yx;
        md.yy = m.yy - n.yy;
        md.yz = m.yz - n.yz;
        md.yw = m.yw - n.yw;
        md.zx = m.zx - n.zx;
        md.zy = m.zy - n.zy;
        md.zz = m.zz - n.zz;
        md.zw = m.zw - n.zw;
        md.wx = m.wx - n.wx;
        md.wy = m.wy - n.wy;
        md.wz = m.wz - n.wz;
        md.ww = m.ww - n.ww;
    };

    proto.sub = function(mat){
        var m = new Mat4();
        Mat4.sub(m,this,mat);
        return m;
    };

    Mat4.neg = function(md,m){
        md.xx = -m.xx;
        md.xy = -m.xy;
        md.xz = -m.xz;
        md.xw = -m.xw;
        md.yx = -m.yx;
        md.yy = -m.yy;
        md.yz = -m.yz;
        md.yw = -m.yw;
        md.zx = -m.zx;
        md.zy = -m.zy;
        md.zz = -m.zz;
        md.zw = -m.zw;
        md.wx = -m.wx;
        md.wy = -m.wy;
        md.wz = -m.wz;
        md.ww = -m.ww;
    };

    proto.neg = function(){
        var m = new Mat4();
        Mat4.neg(m,this);
        return m;
    };

    Mat4.tr = function(md,m){
        if(md === m){
            Mat4.copy(tmp_a,m);
            m = tmp_a;
        }
        md.xx = m.xx;
        md.xy = m.yx;
        md.xz = m.zx;
        md.xw = m.wx;
        md.yx = m.xy;
        md.yy = m.yy;
        md.yz = m.zy;
        md.yw = m.wy;
        md.zx = m.xz;
        md.zy = m.yz;
        md.zz = m.zz;
        md.zw = m.wz;
        md.wx = m.xw;
        md.wy = m.yw;
        md.wz = m.zw;
        md.ww = m.ww;
    };

    proto.tr = function(){
        var m = new Mat4();
        Mat4.tr(m,this);
        return m;
    };
    
    Mat4.mult = function(md,a,b){
        if(md === a){
            Mat4.copy(tmp_a,a);
            a = tmp_a;
        }
        if(md === b){
            Mat4.copy(tmp_b,b);
            b = tmp_b;
        }
		md.xx = a.xx * b.xx + a.xy * b.yx + a.xz * b.zx + a.xw * b.wx;
		md.xy = a.xx * b.xy + a.xy * b.yy + a.xz * b.zy + a.xw * b.wy;
		md.xz = a.xx * b.xz + a.xy * b.yz + a.xz * b.zz + a.xw * b.wz;
		md.xw = a.xx * b.xw + a.xy * b.yw + a.xz * b.zw + a.xw * b.ww;

		md.yx = a.yx * b.xx + a.yy * b.yx + a.yz * b.zx + a.yw * b.wx;
		md.yy = a.yx * b.xy + a.yy * b.yy + a.yz * b.zy + a.yw * b.wy;
		md.yz = a.yx * b.xz + a.yy * b.yz + a.yz * b.zz + a.yw * b.wz;
		md.yw = a.yx * b.xw + a.yy * b.yw + a.yz * b.zw + a.yw * b.ww;

		md.zx = a.zx * b.xx + a.zy * b.yx + a.zz * b.zx + a.zw * b.wx;
		md.zy = a.zx * b.xy + a.zy * b.yy + a.zz * b.zy + a.zw * b.wy;
		md.zz = a.zx * b.xz + a.zy * b.yz + a.zz * b.zz + a.zw * b.wz;
		md.zw = a.zx * b.xw + a.zy * b.yw + a.zz * b.zw + a.zw * b.ww;

		md.wx = a.wx * b.xx + a.wy * b.yx + a.wz * b.zx + a.ww * b.wx;
		md.wy = a.wx * b.xy + a.wy * b.yy + a.wz * b.zy + a.ww * b.wy;
		md.wz = a.wx * b.xz + a.wy * b.yz + a.wz * b.zz + a.ww * b.wz;
		md.ww = a.wx * b.xw + a.wy * b.yw + a.wz * b.zw + a.ww * b.ww;
    };

    Mat4.multFac  = function(md,m,fac){
        md.xx = m.xx * fac;
        md.xy = m.xy * fac;
        md.xz = m.xz * fac;
        md.xw = m.xw * fac;
        md.yx = m.yx * fac;
        md.yy = m.yy * fac;
        md.yz = m.yz * fac;
        md.yw = m.yw * fac;
        md.zx = m.zx * fac;
        md.zy = m.zy * fac;
        md.zz = m.zz * fac;
        md.zw = m.zw * fac;
        md.wx = m.wx * fac;
        md.wy = m.wy * fac;
        md.wz = m.wz * fac;
        md.ww = m.ww * fac;
    };

    Mat4.multVec3 = function(vd,m,v){
        var vx = v.x, vy = v.y, vz = v.z;
        var  d = 1.0 / ( m.wx * vx + m.wy * vy + m.wz * vz + m.ww);
        vd.x = ( m.xx * vx + m.xy * vy + m.xz * vz + m.xw  ) * d;
        vd.y = ( m.yx * vx + m.yy * vy + m.yz * vz + m.yw  ) * d;
        vd.z = ( m.zx * vx + m.zy * vy + m.zz * vz + m.zw  ) * d;
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var m = new Mat4();
            Mat4.multFac(m,this,arg);
            return m;
        }else if(arg instanceof Mat4){
            var m = new Mat4();
            Mat4.mult(m,this,arg);
            return m;
        }else if(arg instanceof Vec3){
            var v = new Vec3();
            Mat4.multVec3(v,this,arg);
            return v;
        }
    };

    Mat4.det = function(m){
		return (
			m.xw * m.yz * m.zy * m.wx-
			m.xz * m.yw * m.zy * m.wx-
			m.xw * m.yy * m.zz * m.wx+
			m.xy * m.yw * m.zz * m.wx+

			m.xz * m.yy * m.zw * m.wx-
			m.xy * m.yz * m.zw * m.wx-
			m.xw * m.yz * m.zx * m.wy+
			m.xz * m.yw * m.zx * m.wy+

			m.xw * m.yx * m.zz * m.wy-
			m.xx * m.yw * m.zz * m.wy-
			m.xz * m.yx * m.zw * m.wy+
			m.xx * m.yz * m.zw * m.wy+

			m.xw * m.yy * m.zx * m.wz-
			m.xy * m.yw * m.zx * m.wz-
			m.xw * m.yx * m.zy * m.wz+
			m.xx * m.yw * m.zy * m.wz+

			m.xy * m.yx * m.zw * m.wz-
			m.xx * m.yy * m.zw * m.wz-
			m.xz * m.yy * m.zx * m.ww+
			m.xy * m.yz * m.zx * m.ww+

			m.xz * m.yx * m.zy * m.ww-
			m.xx * m.yz * m.zy * m.ww-
			m.xy * m.yx * m.zz * m.ww+
			m.xx * m.yy * m.zz * m.ww
		);
    };
    proto.det = function(){
        return Mat4.det(this);
    }

    Mat4.invert  = function(md,m){
        var det = Mat4.det(m);
        if(!det){
            Mat4.copy(md,Mat4.NaN);
        }
        if(md === m){
            Mat4.copy(tmp_a,m);
            m = tmp_a;
        }
        det = 1 / det;
		md.xx = ( m.yz*m.zw*m.wy - m.yw*m.zz*m.wy + m.yw*m.zy*m.wz - m.yy*m.zw*m.wz - m.yz*m.zy*m.ww + m.yy*m.zz*m.ww ) * det;
		md.xy = ( m.xw*m.zz*m.wy - m.xz*m.zw*m.wy - m.xw*m.zy*m.wz + m.xy*m.zw*m.wz + m.xz*m.zy*m.ww - m.xy*m.zz*m.ww ) * det;
		md.xz = ( m.xz*m.yw*m.wy - m.xw*m.yz*m.wy + m.xw*m.yy*m.wz - m.xy*m.yw*m.wz - m.xz*m.yy*m.ww + m.xy*m.yz*m.ww ) * det;
		md.xw = ( m.xw*m.yz*m.zy - m.xz*m.yw*m.zy - m.xw*m.yy*m.zz + m.xy*m.yw*m.zz + m.xz*m.yy*m.zw - m.xy*m.yz*m.zw ) * det;
		md.yx = ( m.yw*m.zz*m.wx - m.yz*m.zw*m.wx - m.yw*m.zx*m.wz + m.yx*m.zw*m.wz + m.yz*m.zx*m.ww - m.yx*m.zz*m.ww ) * det;
		md.yy = ( m.xz*m.zw*m.wx - m.xw*m.zz*m.wx + m.xw*m.zx*m.wz - m.xx*m.zw*m.wz - m.xz*m.zx*m.ww + m.xx*m.zz*m.ww ) * det;
		md.yz = ( m.xw*m.yz*m.wx - m.xz*m.yw*m.wx - m.xw*m.yx*m.wz + m.xx*m.yw*m.wz + m.xz*m.yx*m.ww - m.xx*m.yz*m.ww ) * det;
		md.yw = ( m.xz*m.yw*m.zx - m.xw*m.yz*m.zx + m.xw*m.yx*m.zz - m.xx*m.yw*m.zz - m.xz*m.yx*m.zw + m.xx*m.yz*m.zw ) * det;
		md.zx = ( m.yy*m.zw*m.wx - m.yw*m.zy*m.wx + m.yw*m.zx*m.wy - m.yx*m.zw*m.wy - m.yy*m.zx*m.ww + m.yx*m.zy*m.ww ) * det;
		md.zy = ( m.xw*m.zy*m.wx - m.xy*m.zw*m.wx - m.xw*m.zx*m.wy + m.xx*m.zw*m.wy + m.xy*m.zx*m.ww - m.xx*m.zy*m.ww ) * det;
		md.zz = ( m.xy*m.yw*m.wx - m.xw*m.yy*m.wx + m.xw*m.yx*m.wy - m.xx*m.yw*m.wy - m.xy*m.yx*m.ww + m.xx*m.yy*m.ww ) * det;
		md.zw = ( m.xw*m.yy*m.zx - m.xy*m.yw*m.zx - m.xw*m.yx*m.zy + m.xx*m.yw*m.zy + m.xy*m.yx*m.zw - m.xx*m.yy*m.zw ) * det;
		md.wx = ( m.yz*m.zy*m.wx - m.yy*m.zz*m.wx - m.yz*m.zx*m.wy + m.yx*m.zz*m.wy + m.yy*m.zx*m.wz - m.yx*m.zy*m.wz ) * det;
		md.wy = ( m.xy*m.zz*m.wx - m.xz*m.zy*m.wx + m.xz*m.zx*m.wy - m.xx*m.zz*m.wy - m.xy*m.zx*m.wz + m.xx*m.zy*m.wz ) * det;
		md.wz = ( m.xz*m.yy*m.wx - m.xy*m.yz*m.wx - m.xz*m.yx*m.wy + m.xx*m.yz*m.wy + m.xy*m.yx*m.wz - m.xx*m.yy*m.wz ) * det;
		md.ww = ( m.xy*m.yz*m.zx - m.xz*m.yy*m.zx + m.xz*m.yx*m.zy - m.xx*m.yz*m.zy - m.xy*m.yx*m.zz + m.xx*m.yy*m.zz ) * det;
    };

    proto.invert = function(){
        var m = new Mat4();
        Mat4.invert(m,this);
        return m;
    };

    var map = [ ['xx','xy','xz','xw'],
                ['yx','yy','yz','yw'],
                ['zx','zy','zz','zw'],
                ['wx','wy','wz','ww'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

    Mat4.setId = function(md){
        Mat4.copy(md,Mat4.id);
    };

    Mat4.setRotationX = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.yy = c;
        m.yz = -s;
        m.zy = s;
        m.zz = c;
    };

    Mat4.rotationX = function(angle){
        var m = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.yy = c;
        m.yz = -s;
        m.zy = s;
        m.zz = c;
        return m;

    };
    Mat4.setRotationY = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xz = s;
        m.zx = -s;
        m.zz = c;
    };
    Mat4.rotationY = function(angle){
        var m = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xz = s;
        m.zx = -s;
        m.zz = c;
        return m;
    };
    Mat4.setRotationZ = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
    };

    Mat4.rotationZ = function(angle){
        var m = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
        return m;
    };

    Mat4.rotationEuler  = function(md,X,Y,Z){
        Mat4.setRotationZ(tmp_a,Z);
        Mat4.setRotationY(tmp_b,Y);
        Mat4.mult(md,tmp_a,tmp_b);
        Mat4.setRotationX(tmp_a,X);
        Mat4.mult(md,md,tmp_a);
    };
    
    Mat4.rotationEuler = function(X,Y,Z){
        var m = new Mat4();
        Mat4.setRotationEuler(m,X,Y,Z);
        return m;
    };
    
    Mat4.getEulerAngles = function(vd,m){
        vd.x = Math.atan2(m.zy,mzz);
        vd.y = Math.atan2(-m.zx,Math.sqrt(m.zy*m.zy+m.zz*m.zz));
        vd.z = Math.atan2(m.yx,m.xx);
    };
    
    proto.getEulerAngles = function(){
        var v = new Vec3();
        Mat4.getEulerAngles(v,this);
        return v;
    };

    Mat4.setRotationAxis  = function(md,vec,angle){
        Mat4.setId(md);
        var u = vec;
        var c = Math.cos(angle);
        var nc = (1-c);
        var s = Math.sin(angle);

        md.xx = c + u.x*u.x*nc;
        md.xy = u.x*u.y*nc - u.z*s;
        md.xz = u.x*u.z*nc + u.y*s;
        
        md.yx = u.y*u.x*nc + u.z*s;
        md.yy = c + u.y*u.y*nc;
        md.yz = u.y*u.z*nc - u.x*s;

        md.zx = u.z*u.x*nc - u.y*s;
        md.zy = u.z*u.y*nc + u.x*s;
        md.zz = c + u.z*u.z*nc;
    };

    Mat4.rotationAxis = function(vec,angle){
        var m = new Mat4();
        Mat4.setRotationAxis(m,vec,angle);
        return m;
    };
    
    Mat4.setRotationQuat = function(md,q){
        Mat4.setId(md);
        var x = q.x, y = q.y, z = q.z, w = q.w;
        md.xx = 1 - 2*y*y - 2*z*z;
        md.xy = 2*x*y - 2*w*z;
        md.xz = 2*x*z + 2*w*y;
        md.yx = 2*x*y + 2*w*z;
        md.yy = 1 - 2*x*x - 2*z*z;
        md.yz = 2*y*z + 2*w*x;
        md.zx = 2*x*z - 2*w*y;
        md.zy = 2*y*z - 2*w*x;
        md.zz = 1 - 2*x*x - 2*y*y;
    };

    Mat4.rotationQuat = function(q){
        var m = new Mat4();
        Mat4.setRotationQuat(m,q);
        return m;
    };

    Mat4.setScale   = function(md,sv){
        Mat4.setId(md);
        md.xx = sv.x;
        md.yy = sv.y;
        md.zz = sv.z;
    };
    Mat4.scale    = function(sv){
        var m = new Mat4();
        m.xx = sv.x;
        m.yy = sv.y;
        m.zz = sv.z;
        return m;
    };
    Mat4.setTranslation = function(md,v){
        md.xw = v.x;
        md.yw = v.y;
        md.zw = v.z;
    };

    Mat4.translation = function(v){
        var m = new Mat4();
        Mat4.setTranslation(m,v);
        return m;
    };

    proto.getScale = function(){
    };
    proto.getRotation = function(){};
    proto.getTranslation = function(){
        return new Vec3(this.xw,this.yw,this.zw);
    };

    Mat4.toArray = function(array,m,offset){
        offset = offset || 0;

        // 0 4 8  12 | xx xy xz xw
        // 1 5 9  13 | yx yy yz yw
        // 2 6 10 14 | zx zy zz zw
        // 3 7 11 15 | wx wy wz ww

        array[0 +offset] = m.xx;
        array[1 +offset] = m.yx;
        array[2 +offset] = m.zx;
        array[3 +offset] = m.wx;
        array[4 +offset] = m.xy;
        array[5 +offset] = m.yy;
        array[6 +offset] = m.zy;
        array[7 +offset] = m.wy;
        array[8 +offset] = m.xz;
        array[9 +offset] = m.yz;
        array[10+offset] = m.zz;
        array[11+offset] = m.wz;
        array[12+offset] = m.xw;
        array[13+offset] = m.yw;
        array[14+offset] = m.zw;
        array[15+offset] = m.ww;
    };

    proto.array = function(){
        var array = [];
        Mat4.toArray(array,this);
        return array;
    };

    proto.float32 = function(){
        var array = Float32Array(16);
        Mat4.toArray(array,this);
        return array;
    };

})(module);

/* ------------------------------ Quaternions -------------------------------- */

(function(module){

    var Vec3 = module.Vec3;

    function Quat(){
        var alen = arguments.length;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        if(alen){
            if(alen === 4){
                this.x = arguments[0];
                this.y = arguments[1];
                this.z = arguments[2];
                this.w = arguments[3];
            }else if(arguments.length === 2){
                Quat.setRotationAxis(arguments[0],arguments[1]);
            }
        }
    };

    module.Quat = Quat;
    var proto = Quat.prototype;

    Quat.id   = new Quat();
    
    Quat.copy = function(qd,q){
        qd.x = q.x;
        qd.y = q.y;
        qd.z = q.z;
        qd.w = q.w;
    };

    Quat.set = function(qd,components_){
        qd.x = arguments[1];
        qd.y = arguments[2];
        qd.z = arguments[3];
        qd.w = arguments[4];
    };

    proto.clone = function(){
        var q = new Quat();
        Quat.copy(q,this);
        return q;
    };

    proto.toString = function(){
        var str = "[";
        str += this.x ;
        str += "," ;
        str += this.y ;
        str += "," ;
        str += this.z ;
        str += "," ;
        str += this.w ;
        str += "]" ;
        return str;
    };

    Quat.mult = function(qd,q,r){
        qd.w = q.w*r.w - q.x*r.x - q.y*r.y - q.z*r.z;
        qd.x = q.w*r.x + q.x*r.w + q.y*r.z - q.z*r.y;
        qd.y = q.w*r.y - q.x*r.z + q.y*r.w + q.z*r.x;
        qd.z = q.w*r.z + q.x*r.y - q.y*r.x + q.z*r.w;
    };


    proto.mult = function(q){
        var qd = new Quat();
        Quat.mult(qd,this,q);
        return qd;
    };

    Quat.neg = function(qd,q){
        qd.x = -q.x;
        qd.y = -q.y;
        qd.z = -q.z;
        qd.w =  q.w;
    };

    proto.neg = function(){
        var qd = new Quat();
        Quat.neg(qd,this);
        return qd;
    };


    Quat.lerp = function(qd,q,r,t){
        var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        var rx = r.x, ry = r.y, rz = r.z, rw = r.w;
        var it = 1 - t;
        qd.x = it*qx + it*rx;
        qd.y = it*qy + it*ry;
        qd.z = it*qz + it*rz;
        qd.w = it*qw + it*rw;
        Quat.normalize(qd,qd);
    };

    proto.lerp = function(q,t){
        var qd = new Quat();
        Quat.lerp(qd,this,q,t);
        return qd;
    };
        

    proto.len = function(){
        return Math.sqrt(
                this.x*this.x + 
                this.y*this.y + 
                this.z*this.z + 
                this.w*this.w);
    };

    Quat.normalize = function(qd,q){
        var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        var ilen = 1.0 / Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
        qd.x = qx * ilen;
        qd.y = qy * ilen;
        qd.z = qz * ilen;
        qd.w = qw * ilen;
    };

    proto.normalize = function(){
        var q = new Quat();
        Quat.normalize(q,this);
        return q;
    };

    Quat.setRotationAxis = function(qd,vec,angle){
        var s = Math.sin(angle*0.5);
        qd.w = Math.cos(angle*0.5);
        qd.x = vec.x * s;
        qd.y = vec.y * s;
        qd.z = vec.y * s;
    };

    Quat.setRotationX = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = Math.sin(angle*0.5);
        qd.y = 0;
        qd.z = 0;
    };

    Quat.setRotationY = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = Math.sin(angle*0.5);
        qd.z = 0;
    };

    Quat.setRotationZ = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = 0;
        qd.z = Math.sin(angle*0.5);
    };

    Quat.rotationAxis = function(vec,angle){
        var q = new Quat();
        Quat.setRotationAxis(q,vec,angle);
        return q;
    };

})(module);
