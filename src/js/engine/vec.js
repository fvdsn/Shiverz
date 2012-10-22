var exports = typeof exports !== 'undefined' && this.exports !== exports ? exports : window;

/* ------------------------------ 2D Vectors -------------------------------- */

(function(exports){
    
    function V2(){
        var self = this;
        if(this.constructor !== V2){
            self = new V2();
        }
    	var alen = arguments.length;      
    	if(alen === 0){
            self.x = 0.0;
            self.y = 0.0;
        }else if (alen === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                self.x = arg;
                self.y = arg;
            }else if(typeof arg.angle === 'number' || typeof arg.len === 'number'){
                console.log('polar form activated');
                console.log(arg);
                V2.setPolar(self, (arg.len === undefined ? 1 : arg.len), arg.angle || 0);
            }else if(arg[0] !== undefined){
                self.x = arg[0] || 0;
                self.y = arg[1] || 0;
            }else{
            	self.x = arg.x || 0;
            	self.y = arg.y || 0;
            }
        }else if (alen === 2){
            self.x = arguments[0];
            self.y = arguments[1];
        }else{
            throw new Error("wrong number of arguments:"+arguments.length);
        }
        return self;
    }

    exports.V2 = V2;

    var proto = V2.prototype;
    
    V2.zero     = new V2();
    V2.x        = new V2(1,0);
    V2.y        = new V2(0,1);
    V2.epsilon  = 0.00000001;
    V2.tmp      = new V2();
    V2.tmp1     = new V2();
    V2.tmp2     = new V2();

    var tmp       = new V2();
    var tmp1      = new V2();
    var tmp2      = new V2();
    var nan       = Number.NaN;
    
    // sets vd to a vector of length 'len' and angle 'angle' radians
    V2.setPolar = function(vd,len,angle){
    	vd.x = len;
        vd.y = 0;
        V2.rotate(vd,angle);
        return vd;
    };

    V2.polar = function(len,angle){
        var v = new V2();
        V2.setPolar(v,len,angle);
        return v;
    };

	V2.random = function(){
		return new V2(Math.random()*2 - 1, Math.random()*2 - 1);
	}

    V2.randomPositive = function(){
        return new V2(Math.random(),Math.random());
    };

    V2.randomDisc = function(){
    	var v = new V2();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    V2.isZero  = function(v){
        return v.x === 0 && v.y === 0;
    };

    proto.isZero = function(){
        return this.x === 0 && this.y === 0;
    };

    V2.isNaN = function(v){
        return Number.isNaN(v.x) || Number.isNaN(v.y);
    };

    proto.isNaN = function(){
        return V2.isNaN(this);
    };


    V2.len = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y);
    };

    proto.len = function(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    V2.lenSq = function(v){
        return v.x*v.x + v.y*v.y;
    };
    
    proto.lenSq = function(){
        return this.x*this.x + this.y*this.y;
    };
    
    V2.dist = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return Math.sqrt(dx*dx + dy*dy);
    };

    proto.dist = function(v){
        return V2.dist(this,v);
    };
    
    V2.distSq = function(v1,v2){
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        return dx*dx + dy*dy;
    };

    proto.distSq = function(v){
        return V2.distSq(this,v);
    };
    
    V2.dot = function(v1,v2){
        return v1.x*v2.x + v2.y*v2.y;
    }

    proto.dot = function(v){
        return this.x*v.x + this.y*v.y;
    };
    
    V2.set  = function(vd,vx,vy){
        vd.x = vx;
        vd.y = vy;
        return vd;
    };
    
    V2.setArray = function(vd,array,offset){
        offset = offset || 0;
        vd.x = array[offset];
        vd.y = array[offset+1];
        return vd;
    };


    V2.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
        return vd;
    };

    proto.clone = function(){
        return new V2(this.x,this.y);
    };
    
    V2.add = function(vd,v){
        vd.x += v.x;
        vd.y += v.x;
        return vd;
    };

    proto.add = function(v){
        return new V2(this.x+v.x,this.y+v.y);
    };
    
    V2.addScaled = function(vd,v,scale){
        vd.x += v.x * scale;
        vd.y += v.y * scale;
        return vd;
    };

    proto.addScaled = function(v,scale){
        var vd = new V2();
        V2.copy(vd,this);
        V2.addScaled(vd,v,scale);
        return vd;
    };
    
    V2.sub = function(vd,v){
        vd.x -= v.x;
        vd.y -= v.y;
        return vd;
    };

    proto.sub = function(v){
        return new V2(this.x-v.x,this.y-v.y);
    };

    V2.mult= function(vd,v){
        vd.x *= v.x;
        vd.y *= v.y;
        return vd;
    };

    proto.mult = function(v){
        if(typeof v === 'number'){
            return new V2(this.x*v,this.y*v);
        }else{
            return new V2(this.x*v.x,this.y*v.y);
        }
    };
    
    V2.scale = function(vd,f){
        vd.x *= f;
        vd.y *= f;
        return vd;
    };
    
    proto.scale = function(f){
        return new V2(this.x*f, this.y*f);
    };
    
    V2.neg = function(vd){
        vd.x = -vd.x;
        vd.y = -vd.y;
        return vd;
    };

    proto.neg = function(f){
        return new V2(-this.x,-this.y);
    };

    V2.div = function(vd,v){
        vd.x = vd.x / v.x;
        vd.y = vd.y / v.y;
        return vd;
    };

    proto.div = function(v){
        return new V2(this.x/v.x,this.y/v.y);
    };

    V2.invert = function(vd){
        vd.x = 1.0/vd.x;
        vd.y = 1.0/vd.y;
        return vd;
    };

    proto.invert = function(){
        return new V2(1/this.x,1/this.y);
    };

    V2.pow = function(vd,pow){
        vd.x = Math.pow(vd.x,pow);
        vd.y = Math.pow(vd.y,pow);
        return vd;
    };

    proto.pow = function(pow){
        return new V2(Math.pow(this.x,pow), Math.pow(this.y,pow));
    };

    V2.sq = function(vd){
        vd.x = vd.x * vd.x;
        vd.y = vd.y * vd.y;
        return vd;
    };
    
    proto.sq = function(){
        return new V2(this.x*this.x,this.y*this.y);
    };
   
    V2.normalize = function(vd){
        var len = vd.lenSq();
        if(len === 0){
            vd.x = 1;
            vd.y = 0;
        }else if(len !== 1){
            len = 1 / Math.sqrt(len);
            vd.x = vd.x * len;
            vd.y = vd.y * len;
        }
        return vd;
    };
            
    proto.normalize = function(){
        var vd = new V2();
        V2.copy(vd,this);
        V2.normalize(vd);
        return vd;
    };
    
    V2.setLen = function(vd,l){
        V2.normalize(vd);
        V2.scale(vd,l);
        return vd;
    };

    proto.setLen = function(l){
        var vd = new V2();
        V2.copy(vd,this);
        V2.setLen(vd,l);
        return vd;
    };

    V2.project = function(vd,v){
        V2.copy(tmp,v);
        V2.normalize(tmp);
        var dot = V2.dot(vd,tmp);
        V2.copy(vd,tmp);
        V2.setLen(vd,dot);
        return vd;
    };
    
    proto.project = function(v){
        var vd = new V2();
        V2.copy(vd,this);
        V2.project(vd,v);
        return vd;
    };
    
    proto.toString = function(){
        var str = "[";
        str += this.x;
        str += ",";
        str += this.y;
        str += "]";
        return str;
    };
    
    V2.rotate = function(vd,rad){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var vx = vd.x * c - vd.y *s;
        var vy = vd.x * s + vd.y *c;
        vd.x = vx;
        vd.y = vy;
        return vd;
    };
        
    proto.rotate = function(rad){
        var vd = new V2();
        V2.copy(vd,this);
        V2.rotate(vd,rad);
        return vd;
    };
    
    V2.lerp = function(vd,v,alpha){
        var invAlpha = 1- alpha;
        vd.x = vd.x * invAlpha + v.x * alpha;
        vd.y = vd.y * invAlpha + v.y * alpha;
        return vd;
    };

    proto.lerp = function(v,alpha){
        var vd = new V2();
        V2.copy(vd,this);
        V2.lerp(vd,v,alpha);
        return vd;
    };
    
    V2.azimuth = function(v){
        return Math.atan2(v.y,v.x);
    };

    proto.azimuth = function(){
        return Math.atan2(this.y,this.x);
    };
    
    V2.equals = function(u,v){
        return Math.abs(u.x-v.x) <= V2.epsilon && Math.abs(u.y - v.y) <= V2.epsilon;
    };

    proto.equals = function(v){
        return V2.equals(this,v);
    };
    
    V2.round  = function(vd){
        vd.x = Math.round(vd.x);
        vd.y = Math.round(vd.y);
        return vd;
    };

    proto.round = function(){
        var vd = new V2();
        V2.copy(vd,this);
        V2.round(vd,this);
        return vd;
    };

    V2.crossArea = function(u,v){
        return u.x * v.y - u.y * v.y;
    };

    proto.crossArea = function(v){
        return this.x * v.y - this.y * v.x;
    };

    V2.reflect = function(vd,vn){
        V2.copy(tmp,vn);
        V2.normalize(tmp);
        var dot2 = V2.dot(vd,tmp) * 2;
        vd.x = vd.x - vn.x * dot2;
        vd.y = vd.y - vn.y * dot2;
        return vd;
    };

    proto.reflect = function(vn){
        var vd = new V2();
        V2.copy(vd,this);
        V2.reflect(vd,vn);
        return vd;
    };

    V2.toArray = function(array,v,offset){
        offset = offset || 0;
        array[offset]   = v.x;
        array[offset+1] = v.y;
        return array;
    };

    proto.array   = function(){
        return [this.x,this.y];
    };

    proto.float32 = function(){
        var a = new Float32Array(2);
        a[0] = this.x;
        a[1] = this.y;
        return a;
    };

})(exports);

