window.modula = window.modula || {};

(function(modula){

    // Multiply a number expressed in radiant by radToDeg to convert it in degrees
    var radToDeg = 57.29577951308232;
    modula.radToDeg = radToDeg;

    // Multiply a number expressed in degrees by degToRad to convert it to radiant
    var degToRad = 0.017453292519943295;
    modula.degToRad = degToRad;

    // The numerical precision used to compare vector equality
    modula.epsilon   = 0.0000001;

    var epsilonEquals = function(a,b){
        return Math.abs(a-b) <= modula.epsilon;
    };

    var Vec2 = modula.Vec2;
    
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

            this.xx = arg.xx || this.xx;    //FIXME Zero values ...
            this.xy = arg.xy || this.xy;
            this.yx = arg.yx || this.yx;
            this.yy = arg.yy || this.yy;
            this.xz = arg.xz || this.xz;
            this.yz = arg.yz || this.yz;

        } else if (arguments.length === 4){
            this.xx = arguments[0];
            this.xy = arguments[1];
            this.yx = arguments[2];
            this.yy = arguments[3];
            this.xz = arguments[4];
            this.yz = arguments[5];
        }
    }

    modula.Mat2h = Mat2h;

    var proto  = Mat2h.prototype;
    
    proto.type      = 'matH';
    proto.dimension = 2;
    proto.fullType = 'mat2';
    
    proto.equals = function(mat){
        return  this.fullType === mat.fullType && 
            epsilonEquals(this.xx, mat.xx) &&
            epsilonEquals(this.xy, mat.xy) &&
            epsilonEquals(this.yx, mat.yx) &&
            epsilonEquals(this.xz, mat.xz) &&
            epsilonEquals(this.yz, mat.yz) &&
            epsilonEquals(this.yy, mat.yy);
    };

    proto.clone = function(){
        var m = new Mat2h();
        m.xx = this.xx;
        m.xy = this.xy;
        m.yx = this.yx;
        m.yy = this.yy;
        m.xz = this.xz;
        m.yz = this.yz;
        return m;
    };
    
    proto.scale = function(mat){
        var m = this.clone();
        if(m.xx !== undefined){
            m.xx *= mat.xx;
            m.xy *= mat.xy;
            m.yx *= mat.yx;
            m.yy *= mat.yy;
            m.xz *= mat.xz;
            m.yz *= mat.yz;
        }else{
            m.xx *= mat;
            m.xy *= mat;
            m.yx *= mat;
            m.yy *= mat;
            m.xz *= mat;
            m.yz *= mat;
        }
        return m;
    };

    proto.add = function(mat){
        var m = this.clone();
        if(m.xx !== undefined){
            m.xx += mat.xx;
            m.xy += mat.xy;
            m.yx += mat.yx;
            m.yy += mat.yy;
            m.xz += mat.xz;
            m.yz += mat.yz;
        }else{
            m.xx += mat;
            m.xy += mat;
            m.yx += mat;
            m.yy += mat;
            m.xz += mat;
            m.yz += mat;
        }
        return m;
    };
    proto.sub = function(mat){
        var m = this.clone();
        if(m.xx !== undefined){
            m.xx -= mat.xx;
            m.xy -= mat.xy;
            m.yx -= mat.yx;
            m.yy -= mat.yy;
            m.xz -= mat.xz;
            m.yz -= mat.yz;
        }else{
            m.xx -= mat;
            m.xy -= mat;
            m.yx -= mat;
            m.yy -= mat;
            m.xz -= mat;
            m.yz -= mat;
        }
        return m;
    };
    proto.neg = function(mat){
        var m = this.clone();
        m.xx -= this.xx;
        m.xy -= this.xy;
        m.yx -= this.yx;
        m.yy -= this.yy;
        m.xz -= this.xz;
        m.yz -= this.yz;
        return m;
    };
    Mat2h.mult = function(a,b,dst){
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
        var m = this.clone();
        Mat2h.mult(this,mat,m);
        return m;
    };
    Mat2h.multVec = function(m,vec,dst){
        // xx xy xz   x 
        // yx yy yz * y 
        // 0  0  1    1 
        dst.x = m.xx * vec.x + m.xy * vec.y + m.xz;
        dst.y = m.yx * vec.x + m.yy * vec.y + m.yz;
        return dst;
    };

    proto.multVec = function(vec){
        var dst = new Vec2();
        Mat2h.multVec(this,vec,dst);
        return dst;
    };

    proto.det = function(){
        return this.xx * this.yy - this.yx * this.xy;
    };

    proto.invert = function(){
        var m = new Mat2h();
        var t = this;
        var det =  this.det();
        if(det){
            det = 1.0 / det;
            m.xx = det *  this.yy;
            m.xy = det * -this.xy;
            m.yx = det * -this.yx;
            m.yy = det *  this.xx;
            m.xz = det *  this.yz * this.xy - this.yy * this.xz;
            m.yz = det * -( this.yz * this.xx - this.yx * this.xz );
        }
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
    Mat2h.rotation = function(angle){
        var m = new Mat2h();
        Mat2h.setRotation(m,angle);
        return m;
    };

    Mat2h.rotationDeg = function(angle){
        return Mat2h.rotation(angle * modula.degToRad);
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

    Mat2h.scale = function(scale){
        var m = new Mat2h();
        Mat2h.setScale(m,scale);
        return m;
    };

    Mat2h.setTranslation = function(m,vec){
        m.xx = 1;
        m.xy = 0;
        m.yx = 0;
        m.yy = 1;;
        m.xz = vec.x;
        m.yz = vec.y;
        return m;
    };

    Mat2h.translation = function(vec){
        var m = new Mat2h();
        Mat2h.setTranslation(m,vec);
        return m;
    }

    Mat2h.transform = function(scale,rotation,translation){
        var m;
        if(rotation === 0){
            m = new Mat2h();
        }else{
            m = Mat2h.rotation(rotation);
        }
        m.xx *= scale.x;
        m.xy *= scale.y;
        m.xz  = translation.x;
        m.yz  = translation.y;
        return m;
    };
})(window.modula);


    
