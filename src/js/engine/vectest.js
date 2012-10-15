
function assert(stuff){
    if(!stuff){
        throw new Error('Assertion Failed:'+stuff);
    }
}

var epsilon = 0.000001;
var PI      = Math.PI;
var deg45   = Math.PI/4;
var deg90   = Math.PI/2;
var deg180  = Math.PI;
var deg360  = Math.PI*2;

function assert_eq(a,b){
    if(!(a === b) && !Math.abs(a-b) < epsilon){
        throw new Error('Equality assertion failed:'+a+' !== '+b);
    }
}
function assert_veq2(u,v){
    if(u instanceof Array){
        u = new V2(u);
    }
    if(!V2.equals(u,v)){
        throw new Error('V2 Equality assertion failed:'+u.toString()+' '+v.toString());
    }
}
function assert_veq3(u,v){
    if(u instanceof Array){
        u = new V3(u);
    }
    if(!V3.equals(u,v)){
        throw new Error('V3 Equality assertion failed:'+u.toString()+' '+v.toString());
    }
}

function test_vec2(){
    /* Constructor test */
    var v = new V2();
    assert(v.x === 0 && v.y === 0);
    var v2 = new V2(1,2);
    assert(v2.x === 1 && v2.y === 2);
    var v3 = new V2(v2);
    assert(v3.x === 1 && v3.y === 2);
    var v4 = new V2([9,8]);
    assert(v4.x === 9 && v4.y === 8);
    var v5 = new V2({x:23, y:96});
    assert(v5.x === 23 && v5.y === 96);

    /* Default values */
    
    assert( V2.zero.x === 0 && V2.zero.y === 0);
    assert( V2.x.x === 1 && V2.x.y === 0);
    assert( V2.y.x === 0 && V2.y.y === 1);
    assert( V2.epsilon > 0 && V2.epsilon < 1);

    /* creation */
    
    assert_veq2([0,0],  V2.polar(0,0));
    assert_veq2([1,0],  V2.polar(1,0));
    assert_veq2([0,1],  V2.polar(1,Math.PI/2));
    assert_veq2([-1,0], V2.polar(1,Math.PI));
    assert_veq2([1,1],  V2.polar(Math.sqrt(2),Math.PI/4));

    /* random */

    /* tests */
    assert(V2.isZero(V2.zero) && !V2.isZero(V2.x));
    assert_eq(1,V2.x.len());

    /* lengths */
    assert_eq(0,V2.zero.len());
    assert_eq(2,(new V2(2,0)).len());
    assert_eq(Math.sqrt(2),(new V2(1,1).len()));
    assert_eq(2,(new V2(1,1).lenSq()));
    assert_eq(1,V2.zero.dist(V2.x));
    assert_eq(1,V2.x.dist(V2.zero));
    assert_eq(1,V2.zero.dist(V2.y));
    assert_eq(1,V2.y.dist(V2.zero));
    assert_eq(0,V2.y.dist(V2.y));
    assert_eq(2,V2.zero.distSq(V2(1,1)));
    assert_eq(2,V2(2,1).distSq(V2(3,2)));
    
    /* dots */
    assert_eq(0,V2.zero.dot(V2.x));
    assert_eq(1,V2.x.dot(V2.x));
    assert_eq(0,V2.x.dot(V2.y));

    /* copy */
    var v = V2(1,3);
    V2.copy(v,V2(4,5));
    assert_veq2(v,V2(4,5));
    assert_veq2(v,v.clone());

    /* arithmetic */
    assert_veq2([3,5],V2(1,4).add(V2(2,1)));
    assert_veq2([2,3],V2(8,5).sub(V2(6,2)));
    assert_veq2([15,24],V2(3,6).mult(V2(5,4)));
    assert_veq2([2,-8],V2(1,-4).scale(2));
    assert_veq2([2,-8],V2(-2,8).neg());
    assert_veq2([2,3],V2(12,15).div(V2(6,5)));
    assert_veq2([0.5,4],V2(2,0.25).invert());
    assert_veq2([8,27],V2(2,3).pow(3));
    assert_veq2([4,9],V2(2,3).sq());
    assert_veq2([1,0],V2(0.5,0).normalize());
    assert_veq2([0,-1],V2(0,-8).normalize());
    assert_veq2([10,0],V2(0.5,0).setLen(10));
    assert_veq2([0,-8],V2(0,27).setLen(-8));
    assert_veq2([10,0],V2(10,15).project(V2(3,0)));
    assert_veq2([0,1],V2.x.rotate(Math.PI/2));
    assert_veq2([-1,0],V2.x.rotate(-Math.PI));
    assert_veq2([3,5],V2(3,5).lerp(V2(94,15),0));
    assert_veq2([94,15],V2(3,5).lerp(V2(94,15),1));
    assert_veq2([1.9,19],V2(1,10).lerp(V2(10,100),0.1));
    assert_eq(0,V2.x.azimuth());
    assert_eq(Math.PI/2,V2.y.azimuth());
    assert(V2(1,98).equals(V2(1,98)));
    assert(!V2(4,5).equals(V2(4,8)));
    assert_veq2([0,1],V2(0.1,0.9).round());
    assert_eq(1,V2.x.crossArea(V2.y));
    assert_eq(0,V2.x.crossArea(V2.x));
    assert_eq([0,1],V2.x.reflect(V2(1,1)));

    console.log('V2 Tests Complete');
}
test_vec2();