/* ------------------------------ 3D Vectors -------------------------------- */

(function(exports){

    function V3(){
        var self = this;
        if(this.constructor !== V3){
            self = new V3();
        }
        if(arguments.length === 0){
            self.x = 0;
            self.y = 0;
            self.z = 0;
        }else if (arguments.length === 1){
        	var arg = arguments[0];
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(typeof arg === 'number'){
                self.x = arg;
                self.y = arg;
                self.z = arg;
            }else if(arg[0] !== undefined){
                self.x = arg[0] || 0;
                self.y = arg[1] || 0;
                self.z = arg[2] || 0;
            }else{
            	self.x = arg.x || 0;
            	self.y = arg.y || 0;
            	self.z = arg.z || 0;
            }
        }else if (arguments.length === 3){
            self.x = arguments[0];
            self.y = arguments[1];
            self.z = arguments[2];
        }else{
            throw new Error("new V3(): wrong number of arguments:"+arguments.length);
        }
        return self;
    };

    V3.zero = new V3();
    V3.x    = new V3(1,0,0);
    V3.y    = new V3(0,1,0);
    V3.z    = new V3(0,0,1);
    V3.epsilon  = 0.00000001;    
    V3.tmp  = new V3();
    V3.tmp1 = new V3();
    V3.tmp2 = new V3();

    var tmp  = new V3();
    var tmp1 = new V3();
    var tmp2 = new V3();
    
    exports.V3 = V3;

    var proto = V3.prototype;

    V3.randomPositive = function(){
        return new V3(Math.random(), Math.random(), Math.random());
    };

    V3.random = function(){
        return new V3( Math.random()*2 - 1, 
                         Math.random()*2 - 1, 
                         Math.random()*2 - 1 );
    };

    V3.randomSphere = function(){
        var v = new V3();
        do{
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
            v.z = Math.random() * 2 - 1;
        }while(v.lenSq() > 1);
        return v;
    };

    V3.isZero  = function(v){
        return v.x === 0 && v.y === 0 && v.z === 0;
    };

    proto.isZero = function(){
        return V3.isZero(this);
    };
    
    V3.len  = function(v){
        return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
    };

    proto.len = function(){
        return V3.len(this);
    };
    
    V3.lenSq = function(v){
        return v.x*v.x + v.y*v.y + v.z*v.z;
    };

    proto.lenSq = function(){
        return V3.lenSq(this);
    };

    V3.dist = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };
    
    proto.dist = function(v){
        return V3.dist(this,v);
    };

    V3.distSq = function(u,v){
        var dx = u.x - v.x;
        var dy = u.y - v.y;
        var dz = u.z - v.z;
        return dx*dx + dy*dy + dz*dz;
    };

    proto.distSq = function(v){
        return V3.distSq(this,v);
    };

    V3.dot = function(u,v){
        return u.x*v.x + u.y*v.y + u.z*v.z;
    };

    proto.dot = function(v){
        return V3.dot(this,v);
    };
    
    V3.angle = function(u,v){
        return math.acos(V3.dot(u,v)/(V3.len(u)*V3.len(v)));
    };

    proto.angle = function(v){
        return V3.angle(this,v);
    };

    V3.set = function(vd,vx,vy,vz){
        vd.x = vx;
        vd.y = vy;
        vd.z = vz;
        return vd;
    };

    V3.setArray = function(vd,array,offset){
        offset = offset || 0;
        vd.x = array[offset];
        vd.y = array[offset + 1];
        vd.z = array[offset + 2];
        return vd;
    };

    V3.copy = function(vd,v){
        vd.x = v.x;
        vd.y = v.y;
        vd.z = v.z;
        return vd;
    };

    proto.clone = function(){
        var vd = new V3();
        V3.copy(vd,this);
        return vd;
    };

    V3.add = function(vd,v){
        vd.x += v.x;
        vd.y += v.y;
        vd.z += v.z;
        return vd;
    };

    proto.add = function(v){
        return new V3(this.x + v.x, this.y + v.y, this.z + v.z);
    };

    V3.sub = function(vd,v){
        vd.x -= v.x;
        vd.y -= v.y;
        vd.z -= v.z;
        return vd;
    };

    proto.sub = function(v){
        return new V3(this.x - v.x, this.y - v.y, this.z - v.z);
    };

    V3.mult = function(vd,v){
        vd.x *= v.x;
        vd.y *= v.y;
        vd.z *= v.z;
        return vd;
    };

    proto.mult = function(v){
        return new V3(this.x * v.x, this.y * v.y, this.z * v.z);
    };

    V3.scale = function(vd,f){
        vd.x *= f;
        vd.y *= f;
        vd.z *= f;
        return vd;
    };

    proto.scale = function(f){
        return new V3(this.x * f, this.y * f, this.z * f);
    };

    V3.neg = function(vd){
        vd.x = -vd.x;
        vd.y = -vd.y;
        vd.z = -vd.z;
        return vd;
    };

    proto.neg = function(){
        return new V3(-this.x, - this.y, - this.z);
    };

    V3.div = function(vd,v){
        vd.x = vd.x/v.x;
        vd.y = vd.y/v.y;
        vd.z = vd.z/v.z;
        return vd;
    };
    
    proto.div = function(v){
        return new V3(this.x/v.x, this.y/v.y, this.z/v.z);
    };

    V3.invert = function(vd){
        vd.x = 1.0/vd.x;
        vd.y = 1.0/vd.y;
        vd.z = 1.0/vd.z;
        return vd;
    };

    proto.invert = function(){
        return new V3(1.0/this.x, 1.0/this.y, 1.0/this.z);
    };

    V3.pow = function(vd,pow){
        vd.x = Math.pow(vd.x,pow);
        vd.y = Math.pow(vd.y,pow);
        vd.z = Math.pow(vd.z,pow);
        return vd;
    };

    proto.pow = function(pow){
        return new V3( Math.pow(this.x,pow),
                       Math.pow(this.y,pow), 
                       Math.pow(this.z,pow) );
    };

    V3.sq = function(vd){
        vd.x = vd.x * vd.x;
        vd.y = vd.y * vd.y;
        vd.z = vd.z * vd.z;
        return vd;
    };

    proto.sq = function(){
        return new V3( this.x * this.x,
                       this.y * this.y,
                       this.z * this.z );
    };

    V3.normalize = function(vd){
        var len = V3.lenSq(vd);
        if(len === 0){
            vd.x = 1;
            vd.y = 0;
            vd.z = 0;
        }else if(len !== 1){
            len = 1 / Math.sqrt(len);
            vd.x = vd.x * len;
            vd.y = vd.y * len;
            vd.z = vd.z * len;
        }
        return vd;
    };

    proto.normalize = function(){
        var vd   = new V3();
        V3.copy(vd,this);
        V3.normalize(vd);
        return vd;
    };
    
    V3.setLen = function(vd,l){
        V3.normalize(vd);
        V3.scale(vd,l);
        return vd;
    };

    proto.setLen = function(l){
        var vd = new V3();
        V3.copy(vd,this);
        V3.setLen(vd,l);
        return vd;
    };

    V3.project = function(vd,v){
        V3.copy(tmp,v);
        V3.normalize(tmp);
        var dot = V3.dot(vd,tmp);
        V3.copy(vd,tmp);
        V3.setLen(vd,dot);
        return vd;
    };

    proto.project = function(v){
        var vd = new V3();
        V3.copy(vd,this);
        V3.project(vd,v);
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

    V3.lerp = function(vd,v,f){
        var nf = 1.0 - f;
        vd.x = vd.x*nf + v.x*f;
        vd.y = vd.y*nf + v.y*f;
        vd.z = vd.z*nf + v.z*f;
        return vd;
    };

    proto.lerp = function(v,f){
        var nf = 1.0 - f;
        return new V3( this.x*nf + v.x*f,
                       this.y*nf + v.y*f,
                       this.z*nf + v.z*f );

    };

    V3.equals  = function(u,v){
        return Math.abs(u.x - v.x) <= V3.epsilon &&
               Math.abs(u.y - v.y) <= V3.epsilon &&
               Math.abs(u.z - v.z) <= V3.epsilon;
    };

    proto.equals = function(v){
        return V3.equals(this,v);
    };
    
    V3.round  = function(vd){
        vd.x = Math.round(vd.x);
        vd.y = Math.round(vd.y);
        vd.z = Math.round(vd.z);
        return vd;
    };

    proto.round = function(){
        return new V3( Math.round(this.x),
                       Math.round(this.y), 
                       Math.round(this.z) );
    };

    V3.reflect = function(vd,vn){
        V3.copy(tmp,vn);
        V3.normalize(tmp);
        var dot2 = V3.dot(vd,tmp) * 2;
        vd.x = vd.x - tmp.x * dot2;
        vd.y = vd.y - tmp.y * dot2;
        vd.z = vd.z - tmp.z * dot2;
        return vd;
    };

    proto.reflect = function(vn){
        var vd = new V3();
        V3.copy(vd,this);
        V3.reflect(vd,vn);
        return vd;
    };

    V3.cross  = function(vd,v){
        var vdx = vd.x, vdy = vd.y, vdz = vd.z;
        vd.x = vdy*v.z - vdz*v.y;
        vd.y = vdz*v.x - vdx*v.z;
        vd.z = vdx*v.y - vdy*v.x;
        return vd;
    }

    proto.cross = function(v){
        return new V3( this.y*v.z - this.z*v.y,
                       this.z*v.x - this.x*v.z,
                       this.x*v.y - this.y*v.x );
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
    
    V3.toArray = function(array,v,offset){
        offset = offset || 0;
        array[offset]     = v.x;
        array[offset + 1] = v.y;
        array[offset + 2] = v.z;
        return array;
    };

    proto.array   = function(){
        return [this.x,this.y,this.z];
    };

    proto.float32 = function(){
        var a = new Float32Array(3);
        a[0] = this.x;
        a[1] = this.y;
        a[2] = this.z;
        return a;
    };

})(exports);

/* ------------------------------ 3x3 Matrix -------------------------------- */

(function(exports){

    var V3 = exports.V3;
        
    // 0 3 6 | xx xy xz
    // 1 4 7 | yx yy yz
    // 2 5 8 | zx zy zz
    
    var setArray = function(md,array,offset){
        offset = offset || 0;
        md.xx = array[offset];
        md.xy = array[offset + 3];
        md.xz = array[offset + 6];
        md.yx = array[offset + 1];
        md.yy = array[offset + 4];
        md.yz = array[offset + 7];
        md.zx = array[offset + 2];
        md.zy = array[offset + 5];
        md.zz = array[offset + 8];
        return md;
    };

    var set = function(md,components_){
        setArray(md,arguments,1);
        return md;
    };

    function Mat3(){
        var self = this;
        if(this.constructor !== Mat3){
            self = new Mat3();
        }
        var alen = arguments.length;
        if(alen === 0){
            self.xx = 1;
            self.xy = 0;
            self.xz = 0;
            self.yx = 0;
            self.yy = 1;
            self.yz = 0;
            self.zx = 0;
            self.zy = 0;
            self.zz = 1;
        }else if (alen === 1){
            var arg = arguments[0];
            if( typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else if(   typeof arg.rotate === 'number'
                     || typeof arg.scale === 'number'
                     || typeof arg.translate === 'number'){
                Mat3.setTransform(self,
                        arg.translate || new V2(),
                        arg.scale|| new V2(1,1),
                        arg.rotate || 0
                );
            }else{
                self.xx = arg.xx || 0;
                self.xy = arg.xy || 0;
                self.xz = arg.xz || 0;
                self.yx = arg.yx || 0;
                self.yy = arg.yy || 0;
                self.yz = arg.yz || 0;
                self.zx = arg.zx || 0;
                self.zy = arg.zy || 0;
                self.zz = arg.zz || 0;
            }
        }else if (alen === 9){
            setArray(self,arguments);
        }else{
            throw new Error('wrong number of arguments:'+alen);
        }
        return self;
    };

    exports.Mat3 = Mat3;

    Mat3.epsilon  = 0.00000001;    
    Mat3.id       = new Mat3();
    Mat3.zero     = new Mat3(0,0,0,0,0,0,0,0,0);
    Mat3.tmp      = new Mat3();
    Mat3.tmp1     = new Mat3();
    Mat3.tmp2     = new Mat3();

    var tmp = new Mat3();

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
        return md;
    };

    Mat3.set = set;

    Mat3.setArray = setArray;

    Mat3.setId = function(md){
        md.xx = 1;
        md.xy = 0;
        md.xz = 0;
        md.yx = 0;
        md.yy = 1;
        md.yz = 0;
        md.zx = 0;
        md.zy = 0;
        md.zz = 1;
        return md;
    };

    Mat3.setZero = function(md){
        Mat3.copy(md,Mat3.zero);
        return md;
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

    Mat3.add = function(md,m){
        md.xx += m.xx;
        md.xy += m.xy;
        md.xz += m.xz;
        md.yx += m.yx;
        md.yy += m.yy;
        md.yz += m.yz;
        md.zx += m.zx;
        md.zy += m.zy;
        md.zz += m.zz;
        return md;
    };

    proto.add = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.add(md,mat);
        return md;
    };

    Mat3.sub = function(md,m){
        md.xx -= m.xx;
        md.xy -= m.xy;
        md.xz -= m.xz;
        md.yx -= m.yx;
        md.yy -= m.yy;
        md.yz -= m.yz;
        md.zx -= m.zx;
        md.zy -= m.zy;
        md.zz -= m.zz;
        return md;
    };

    proto.sub = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.sub(md,mat);
        return md;
    };

    Mat3.neg = function(md){
        md.xx = -md.xx;
        md.xy = -md.xy;
        md.xz = -md.xz;
        md.yx = -md.yx;
        md.yy = -md.yy;
        md.yz = -md.yz;
        md.zx = -md.zx;
        md.zy = -md.zy;
        md.zz = -md.zz;
    };

    proto.neg = function(mat){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.neg(md);
        return md;
    };

    Mat3.tr = function(md){
        Mat3.copy(tmp,m);
        md.xx = tmp.xx;
        md.xy = tmp.yx;
        md.xz = tmp.zx;
        md.yx = tmp.xy;
        md.yy = tmp.yy;
        md.yz = tmp.zy;
        md.zx = tmp.xz;
        md.zy = tmp.yz;
        md.zz = tmp.zz;
        return md;
    };

    proto.tr = function(){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.tr(md);
        return md;
    };

    Mat3.mult = function(md,m){
        var b = Mat3.copy(tmp,md);
        var a = m;
        if(md === m){
            b = a;
        }
        md.xx = a.xx*b.xx + a.xy*b.yx + a.xz*b.zx; 
        md.xy = a.xx*b.xy + a.xy*b.yy + a.xz*b.zy; 
        md.xz = a.xx*b.xz + a.xy*b.yz + a.xz*b.zz; 

        md.yx = a.yx*b.xx + a.yy*b.yx + a.yz*b.zx; 
        md.yy = a.yx*b.xy + a.yy*b.yy + a.yz*b.zy; 
        md.yz = a.yx*b.xz + a.yy*b.yz + a.yz*b.zz; 

        md.zx = a.zx*b.xx + a.zy*b.yx + a.zz*b.zx; 
        md.zy = a.zx*b.xy + a.zy*b.yy + a.zz*b.zy; 
        md.zz = a.zx*b.xz + a.zy*b.yz + a.zz*b.zz; 
        return md;
    };

    Mat3.multFac  = function(md,fac){
        md.xx *= fac;
        md.xy *= fac;
        md.xz *= fac;
        md.yx *= fac;
        md.yy *= fac;
        md.yz *= fac;
        md.zx *= fac;
        md.zy *= fac;
        md.zz *= fac;
        return md;
    };

    Mat3.multV3 = function(vd,m){
        var vx = vd.x, vy = vd.y, vz = vd.z;
        vd.x = m.xx * vx + m.xy * vy + m.xz * vz;
        vd.y = m.yx * vx + m.yy * vy + m.yz * vz;
        vd.z = m.zx * vx + m.zy * vy + m.zz * vz;
        return vd;
    };

    Mat3.multV2 = function(vd,m){
        var vx = vd.x, vy = vd.y;
        var d  = 1.0 / ( vx * m.zx + vy * m.zy + m.zz);
        vd.x = d * ( m.xx * vx + m.xy * vy + m.xz );
        vd.y = d * ( m.yx * vx + m.yy * vy + m.yz );
        return vd;
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var md = new Mat3();
            Mat3.copy(md,this);
            Mat3.multFac(md,arg);
            return md;
        }else if(arg instanceof Mat3){
            var md = new Mat3();
            Mat3.copy(md,this);
            Mat3.mult(md,arg);
            return md;
        }else if(arg instanceof V2){
            var vd = new V2();
            V2.copy(vd,arg);
            Mat3.multV2(vd,this);
            return vd;
        }else if(arg instanceof V3){
            var vd = new V3();
            V3.copy(vd,arg);
            Mat3.multV3(vd,this);
            return vd;
        }else{
            throw new Error('Mat3: mult(), cannot multiply with an object of this type:',arg);
        }
    };

    Mat3.setRotate = function(md,angle){
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        Mat3.setId(md);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat3.rotate = function(angle){
        var md = new Mat3();
        Mat3.setRotate(md,angle);
        return md;
    };

    Mat3.setSkewX = function(md,shear){
        Mat3.setId(md);
        md.xy = shear;
        return md;
    };
    
    Mat3.shearX = function(shear){
        var md = new Mat3();
        md.xy = shear;
        return md;
    };

    Mat3.setSkewY = function(md,shear){
        Mat3.setId(md);
        md.yx = shear;
        return md;
    };
    
    Mat3.shearY = function(shear){
        var md = new Mat3();
        md.yx = shear;
        return md;
    };

    Mat3.setScale = function(md,scale){
        Mat3.setId(md);
        md.xx = scale.x;
        md.yy = scale.y;
        return md;
    };

    Mat3.scale    = function(sv){
        var md = new Mat3();
        Mat3.setScale(md,sv);
        return md;
    };

    Mat3.setTranslate = function(md,vec){
        Mat3.setId(md);
        md.xz = vec.x;
        md.yz = vec.y;
        return md;
    };

    Mat3.translate = function(v){
        var md = new Mat3();
        Mat3.setTranslate(md,v);
        return md;
    };

    var tmp_tr = new Mat3();
    Mat3.setTransform = function(md,pos,scale,angle){
        Mat3.setScale(md,scale); //FIXME
        Mat3.setRotate(tmp_tr,angle);
        Mat3.mult(md,tmp_tr);
        Mat3.setTranslate(tmp_tr,pos);
        Mat3.mult(md,tmp_tr);
        return md;
    };

    Mat3.transform   = function(pos,scale,angle){
        var md = new Mat3();
        Mat3.setTransform(md,pos,scale,angle);
        return md;
    };

    proto.getScale = function(){};
    proto.getRotate = function(){};
    proto.getTranslate = function(){};

    Mat3.det = function(m){
        return m.xx*(m.zz*m.yy-m.zy*m.yz) - m.yx*(m.zz*m.xy-m.zy*m.xz) + m.zx*(m.yz*m.xy-m.yy*m.xz);
    };

    proto.det = function(){
        return Mat3.det(this);
    };

    Mat3.invert  = function(md){
        var det = Mat3.det(md);
        var m = Mat3.copy(tmp,md);

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
        return md;
    };

    proto.invert = function(){
        var md = new Mat3();
        Mat3.copy(md,this);
        Mat3.invert(md);
        return md;
    };

    proto.row = function(i){
        var m = this;
        if(i === 0){
            return new V3(m.xx,m.xy,m.xz);
        }else if(i === 1){
            return new V3(m.yx,m.yy,m.yz);
        }else if(i === 2){
            return new V3(m.zx,m.zy,m.zz);
        }
    };
    
    proto.col = function(j){
        var m = this;
        if(j === 0){
            return new V3(m.xx,m.yx,m.zx);
        }else if(j === 1){
            return new V3(m.xy,m.yy,m.zy);
        }else if(j === 2){
            return new V3(m.xz,m.yz,m.zz);
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

})(exports);

/* ------------------------------ 4x4 Matrix -------------------------------- */

(function(exports){

    var V3 = exports.V3;


    var setArray = function(md,array,offset){

        // 0 4 8  12 | xx xy xz xw
        // 1 5 9  13 | yx yy yz yw
        // 2 6 10 14 | zx zy zz zw
        // 3 7 11 15 | wx wy wz ww
        
        md.xx = array[0];
        md.yx = array[1];
        md.zx = array[2];
        md.wx = array[3];
        
        md.xy = array[4];
        md.yy = array[5];
        md.zy = array[6];
        md.wy = array[7];
        
        md.xz = array[8];
        md.yz = array[9];
        md.zz = array[10];
        md.wz = array[11];
        
        md.xw = array[12];
        md.yw = array[13];
        md.zw = array[14];
        md.ww = array[15];
        return md;
    };

    var set = function(md,components_){
        setArray(md,arguments,1);
        return md;
    };

    function Mat4(arg){
        var self = this;
        if(this.constructor !== Mat4){
            self = new Mat4();
        }
        var alen = arguments.length;
        if(alen === 0){
            self.xx = 1;
            self.xy = 0;
            self.xz = 0;
            self.xw = 0;
            self.yx = 0;
            self.yy = 1;
            self.yz = 0;
            self.yw = 0;
            self.zx = 0;
            self.zy = 0;
            self.zz = 1;
            self.zw = 0;
            self.wx = 0;
            self.wy = 0;
            self.wz = 0;
            self.ww = 1;
        }else if(alen === 1){
            if(typeof arg === 'string'){
                arg = JSON.parse(arg);
            }
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else{
                Mat4.copy(self,arg);
            }
        }else if(alen === 16){
            setArray(self,arguments);
        }else{
            throw new Error("wrong number of arguments:"+alen);
        }
        return self;
    };

    var tmp   = new Mat4();

    exports.Mat4 = Mat4;

    Mat4.epsilon  = 0.00000001;    
    Mat4.id       = new Mat4();
    Mat4.zero     = new Mat4(0,0,0,0,
                             0,0,0,0,
                             0,0,0,0,
                             0,0,0,0);
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

    Mat4.setArray  = setArray;

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
        return md;
    };

    proto.clone = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        return md;
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

    Mat4.add = function(md,m){
        md.xx += m.xx;
        md.xy += m.xy;
        md.xz += m.xz;
        md.xw += m.xw;
        md.yx += m.yx;
        md.yy += m.yy;
        md.yz += m.yz;
        md.yw += m.yw;
        md.zx += m.zx;
        md.zy += m.zy;
        md.zz += m.zz;
        md.zw += m.zw;
        md.wx += m.wx;
        md.wy += m.wy;
        md.wz += m.wz;
        md.ww += m.ww;
        return md;
    };

    proto.add = function(mat){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.add(md,mat);
        return md;
    };

    Mat4.sub = function(md,m){
        md.xx -= m.xx;
        md.xy -= m.xy;
        md.xz -= m.xz;
        md.xw -= m.xw;
        md.yx -= m.yx;
        md.yy -= m.yy;
        md.yz -= m.yz;
        md.yw -= m.yw;
        md.zx -= m.zx;
        md.zy -= m.zy;
        md.zz -= m.zz;
        md.zw -= m.zw;
        md.wx -= m.wx;
        md.wy -= m.wy;
        md.wz -= m.wz;
        md.ww -= m.ww;
        return md;
    };

    proto.sub = function(mat){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.sub(md,mat);
        return md;
    };

    Mat4.neg = function(md){
        md.xx = -md.xx;
        md.xy = -md.xy;
        md.xz = -md.xz;
        md.xw = -md.xw;
        md.yx = -md.yx;
        md.yy = -md.yy;
        md.yz = -md.yz;
        md.yw = -md.yw;
        md.zx = -md.zx;
        md.zy = -md.zy;
        md.zz = -md.zz;
        md.zw = -md.zw;
        md.wx = -md.wx;
        md.wy = -md.wy;
        md.wz = -md.wz;
        md.ww = -md.ww;
        return md;
    };

    proto.neg = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.neg(md);
        return md;
    };

    Mat4.tr = function(md){
        var m = Mat4.copy(tmp,md);
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
        return md;
    };

    proto.tr = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.tr(md);
        return md;
    };
    
    Mat4.mult = function(md,m){
        var b = Mat4.copy(tmp,md);
        var a = m;
        if(md === m){
            a = b;
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
        return md;
    };

    Mat4.multFac  = function(md,fac){
        md.xx *= fac;
        md.xy *= fac;
        md.xz *= fac;
        md.xw *= fac;
        md.yx *= fac;
        md.yy *= fac;
        md.yz *= fac;
        md.yw *= fac;
        md.zx *= fac;
        md.zy *= fac;
        md.zz *= fac;
        md.zw *= fac;
        md.wx *= fac;
        md.wy *= fac;
        md.wz *= fac;
        md.ww *= fac;
        return md;
    };

    Mat4.multV3 = function(vd,m){
        var vx = vd.x, vy = vd.y, vz = vd.z;
        var  d = 1.0 / ( m.wx * vx + m.wy * vy + m.wz * vz + m.ww);
        vd.x = ( m.xx * vx + m.xy * vy + m.xz * vz + m.xw  ) * d;
        vd.y = ( m.yx * vx + m.yy * vy + m.yz * vz + m.yw  ) * d;
        vd.z = ( m.zx * vx + m.zy * vy + m.zz * vz + m.zw  ) * d;
        return vd;
    };

    proto.mult = function(arg){
        if(typeof arg === 'number'){
            var md = new Mat4();
            Mat4.copy(md,this);
            Mat4.multFac(md,arg);
            return md;
        }else if(arg instanceof Mat4){
            var md = new Mat4();
            Mat4.copy(md,this);
            Mat4.mult(md,arg);
            return md;
        }else if(arg instanceof V3){
            var vd = new V3();
            V3.copy(vd,arg);
            Mat4.multV3(vd,this);
            return vd;
        }else{
            throw new Error('cannot multiply Mat4 with object of type:',typeof(arg));
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

    Mat4.invert  = function(md){
        var det = Mat4.det(md);
        var m   = Mat4.copy(tmp,md);

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
        return md;
    };

    proto.invert = function(){
        var md = new Mat4();
        Mat4.copy(md,this);
        Mat4.invert(md);
        return md;
    };

    var map = [ ['xx','xy','xz','xw'],
                ['yx','yy','yz','yw'],
                ['zx','zy','zz','zw'],
                ['wx','wy','wz','ww'] ];
    
    proto.ij = function(i,j){
        return this[ map[i][j] ];
    };

    Mat4.setId = function(md){
        md.xx = 1;
        md.xy = 0;
        md.xz = 0;
        md.xw = 0;
        md.yx = 0;
        md.yy = 1;
        md.yz = 0;
        md.yw = 0;
        md.zx = 0;
        md.zy = 0;
        md.zz = 1;
        md.zw = 0;
        md.wx = 0;
        md.wy = 0;
        md.wz = 0;
        md.ww = 1;
        return md;
    };

    Mat4.setRotateX = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.yy = c;
        md.yz = -s;
        md.zy = s;
        md.zz = c;
        return md;
    };

    Mat4.rotateX = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.yy = c;
        md.yz = -s;
        md.zy = s;
        md.zz = c;
        return md;

    };
    Mat4.setRotateY = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xz = s;
        md.zx = -s;
        md.zz = c;
        return md;
    };
    Mat4.rotateY = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xz = s;
        md.zx = -s;
        md.zz = c;
        return md;
    };
    Mat4.setRotateZ = function(md,angle){
        Mat4.setId(md);
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat4.rotateZ = function(angle){
        var md = new Mat4();
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        md.xx = c;
        md.xy = -s;
        md.yx = s;
        md.yy = c;
        return md;
    };

    Mat4.setRotateEuler  = function(md,X,Y,Z){
        Mat4.setRotateZ(md,Z);
        Mat4.setRotateY(tmp,Y);
        Mat4.mult(md,tmp);
        Mat4.setRotateX(tmp,X);
        Mat4.mult(md,tmp);
        return md;
    };
    
    Mat4.rotateEuler = function(X,Y,Z){
        var md = new Mat4();
        Mat4.setRotateEuler(md,X,Y,Z);
        return md;
    };
    
    Mat4.getEulerAngles = function(vd,m){
        vd.x = Math.atan2(m.zy,mzz);
        vd.y = Math.atan2(-m.zx,Math.sqrt(m.zy*m.zy+m.zz*m.zz));
        vd.z = Math.atan2(m.yx,m.xx);
        return vd;
    };
    
    proto.getEulerAngles = function(){
        var vd = new V3();
        Mat4.getEulerAngles(vd,this);
        return vd;
    };

    Mat4.setRotateAxis  = function(md,vec,angle){
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
        return md;
    };

    Mat4.rotateAxis = function(vec,angle){
        var md = new Mat4();
        Mat4.setRotateAxis(md,vec,angle);
        return md;
    };
    
    Mat4.setRotateQuat = function(md,q){
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
        return md;
    };

    Mat4.rotateQuat = function(q){
        var md = new Mat4();
        Mat4.setRotateQuat(md,q);
        return md;
    };

    Mat4.setScale   = function(md,sv){
        Mat4.setId(md);
        md.xx = sv.x;
        md.yy = sv.y;
        md.zz = sv.z;
        return md;
    };
    Mat4.scale    = function(sv){
        var m = new Mat4();
        m.xx = sv.x;
        m.yy = sv.y;
        m.zz = sv.z;
        return m;
    };
    Mat4.setTranslate = function(md,v){
        Mat4.setId(md);
        md.xw = v.x;
        md.yw = v.y;
        md.zw = v.z;
        return md;
    };

    Mat4.translate = function(v){
        var m = new Mat4();
        Mat4.setTranslate(m,v);
        return m;
    };

    Mat4.setSkewXY = function(md,sx,sy){
        Mat4.setId(md);
        md.xz = sx;
        md.yz = sy;
        return md;
    };

    Mat4.shearXY  = function(sx,sy){
        var md = new Mat4();
        Mat4.setSkewXY(md,sx,sy);
        return md;
    };

    Mat4.setSkewYZ = function(md,sy,sz){
        Mat4.setId(md);
        md.yx = sy;
        md.zx = sz;
        return md;
    };

    Mat4.shearYZ  = function(sy,sz){
        var md = new Mat4();
        Mat4.setSkewYZ(md,sy,sz);
        return md;
    };

    Mat4.setSkewXZ = function(md,sx,sz){
        Mat4.setId(md);
        md.xy = sx;
        md.zy = sz;
        return md;
    };

    Mat4.shearXZ = function(sx,sz){
        var md = new Mat4();
        Mat4.setSkewXZ(md,sx,sz);
        return md;
    };

    Mat4.setOrtho = function(md,left,right,bottom,top,near,far){
        Mat4.setId(md);
        md.xx = 2 / ( right - left);
        md.yy = 2 / ( top - bottom);
        md.zz = - 2 / ( far - near );  //FIXME wikipedia says this must be negative ?
        md.xw = - ( right + left ) / ( right - left );
        md.yw = - ( top + button ) / ( top - bottom );
        md.zw = - ( far + near ) / ( far - near );
        return md;
    };

    Mat4.ortho = function(l,r,b,t,n,f){
        var md = new Mat4();
        Mat4.setOrtho(md,l,r,b,t,n,f);
        return md;
    };

    Mat4.setFrustrum = function(md,l,r,b,t,n,f){
        Mat4.setId(md);
        md.xx = 2*n / (r-l);
        md.yy = 2*n / (t-b);
        md.zz = -(f+n)/(f-n);
        md.xz = (r+l) / (r-l);
        md.yz = (t+b) / (t-b);
        md.wz = -1;
        md.zw = -2*f*n/(f-n);
    };
    
    Mat4.frustrum = function(l,r,b,t,n,f){
        var md = new Mat4();
        Mat4.setFrustrum(md);
        return md;
    };

    Mat4.setLookAt = function(){
    };

    proto.getScale = function(){
    };

    proto.getRotate = function(){};
    proto.getTranslate = function(){
        return new V3(this.xw,this.yw,this.zw);
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
        return array;
    };

    proto.array = function(){
        return Mat4.toArray([],this);
    };

    proto.float32 = function(){
        return Mat4.toArray(new Float32Array(16),this);
    };

})(exports);

