// Modula 3D Matrixes
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

    var Vec3 = modula.Vec3;

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

    modula.Mat3 = Mat3;

    Mat3.id = new Mat3();
    Mat3.zero = new Mat3(0,0,0,0,0,0,0,0,0);

    var proto = Mat3.prototype;

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

})(modula);