function test_vec3(){
    /* Constructor test */
    var v = new V3();
    assert(v.x === 0 && v.y === 0 && v.z === 0);
    var v2 = new V3(1,2,3);
    assert(v2.x === 1 && v2.y === 2 && v2.z === 3);
    var v3 = new V3(v2);
    assert(v3.x === 1 && v3.y === 2 && v3.z === 3);
    var v4 = new V3([9,8,7]);
    assert(v4.x === 9 && v4.y === 8 && v4.z === 7);
    var v5 = new V3({x:23, y:96, z:42});
    assert(v5.x === 23 && v5.y === 96 && v5.z === 42);

    /* Default values */
    
    assert( V3.zero.x === 0 && V3.zero.y === 0 && V3.zero.z === 0 );
    assert( V3.x.x === 1 && V3.x.y === 0 && V3.x.z === 0);
    assert( V3.y.x === 0 && V3.y.y === 1 && V3.y.z === 0);
    assert( V3.z.x === 0 && V3.z.y === 0 && V3.z.z === 1);
    assert( V3.epsilon > 0 && V3.epsilon < 1);

    /* random */

    /* tests */
    assert(V3.isZero(V3.zero) && !V3.isZero(V3.x));
    assert_eq(1,V3.x.len());

    /* lengths */
    assert_eq(0,V3.zero.len());
    assert_eq(2,(new V3(2,0,0)).len());
    assert_eq(Math.sqrt(2),(new V3(1,0,1).len()));
    assert_eq(3,(new V3(1,1,1).lenSq()));
    assert_eq(1,V3.zero.dist(V3.x));
    assert_eq(1,V3.x.dist(V3.zero));
    assert_eq(1,V3.zero.dist(V3.y));
    assert_eq(1,V3.y.dist(V3.zero));
    assert_eq(0,V3.y.dist(V3.y));
    assert_eq(2,V3.zero.distSq(V3(1,1,0)));
    assert_eq(2,V3(2,0,1).distSq(V3(3,0,2)));
    
    /* dots */
    assert_eq(0,V3.zero.dot(V3.x));
    assert_eq(1,V3.x.dot(V3.x));
    assert_eq(0,V3.x.dot(V3.y));

    /* copy */
    var v = V3(1,3,2);
    V3.copy(v,V3(4,5,6));
    assert_veq3(v,V3(4,5,6));
    assert_veq3(v,v.clone());

    /* arithmetic */
    assert_veq3([3,5,12],V3(1,4,5).add(V3(2,1,7)));
    assert_veq3([2,3,0],V3(8,5,9).sub(V3(6,2,9)));
    assert_veq3([15,24,14],V3(3,6,7).mult(V3(5,4,2)));
    assert_veq3([2,-8,9],V3(1,-4,4.5).scale(2));
    assert_veq3([2,-8,3],V3(-2,8,-3).neg());
    assert_veq3([2,3,4],V3(12,15,24).div(V3(6,5,6)));
    assert_veq3([0.5,4,2],V3(2,0.25,0.5).invert());
    assert_veq3([8,27,-8],V3(2,3,-2).pow(3));
    assert_veq3([4,9,64],V3(2,3,8).sq());
    assert_veq3([1,0,0],V3(0.5,0,0).normalize());
    assert_veq3([0,-1,0],V3(0,-8,0).normalize());
    assert_veq3([0,0,1],V3(0,0,3).normalize());
    assert_veq3([10,0,0],V3(0.5,0,0).setLen(10));
    assert_veq3([0,-8,0],V3(0,27,0).setLen(-8));
    assert_veq3([0,0,2],V3(0,0,4).setLen(2));
    assert_veq3([10,0,0],V3(10,15,21).project(V3(3,0,0)));
    assert_veq3([3,5,8],V3(3,5,8).lerp(V3(94,15,12),0));
    assert_veq3([94,15,12],V3(3,5,8).lerp(V3(94,15,12),1));
    assert_veq3([1.9,19,1],V3(1,10,0).lerp(V3(10,100,10),0.1));
    assert(V3(1,98,24).equals(V3(1,98,24)));
    assert(!V3(4,5,3).equals(V3(4,8,2)));
    assert_veq3([0,1,3],V3(0.1,0.9,2.6).round());
    assert_veq3(V3.z,V3.x.cross(V3.y));
    assert_veq3(V3.zero,V3.x.cross(V3.x));
    assert_eq([0,1,1],V3.x.reflect(V3(1,1,1)));

    console.log('V3 Tests Complete');
}
test_vec3();