/* ------------------------------ Quaternions -------------------------------- */

(function(exports){

    var V3 = exports.V3;

    function setArray(qd,array,offset){
        offset = offset || 0;
        qd.x = array[offset];
        qd.y = array[offset + 1];
        qd.z = array[offset + 2];
        qd.w = array[offset + 3];
        return qd;
    }
    
    function set(qd,components_){
        setArray(qd,arguments,1);
        return qd;
    }

    function Quat(arg){
        var self = this;
        if(this.constructor !== Quat){
            self = new Quat();
        }
    	var alen = arguments.length;      
    	if(alen === 0){
            self.x = 0.0;
            self.y = 0.0;
            self.z = 0.0;
            self.w = 1.0;
        }else if (alen === 1){
        	if  (typeof arg === 'string'){
        		arg = JSON.parse(arg);
        	}
            if(arg[0] !== undefined){
                setArray(self,arg);
            }else{
                Quat.copy(self,arg);
            }
        }else if (alen === 4){
            setArray(self,arguments);
        }else{
            throw new Error("wrong number of arguments:"+arguments.length);
        }
        return self;
    }

    exports.Quat = Quat;

    var tmp = new Quat();
    
    var proto = Quat.prototype;

    Quat.id   = new Quat();

    Quat.set = set;
    
    Quat.setArray = setArray;
    
    Quat.copy = function(qd,q){
        qd.x = q.x;
        qd.y = q.y;
        qd.z = q.z;
        qd.w = q.w;
        return qd;
    };

    proto.clone = function(){
        var qd = new Quat();
        Quat.copy(qd,this);
        return qd;
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

    Quat.mult = function(qd,q){
        var a = Quat.copy(tmp,qd);
        var b = q;
        if(qd == q){
            b = a;
        }
        qd.w = a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z;
        qd.x = a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y;
        qd.y = a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x;
        qd.z = a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w;
        return qd;
    };


    proto.mult = function(q){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.mult(qd,q);
        return qd;
    };

    Quat.neg = function(qd){
        qd.x = -qd.x;
        qd.y = -qd.y;
        qd.z = -qd.z;
        qd.w =  qd.w;
        return qd;
    };

    proto.neg = function(){
        return new Quat( -this.x, 
                         -this.y,
                         -this.z,
                          this.w );
    };


    Quat.lerp = function(qd,r,t){
        var qx = qd.x, qy = qd.y, qz = qd.z, qw = qd.w;
        var rx = r.x, ry = r.y, rz = r.z, rw = r.w;
        var it = 1 - t;
        qd.x = it*qx + it*rx;
        qd.y = it*qy + it*ry;
        qd.z = it*qz + it*rz;
        qd.w = it*qw + it*rw;
        Quat.normalize(qd);
        return qd;
    };

    proto.lerp = function(q,t){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.lerp(qd,q,t);
        return qd;
    };
        

    proto.len = function(){
        return Math.sqrt(
                this.x*this.x + 
                this.y*this.y + 
                this.z*this.z + 
                this.w*this.w);
    };

    Quat.normalize = function(qd){
        var qx = qd.x, qy = qd.y, qz = qd.z, qw = qd.w;
        var ilen = 1.0 / Math.sqrt(qx*qx + qy*qy + qz*qz + qw*qw);
        qd.x = qx * ilen;
        qd.y = qy * ilen;
        qd.z = qz * ilen;
        qd.w = qw * ilen;
        return qd;
    };

    proto.normalize = function(){
        var qd = new Quat();
        Quat.copy(qd,this);
        Quat.normalize(qd);
        return qd;
    };

    Quat.setRotateAxis = function(qd,vec,angle){
        var s = Math.sin(angle*0.5);
        qd.w = Math.cos(angle*0.5);
        qd.x = vec.x * s;
        qd.y = vec.y * s;
        qd.z = vec.y * s;
        return qd;
    };

    Quat.setRotateX = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = Math.sin(angle*0.5);
        qd.y = 0;
        qd.z = 0;
        return qd;
    };

    Quat.setRotateY = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = Math.sin(angle*0.5);
        qd.z = 0;
        return qd;
    };

    Quat.setRotateZ = function(qd,vec,angle){
        qd.w = Math.cos(angle*0.5);
        qd.x = 0;
        qd.y = 0;
        qd.z = Math.sin(angle*0.5);
        return qd;
    };

    Quat.rotateAxis = function(vec,angle){
        var qd = new Quat();
        Quat.setRotateAxis(qd,vec,angle);
        return qd;
    };

    Quat.toArray = function(array,qd,offset){
        offset = offset || 0;
        array[offset + 0] = qd.x
        array[offset + 1] = qd.y
        array[offset + 2] = qd.z
        array[offset + 3] = qd.w
        return array;
    };

    Quat.array = function(){
        return Quat.toArray([],this);
    };

    proto.float32 = function(){
        return Mat4.toArray(new Float32Array(4),this);
    };

})(exports);
