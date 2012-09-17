var module = window;

/* --------- 2D Vectors ---------- */

(function(module){
    
    function Vec2(){
    	var alen = arguments.length;      
    	if(alen=== 0){
            this.x = 0;
            this.y = 0;
        }else if (alen === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                this.x = arg;
                this.y = arg;
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
    
    // sets vd to a vector of length 'len' and angle 'angle' radians
    Vec2.polar = function(len,angle){
    	var v = new Vec2(len,0);
        Vec2.rotate(v,v,angle);
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
        return Number.isNan(v.x) || Number.isNaN(v.y);
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

/* -------------- 2D Matrixes -------------- */

(function(module){

    var Vec2 = module.Vec2;
    
    function Mat2(){

        //   | xx xy |
        //   | yx yy |
        
        this.xx = 1;
        this.xy = 0;
        this.yx = 0;
        this.yy = 1;

        if (arguments.length === 1){
            var arg = arguments[0];

            this.xx = arg.xx || this.xx;
            this.xy = arg.xy || this.xy;
            this.yx = arg.yx || this.yx;
            this.yy = arg.yy || this.yy;

        } else if (arguments.length === 4){
            this.xx = arguments[0];
            this.xy = arguments[1];
            this.yx = arguments[2];
            this.yy = arguments[3];
        }
    }

    module.Mat2 = Mat2;

    var proto = Mat2.prototype;

    Mat2.epsilon  = 0.00000001;
    Mat2.NaN      = new Mat2(Number.NaN, Number.NaN, Number.NaN, Number.NaN);
    Mat2.id       = new Mat2();
    Mat2.zero     = new Mat2(0,0,0,0);

    function epsilonEquals(a,b){ return Math.abs(a-b) <= Mat2.epsilon; }

    Mat2.equals  = function(m,n){
        return  epsilonEquals(m.xx, n.xx) &&
                epsilonEquals(m.xy, n.xy) &&
                epsilonEquals(m.yx, n.yx) &&
                epsilonEquals(m.yy, n.yy);
    };
    proto.equals = function(mat){
        return Mat2.equals(this,mat);
    };
    
    Mat2.copy   = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.yx = m.yx;
        md.yy = m.yy;
    };

    proto.clone = function(){
        var m = new Mat2();
        Mat2.copy(m,this);
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx;
        str += ",";
        str += this.xy;
        str += ",\n ";
        str += this.yx;
        str += ",";
        str += this.yy;
        str += "]";
        return str;
    };
    
    Mat2.scale = function(md,m,fac){
        md.xx = m.xx * fac;
        md.xy = m.xy * fac;
        md.yx = m.yx * fac;
        md.yy = m.yy * fac;
    };

    proto.scale = function(fac){
        var m = new Mat2();
        Mat2.scale(m,this,fac);
        return m;
    };

    Mat2.add = function(md,m,n){
        md.xx = m.xx + n.xx;
        md.xy = m.xy + n.xy;
        md.yx = m.yx + n.yx;
        md.yy = m.yy + n.yy;
    };

    proto.add = function(mat){
        var m = new Mat2();
        Mat2.add(m,this,mat);
        return m;
    };

    Mat2.sub = function(md,m,n){
        md.xx = m.xx - n.xx;
        md.xy = m.xy - n.xy;
        md.yx = m.yx - n.yx;
        md.yy = m.yy - n.yy;
    };

    proto.sub = function(mat){
        var m = new Mat2();
        Mat2.sub(m,this,mat);
        return m;
    };

    Mat2.neg = function(md,m){
        md.xx = -m.xx;
        md.xy = -m.xy;
        md.yx = -m.yx;
        md.yy = -m.yy;
    };
    
    proto.neg = function(){
        var m = new Mat2();
        Mat2.neg(m,this);
        return m;
    };

    Mat2.mult  = function(md,m,n){
        md.xx = m.xx * n.xx + m.xy * n.yx;
        md.xy = m.xx * n.xy + m.xy * n.yy;
        md.yx = m.yx * n.xx + m.yy * n.yx;
        md.yy = m.yx * n.xy + m.yy * n.yy;
    };

    proto.mult = function(mat){
        var m = new Mat2();
        Mat2.mult(m,this,mat);
        return m;
    };

    Mat2.multVec2 = function(vd,m,v){
        vd.x = m.xx * v.x + m.xy * v.y;
        vd.y = m.yx * v.x + m.yy * v.y;
    };

    proto.multVec2 = function(vec){
        var v = new Vec2();
        Mat2.multVec2(v,this,vec);
        return v;
    };

    Mat2.det = function(m){
        return m.xx * m.yy - m.xy * m.yx;
    };

    proto.det = function(){
        return this.xx * this.yy - this.xy * this.yx;
    };

    Mat2.invert = function(md,m){
        var det = Mat2.det(m);
        if(det){
            md.xx = det *  m.yy;
            md.xy = det * -m.xy;
            md.yx = det * -m.yx;
            md.yy = det *  m.xx;
        }else{
            Mat2.copy(md,Mat2.NaN);
        }
    };

    proto.invert = function(){
        var m = new Mat2();
        Mat2.invert(m,this);
        return m;
    };

    Mat2.rotation = function(angle){
        var m = new Mat2();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
        return m;
    };

    proto.row = function(index){
        if(index === 0){
            return new Vec2(this.xx, this.xy);
        }else if(index === 1){
            return new Vec2(this.yx, this.yy);
        }
    };

    proto.col = function(index){
        if(index === 0){
            return new Vec2(this.xx, this.yx);
        }else if(index === 1){
            return new Vec2(this.xy, this.yy);
        }
    };

    proto.array = function(){
        return [this.xx, this.xy, this.yx, this.yy];
    };

})(module);

/* ----------------------- 2D Homogenous Matrixes ------------------------ */

(function(module){

    var Vec2 = module.Vec2;
    
    function Mat2h(){

        //   | xx xy xz|    | xx xy xz|
        //   | yx yy yz|        | yx yy yz|
        //   | 0  0  1 |        | zx zy zz|
        this.xx = 1;
        this.xy = 0;
        this.yx = 0;
        this.yy = 1;
        this.xz = 0;
        this.yz = 0;

        if (arguments.length === 1){
            var arg = arguments[0];
            if(arg instanceof Mat2h){
                this.xx = arg.xx === undefined ? this.xx : arg.xx;
                this.xy = arg.xy === undefined ? this.xy : arg.xy;
                this.yx = arg.yx === undefined ? this.yx : arg.yx;
                this.yy = arg.yy === undefined ? this.yy : arg.yy;
                this.xz = arg.xz === undefined ? this.xz : arg.xz;
                this.yz = arg.yz === undefined ? this.yz : arg.yz;
            }else{
                if(arg.rotation){
                    Mat2h.setRotation(this,arg.rotation);
                }else if(arg.rotationDeg){
                    Mat2h.setRotation(this,arg.rotationDeg * modula.degToRad);
                }
                if(typeof arg.scale === 'number'){
                    this.xx *= arg.scale;
                    this.yy *= arg.scale;
                }else if(arg.scale instanceof Vec2){
                    this.xx *= arg.scale.x;
                    this.yy *= arg.scale.y;
                }
                if(arg.pos){
                    this.xz  = arg.pos.x;
                    this.yz  = arg.pos.y;
                }
            }
        } else if (arguments.length === 4){
            this.xx = arguments[0];
            this.xy = arguments[1];
            this.yx = arguments[2];
            this.yy = arguments[3];
            this.xz = arguments[4];
            this.yz = arguments[5];
        }
    }

    module.Mat2h = Mat2h;

    var proto  = Mat2h.prototype;

    Mat2h.epsilon  = 0.00000001;
    Mat2h.NaN      = new Mat2h(Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN);
    Mat2h.id       = new Mat2h();

    function epsilonEquals(a,b){ return Math.abs(a-b) <= Mat2h.epsilon; }

    Mat2h.equals = function(m,n){
        return  epsilonEquals(m.xx, n.xx) &&
                epsilonEquals(m.xy, n.xy) &&
                epsilonEquals(m.yx, n.yx) &&
                epsilonEquals(m.xz, n.xz) &&
                epsilonEquals(m.yz, n.yz) &&
                epsilonEquals(m.yy, n.yy);
    };
    proto.equals = function(mat){
        return Mat2h.equals(this,mat);
    };
    
    Mat2h.copy = function(md,m){
        md.xx = m.xx;
        md.xy = m.xy;
        md.yx = m.yx;
        md.yy = m.yy;
        md.xz = m.xz;
        md.yz = m.yz;
    };

    proto.clone = function(){
        var m = new Mat2h();
        Mat2h.copy(m,this);
        return m;
    };

    proto.toString = function(){
        var str = "[";
        str += this.xx + ",";
        str += this.xy + ",";
        str += this.xz + ",\n ";
        str += this.yx + ",";
        str += this.yy + ",";
        str += this.yz + ",\n 0,0,1]";
        return str;
    };
    
    Mat2h.scale = function(md,m,fac){
        md.xx = m.xx * fac;
        md.xy = m.xy * fac;
        md.yx = m.yx * fac;
        md.yy = m.yy * fac;
        md.xz = m.xz * fac;
        md.yz = m.yz * fac;
    };

    proto.scale = function(fac){
        var m = new Mat2h();
        Mat2h.scale(m,this,fac);
        return m;
    };

    Mat2h.add = function(md,m,n){
        md.xx = m.xx + n.xx;
        md.xy = m.xy + n.xy;
        md.yx = m.yx + n.yx;
        md.yy = m.yy + n.yy;
        md.xz = m.xz + n.xz;
        md.yz = m.yz + n.yz;
    };

    proto.add = function(mat){
        var m = new Mat2h();
        Mat2h.add(m,this,mat);
        return m;
    };

    Mat2h.sub = function(md,m,n){
        md.xx = m.xx - n.xx;
        md.xy = m.xy - n.xy;
        md.yx = m.yx - n.yx;
        md.yy = m.yy - n.yy;
        md.xz = m.xz - n.xz;
        md.yz = m.yz - n.yz;
    };

    proto.sub = function(mat){
        var m = this.clone();
        Mat2h.sub(m,this,mat);
        return m;
    };

    Mat2h.neg = function(md,m){
        md.xx = -m.xx;
        md.xy = -m.xy;
        md.yx = -m.yx;
        md.yy = -m.yy;
        md.xz = -m.xz;
        md.yz = -m.yz;
    };

    proto.neg = function(){
        var m = new Mat2h();
        Mat2h.neg(m,this);
        return m;
    };

    Mat2h.mult = function(dst,a,b){
        // xx xy xz   xx xy xz
        // yx yy yz * yx yy yz
        // zx zy zz   zx zy zz

        dst.xx = a.xx * b.xx + a.xy * b.yx;
        dst.xy = a.xx * b.xy + a.xy * b.yy;
        dst.yx = a.yx * b.xx + a.yy * b.yx;
        dst.yy = a.yx * b.xy + a.yy * b.yy;
        dst.xz = a.xx * b.xz + a.xy * b.yz + a.xz;
        dst.yz = a.yx * b.xz + a.yy * b.yz + a.yz;
        return dst;
    };
    proto.mult = function(mat){
        var m = new Mat2h();
        Mat2h.mult(m,this,mat);
        return m;
    };
    Mat2h.multVec2 = function(dst,m,vec){
        // xx xy xz   x 
        // yx yy yz * y 
        // 0  0  1    1 
        dst.x = m.xx * vec.x + m.xy * vec.y + m.xz;
        dst.y = m.yx * vec.x + m.yy * vec.y + m.yz;
        return dst;
    };

    proto.multVec2 = function(vec){
        var dst = new Vec2();
        Mat2h.multVec2(dst,this,vec);
        return dst;
    };

    Mat2h.det = function(m){
        return m.xx * m.yy - m.yx * m.xy;
    };

    proto.det = function(){
        return this.xx * this.yy - this.yx * this.xy;
    };

    Mat2h.invert = function(md,m){
        var det = Mat2h.det(m);
        if(det){
            det = 1.0 / det;
            md.xx = det *  m.yy;
            md.xy = det * -m.xy;
            md.yx = det * -m.yx;
            md.yy = det *  m.xx;
            md.xz = det *  m.yz * m.xy - m.yy * m.xz;
            md.yz = det * -( m.yz * m.xx - m.yx * m.xz );
        }else{
            Mat2h.copy(md,Mat2h.NaN);
        }
    };

    proto.invert = function(){
        var m = new Mat2h();
        Mat2h.invert(m,this);
        return m;
    };

    Mat2h.setRotation = function(m,angle){
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        m.xx = c;
        m.xy = -s;
        m.yx = s;
        m.yy = c;
        m.xz = 0;
        m.yz = 0;
        return m;
    };

    Mat2h.setScale = function(m,scale){
        m.xx = scale.x;
        m.xy = 0;
        m.yx = 0;
        m.yy = scale.y;
        m.xz = 0;
        m.yz = 0;
        return m;
    };

    Mat2h.setTranslation = function(m,vec){
        m.xx = 1;
        m.xy = 0;
        m.yx = 0;
        m.yy = 1;
        m.xz = vec.x;
        m.yz = vec.y;
        return m;
    };

    Mat2h.transform = function(scale,rotation,translation){
        var m = new Mat2h();
        if(rotation){
            Mat2h.setRotation(m,rotation);
        }
        m.xx *= scale.x;
        m.yy *= scale.y;
        m.xz  = translation.x;
        m.yz  = translation.y;
        return m;
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

    Vec3.scale = function(vd,v){
        vd.x = -v.x;
        vd.y = -v.y;
        vd.z = -v.z;
    };

    proto.neg = function(){
        return new Vec3(-this.x, - this.y, - this.z);
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
        Vec3.setLen(vd,v,Vec3.dot(u,v));
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
        var dot2 = Vec3.dot(v,vn) * 2;
        vd.x = v.x - vn.x * dot2;
        vd.y = v.y - vn.y * dot2;
        vd.z = v.z - vn.z * dot2;
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

/* ------------------------------ 3D Matrix -------------------------------- */

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

    Mat3.epsilon  = 0.00000001;    
    Mat3.id       = new Mat3();
    Mat3.zero     = new Mat3(0,0,0,0,0,0,0,0,0);

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

    proto.clone = function(){
        return new Mat3(this);
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
    
    Mat3.scale  = function(md,m,fac){
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

    proto.scale = function(fac){
        var m = new Mat3();
        Mat3.scale(m,this,fac);
        return m;
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

    Mat3.mult = function(dst,a,b){
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
        Mat3.mult(m,this,mat);
        return m;
    };

    Mat3.multVec3 = function(vd,m,v){
        vd.x = m.xx * v.x + m.xy * v.y + m.xz * v.z;
        vd.y = m.yx * v.x + m.yy * v.y + m.yz * v.z;
        vd.z = m.zx * v.x + m.zy * v.y + m.zz * v.z;
    };

    proto.multVec3 = function(v){
        var vd = new Vec3();
        Mat3.multVec3(vd,this,v);
        return vd;
    };

    Mat3.multVec2 = function(vd,m,v){
    };

    proto.multVec2 = function(v){
        var vd = new Vec2();
        Mat3.multVec2(vd,this,v);
        return vd;
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

    Mat3.rotation = function(anglex,angley,anglez){ //FIXME
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

    Mat3.invert  = function(md,m){
        var det = m.det();
        if(!det){
            Mat3.copy(md,Mat3.NaN);
        }
        det = 1 / det;

        md.xx =  det*( m.zz*m.yy-m.zx*m.yz );
        md.xy = -det*( m.zz*m.xy-m.zx*m.xz );
        md.xz =  det*( m.yz*m.xy-m.yy*m.xz );
        
        md.yx = -det*( m.zz*m.yx-m.zx*m.yz );
        md.yy =  det*( m.zz*m.xx-m.zx*m.xz );
        md.yz = -det*( m.yz*m.xx-m.yx*m.xz );

        md.zx =  det*( m.zy*m.yx-m.zx*m.yy );
        md.zy = -det*( m.zy*m.xx-m.zx*m.xy );
        md.yy =  det*( m.yy*m.xx-m.yz*m.xy );
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

})(module);