function test_mat3(){
    var m = new Mat3();
    assert_veq3([3,4,5],m.mult(V3(3,4,5)));
    assert_veq2([6,7],m.mult(V2(6,7)));

    m = Mat3.rotate(deg90);
    assert(m.det() === 1);
    assert_veq2([0,1],m.mult(V2(1,0)));
    assert_veq2([-1,1],m.mult(V2(1,1)));
    m = m.invert();
    assert_veq2([0,-1],m.mult(V2(1,0)));
    assert_veq2([1,-1],m.mult(V2(1,1)));
    
    m = Mat3.rotate(deg180);
    assert(m.det() === 1);
    assert_veq2([-1,0],m.mult(V2(1,0)));
    assert_veq2([-1,-1],m.mult(V2(1,1)));
    m = m.invert();
    assert_veq2([-1,0],m.mult(V2(1,0)));
    assert_veq2([-1,-1],m.mult(V2(1,1)));
    
    m = Mat3.scale(V2(4,5));
    assert(m.det() === 20);
    assert_veq2([4,5],m.mult(V2(1,1)));
    assert_veq2([8,-15],m.mult(V2(2,-3)));
    m = m.invert();
    assert(m.det() === 1.0/20);
    assert_veq2([1.0/4,1.0/5],m.mult(V2(1,1)));
    assert_veq2([1,1],m.mult(V2(4,5)));
    
    m = Mat3.translate(V2(4,5));
    assert(m.det() === 1);
    assert_veq2([4,5],m.mult(V2(0,0)));
    assert_veq2([10,12],m.mult(V2(6,7)));
    m = m.invert();
    assert_veq2([0,0],m.mult(V2(4,5)));
    assert_veq2([6,7],m.mult(V2(10,12)));

    m = Mat3.scale(V2(2,3)).mult(
            Mat3.rotate(deg90).mult(
                Mat3.translate(V2(10,20))));

    assert_veq2([7,22],m.mult(V2(1,1)));
    m = m.invert();
    assert_veq2([1,1],m.mult(V2(7,22)));

    console.log('Mat3 Tests Complete');
}
test_mat3();

function test_mat4(){
    var m = new Mat4();
    assert_veq3([3,4,5],m.mult(V3(3,4,5)));

    m = Mat4.scale(V3(4,5,6));
    assert(m.det() === 120);
    assert_veq3([4,5,6],m.mult(V3(1,1,1)));
    assert_veq3([8,-15,6],m.mult(V3(2,-3,1)));
    m = m.invert();
    assert(m.det() === 1.0/120);
    assert_veq3([1.0/4,1.0/5,1.0/6],m.mult(V3(1,1,1)));
    assert_veq3([1,1,1],m.mult(V3(4,5,6)));

    m = Mat4.translate(V3(4,5,6));
    assert(m.det() === 1);
    assert_veq3([4,5,6],m.mult(V3(0,0,0)));
    assert_veq3([10,12,14],m.mult(V3(6,7,8)));
    m = m.invert();
    assert_veq3([0,0,0],m.mult(V3(4,5,6)));
    assert_veq3([6,7,8],m.mult(V3(10,12,14)));

    m = Mat4.rotateX(deg90);
    assert(m.det() === 1);
    assert_veq3(V3.x,m.mult(V3.x));
    assert_veq3(V3.z,m.mult(V3.y));
    m = m.invert();
    assert_veq3(V3.y,m.mult(V3.z));

    m = Mat4.rotateY(deg90);
    assert(m.det() === 1);
    assert_veq3(V3.y,m.mult(V3.y));
    assert_veq3(V3.x,m.mult(V3.z));
    m = m.invert();
    assert_veq3(V3.z,m.mult(V3.x));

    m = Mat4.rotateZ(deg90);
    assert(m.det() === 1);
    assert_veq3(V3.z,m.mult(V3.z));
    assert_veq3(V3.y,m.mult(V3.x));
    m = m.invert();
    assert_veq3(V3.x,m.mult(V3.y));

    m = new Mat4();
    assert(m.mult(m).equals(m));

    m = Mat4.scale(V3(2,3,4)).mult(
            Mat4.rotateZ(deg90).mult(
                Mat4.translate(V3(10,20,30))));

    assert_veq3([7,22,34],m.mult(V3(1,1,1)));
    m = m.invert();
    assert_veq3([1,1,1],m.mult(V3(7,22,34)));
    console.log('Mat4 Tests Complete');
}
test_mat4();

var id = 0;

function Particle(args){
    args = args || {};
    this.id  = args.id  || id++;
    this.pos = args.pos || new V2();
    this.mass = args.mass || 1;
    this.speed = args.speed || new V2();
    this.accel = args.accel || new V2();
};

Particle.prototype.clone = function(){
    return new Particle({
        id: this.id,
        mass: this.mass,
        pos: this.pos.clone(),
        speed: this.speed.clone(),
        accel: this.accel.clone()
    });
};

var G = 10;
var dt = 0.1;

var slowPhysics = function(p,particles){
    var plen = particles.length;
    for(var i = 0; i < plen; i++){
        var pi = particles[i];
        if(p.id !== pi.id){
            var r = pi.pos.sub(p.pos);
            var dist  = r.len();
            p.accel  = p.accel.addScaled(r,p.mass*pi.mass*G/(dist*dist));
        }
    }
    p.pos = p.pos.addScaled(p.speed,dt);
    p.speed = p.speed.addScaled(p.accel,dt);
};

var fastPhysics = function(p,particles){
    var plen = particles.length;
    var r = V2.tmp;
    for(var i = 0; i < plen; i++){
        var pi = particles[i];
        if(p !== pi){
            V2.sub(r,pi.pos,p.pos);
            var dist = V2.len(r);
            V2.addScaled(p.accel,p.accel,r,p.mass*pi.mass*G/(dist*dist));
        }
    }
    V2.addScaled(p.pos,p.pos,p.speed,dt);
    V2.addScaled(p.speed,p.speed,p.accel,dt);
};

function gravity(pcount, rounds){
    var particles = [];
    var nextparticles = [];

    console.log('Generating Particles...');
    for(var i = 0; i < pcount; i++){
        var p = new Particle({ pos: V2.newRandom()});
        particles.push(p);
        nextparticles.push(p.clone());
    }

    console.log('Slow Computing...');
    var t = (new Date()).getTime();
    for(var r = 0; r < rounds; r++){
        for( var i = 0; i < pcount; i++){
            slowPhysics(nextparticles[i],particles);
        }
        var tmp = particles;
        particles = nextparticles;
        nextparticles = tmp;
    }
    console.log('Done in:',((new Date()).getTime() - t)/1000.0,' sec');

    console.log('Fast Computing...');
    var t = (new Date()).getTime();
    for(var r = 0; r < rounds; r++){
        for( var i = 0; i < pcount; i++){
            fastPhysics(nextparticles[i],particles);
        }
        var tmp = particles;
        particles = nextparticles;
        nextparticles = tmp;
    }
    console.log('Done in:',((new Date()).getTime() - t)/1000.0,' sec');
}
 /* gravity(10,500000); */





    


