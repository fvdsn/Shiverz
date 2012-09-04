// Modula core
window.modula = window.modula || {};
(function(modula){
	
	modula.use = function(){
		if(arguments.length){
			for (var i = 0; i < arguments.length; i++){
				var prop = arguments[i];
				if(modula.hasOwnProperty(prop)){
					window[prop] = modula[prop];
				}
			}
		}else{
			for (var prop in modula){
				if(	prop !== modula.use &&
					prop !== modula.hasOwnProperty(prop)){
					
					window[prop] = modula[prop];
				}
			}
		}
		return modula;
	};
	
    /* Simple JavaScript Inheritance
     * By John Resig http://ejohn.org/
     * MIT Licensed.
     */
    // Inspired by base2 and Prototype
    (function(){
        var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

        // The base Class implementation
        this.Class = function(){

            this.attr = function(name){
                if((typeof name) === 'string'){
                    return this.get(name);
                }else{
                    this.set(name);
                    return this;
                }
            };

            //Returns the value of the field 'name'
            //it will first try to execute the getter method '_get_name()'
            //then it will try to find a readonly field '_name'
            //then it will try to find a field 'name'
            //it returns undefined if everything fails
            this.get = function(name,index){
                var fun = '_get_'+name;
                if(this[fun]){
                    return this[fun].apply(this,Array.prototype.slice.call(arguments,1));
                    //return this[fun](index);
                }else{
                    if(index === undefined || index === null){
                        var ret = this['_'+name];
                        if(ret === undefined){
                            return this[name];
                        }else if(ret.clone){
                            return ret.clone();
                        }else{
                            return ret;
                        }
                    }else{
                        var ret = this['_'+name];
                        if(ret === undefined){
                            ret = this[name];
                        }
                        return ret ? ret[index] : undefined;
                    }
                }
            };

            // Tries to set the value of the field 'name' to 'value'
            // it will first try to use a setter method '_set_name(value)'
            // it will then look if the field is writable. if there exist a 
            // readonly field of the same name '_name', then it is not writable
            // and it will do nothing.
            // if it is writable or the field doesn't exist, the field will be created
            // and set to the provided value.
            //
            // An altermative way to call set is to provide a dictionnary of fields and value.
            // Those are all set in undefined order with the same behaviour as set(name,value) 
            //
            this.set = function(name,value){
                this.__updated__ = true;
                if(arguments.length === 1){
                    var arg = arguments[0];
                    for (attr in arg){
                        if(arg.hasOwnProperty(attr)){
                            this.set(attr,arg[attr]);
                        }
                    }
                }else{
                    var fun = '_set_' + name;
                    if(this[fun]){
                        this[fun].apply(this,Array.prototype.slice.call(arguments,1));
                        //this[fun](value);
                    }else{
                        if( this['_' + name] === undefined ){
                            this[name] = value;
                        }
                    }
                }
                return this;
            };

            this.add = function(name,element){
                if(arguments.length === 1){
                    this._add_default(arguments[0]);
                }else{
                    var fun = '_add_'+name;
                    if(this[fun]){
                        this[fun](element);
                    }else if(this['_'+name] === undefined){
                        var field = this.get(name);
                        if((typeof field) === 'array'){
                            field.push(element);
                        }
                    }
                }
                return this;
            };

            this.remove = function(name,element){
                if(arguments.length === 1){
                    this._remove_default(argument[0]);
                }else{
                    var fun = '_remove_'+name;
                    if(this[fun]){
                        this[fun](element);
                    }else if(this['_'+name] === undefined){
                        var field = this.get(name);
                        if((typeof field) === 'array'){
                            field.splice(field.indexOf(element),1);
                        }
                    }
                }
                return this;
            };

            // Increases the value to a field :
            // if there is a function _increase_name(value) in the object, it will be called.
            // if the field is a number, the value will be added to the existing value
            // if the field is an object and has a .add method, the value will be increased
            // using this method
            this.increase = function(name,value){
                this.__updated__ = true;
                if(arguments.length === 1){
                    var arg = arguments[0];
                    for(attr in arg){
                        if(arg.hasOwnProperty(attr)){
                            this.add(attr,arg[attr]);
                        }
                    }
                }else{
                    var fun = '_increase_' + name;
                    if(this[fun]){
                        this[fun](value);
                    }else if(this['_'+name] === undefined){
                        var field = this.get(name); 
                        if(field === null || field === undefined){
                            this.set(name,value);
                        }else if(typeof field === 'number'){
                            this.set(name, field + value);
                        }else if(field.add){
                            this.set(name, field.add(value));
                        }
                    }
                }
                return this;
            };

            this.mixin = function(mixin){ //TODO match the better mixin function behaviour
                    if(arguments.length === 1){
                        for( prop in mixin){
                            if(this[prop] === undefined && mixin.hasOwnProperty(prop)){
                                    this[prop] = mixin[prop];
                            }
                        }
                    }else{
                            for(var i = 0; i < arguments.length; i++){
                                    this.mixin(arguments[i]);
                            }
                    }
            };
        };
      
        this.Class.extend = function(prop) {
            if(arguments.length > 1){
                var c = this.extend(arguments[arguments.length-1]);
                for(var i = arguments.length-2; i >= 0; i--){
                    c.mixin(arguments[i]);
                }
                return c;
            }
            var _super = this.prototype;
            
            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;
            
            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" && 
                    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                        (function(name, fn){
                            return function() {
                                var tmp = this._super;
                                
                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this._super = _super[name];
                                
                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);        
                                this._super = tmp;
                                
                                return ret;
                            };
                        })(name, prop[name]) : 
                        prop[name];
            }
            
            // The dummy class constructor
            function Class() {
                // All construction is actually done in the init method
                if ( !initializing && this.init )
                    this.init.apply(this, arguments);
            }

            Class.mixin = function (properties) {
                for (var name in properties) {
                    if(prototype[name] !== undefined){
                        continue;
                    }
                    if (typeof properties[name] !== 'function'
                            || !fnTest.test(properties[name])) {
                        prototype[name] = properties[name];
                    } else if (typeof prototype[name] === 'function'
                               && prototype.hasOwnProperty(name)) {
                        prototype[name] = (function (name, fn, previous) {
                            return function () {
                                var tmp = this._super;
                                this._super = previous;
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            }
                        })(name, properties[name], prototype[name]);
                    } else if (typeof _super[name] === 'function') {
                        prototype[name] = (function (name, fn) {
                            return function () {
                                var tmp = this._super;
                                this._super = _super[name];
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;
                                return ret;
                            }
                        })(name, properties[name]);
                    }
                }
            };
        
            // Populate our constructed prototype object
            Class.prototype = prototype;
            
            // Enforce the constructor to be what we expect
            Class.prototype.constructor = Class;

            // And make this class extendable
            Class.extend = arguments.callee;
            
            return Class;
        };

    }).call(modula);
    
    var Mixin = function(){};

    Mixin.prototype.extend = function(prop){
        var M = new Mixin();
        M.mixin(this);
        for(var i = 0; i < arguments.length; i++){
            M.mixin(arguments[i]);
        }
        return M;
    };

    Mixin.prototype.mixin = function(prop){
        for(var i = 0; i < arguments.length; i++){
            prop = arguments[i];
            for(attr in prop){
                if(this[attr] === undefined && prop.hasOwnProperty(attr)){
                    this[attr] = prop[attr];
                }
            }
        }
    };

    modula.Mixin = new Mixin();

})(window.modula);
// Modula Collections
window.modula = window.modula || {};
(function(modula){

    modula.Collection = function(matches){
        this.matches = [];
        if(matches instanceof modula.Collection){
            this.matches = matches.matches;
        }else if(matches instanceof Array){
            this.matches = matches;
        }else{
            this.matches = [];
        }
    };

    modula.Collection.prototype.length = function(){ return this.matches.length; };
    modula.Collection.prototype.first = function(){ return this.matches[0]; };
    modula.Collection.prototype.last  = function(){ return this.matches[this.matches.length-1]; };
    modula.Collection.prototype.all   = function(){ return this.matches; };

    modula.Collection.prototype.contains = function(element){
        for(var i = 0, len = this.matches.length; i < len; i++){
            if(this.matches[i] === element){
                return true;
            }
        }
        return false;
    };

    modula.Collection.prototype.append = function(element){
        var c = new modula.Collection();
        if(element instanceof modula.Collection){
            c.matches = this.matches.concat(element.matches);
        }else{
            c.matches = this.matches.concat(element);
        }
        return c;
    };
    
    modula.Collection.prototype.filter = function(filter){
        if(!filter){
            return this;
        }
        var c = new modula.Collection();
        for(var i = 0, len = this.matches.length; i < len; i++){
            if(filter(this.matches[i])){
                c.matches.push(this.matches[i]);
            }
        }
        return c;
    };

    modula.Collection.prototype.each = function(fun){
        if(fun){
            for(var i = 0, len = this.matches.length; i < len; i++){
                if(fun(this.matches[i],i) === 'break'){
                    break;
                }
            }
        }
        return this;
    };

    modula.Collection.prototype.map = function(fun){
        if(fun){
            var c = new modula.Collection();
            for(var i = 0, len = this.matches.length; i < len; i++){
                var res = fun(this.matches[i]);
                if(res !== undefined){
                    c.matches.push(res);
                }
            }
            return c;
        }
        return this;
    };

    modula.Collection.prototype.sum = function(){
        var sum = undefined;
        for(var i = 0, len = this.matches.length; i < len; i++){
            var match = this.matches[i];
            if(match !== undefined){
                if(sum){
                    if(sum.add){
                        sum = sum.add(match);
                    }else{
                        sum += match;
                    }
                }else{
                    sum = match;
                }
            }
        }
        return sum;
    };

    modula.Collection.prototype.one  = function(){
        if(this.matches.length === 0){
            throw new Error("Error: Collection.one() : the collection is empty");
        }else{
            return this.matches[0];
        }
    };
    modula.Collection.prototype.url  = function(){};
    modula.Collection.prototype.ofclass  = function(klass){
        if(klass){
            var c = new modula.Collection();
            for(var i = 0, len = this.matches.length; i < len; i++){
                if(this.matches[i] instanceof klass){
                    c.matches.push(this.matches[i]);
                }
            }
            return c;
        }
        return this;
    };
    modula.Collection.prototype.oftype  = function(type){
        if(type){
            var c = new modula.Collection();
            for(var i = 0, len = this.matches.length; i < len; i++){
                if(typeof this.matches[i] === type){
                    c.matches.push(this.matches[i]);
                }
            }
            return c;
        }
        return this;
    };
    modula.Collection.prototype.limit = function(count){
        return new modula.Collection(this.matches.slice(0,count));
    };
    modula.Collection.prototype.skip = function(count){
        return new modula.Collection(this.matches.slice(count));
    };
    modula.Collection.prototype.reverse = function(){
        return new modula.Collection(this.matches.slice(0,this.matches.length).reverse());
    };
    modula.Collection.prototype.sort = function(cmp,scalar){
        if(cmp === 'scalar' || scalar === 'scalar'){
            if(typeof cmp === 'function'){
                var scalarcmp = function(a,b){
                    return cmp(a) - cmp(b);
                };
            }else{
                var scalarcmp = function(a,b){
                    if( a > b ){
                        return 1;
                    }else if (a === b){
                        return 0;
                    }else{
                        return -1;
                    }
                };
            }
            return new modula.Collection(this.matches.slice(0,this.matches.length).sort(scalarcmp));
        }else{
            if(typeof cmp === 'function'){
                return new modula.Collection(this.matches.slice(0,this.matches.length).sort(cmp));
            }else{
                return new modula.Collection(this.matches.slice(0,this.matches.length).sort());
            }
        }
    };
    modula.Collection.prototype.min = function(cmp,scalar){
        if(cmp !== 'scalar' && scalar !== 'scalar'){
            if(typeof cmp === 'function'){
                return this.sort(cmp).first();
            }else{
                return this.sort().first();
            }
        }else if(this.matches.length === 0){
            return undefined;
        }else{
            var min = this.matches[0], vmin;
            if(typeof cmp === 'function'){
                vmin = cmp(min);
                for(var i = 1, len = this.matches.length; i < len; i++){
                    var v = cmp(this.matches[i]);
                    if(v < vmin){
                        vmin = v;
                        min = this.matches[i];
                    }
                }
                return min;
            }else{
                for(var i = 1, len = this.matches.length; i < len; i++){
                    if(this.matches[i] < min){
                        min = this.matches[i];
                    }
                }
                return min;
            }
        }
    };
    modula.Collection.prototype.max = function(fun,scalar){
        if(cmp !== 'scalar' && scalar !== 'scalar'){
            if(typeof cmp === 'function'){
                return this.sort(cmp).last();
            }else{
                return this.sort().last();
            }
        }else if(this.matches.length === 0){
            return undefined;
        }else{
            var max = this.matches[0], vmax;
            if(typeof cmp === 'function'){
                vmax = cmp(max);
                for(var i = 1, len = this.matches.length; i < len; i++){
                    var v = cmp(this.matches[i]);
                    if(v > vmax){
                        vmax = v;
                        max = this.matches[i];
                    }
                }
                return max;
            }else{
                for(var i = 1, len = this.matches.length; i < len; i++){
                    if(this.matches[i] > max){
                        max = this.matches[i];
                    }
                }
                return max;
            }
        }
    };
    modula.Collection.prototype.shuffle = function(){
        var c = new Collection(this.matches.slice(0,this.matches.length));
        var tmp;
        for(var i = 0, len = c.matches.length; i < len - 1; i++){
            var j = i + Math.floor(Math.random()*(len-i));
            tmp = c.matches[i];
            c.matches[i] = c.matches[j];
            c.matches[j] = tmp;
        }
        return c;
    };
    modula.Collection.prototype.uniques = function(){
        var c = new Collection();
        for(var i = 0, len = this.matches.length; i < len; i++){
            var unique = true;
            for(var j = 0, jlen = c.matches.length; j < jlen; j++){
                if(this.matches[i] === c.matches[j]){
                    unique = false;
                    break;
                }
            }
            if(unique){
                c.matches.push(this.matches[i]);
            }
        }
        return c;
    };
    modula.Collection.prototype.log = function(){
        for(var i = 0, len = this.matches.length; i < len; i++){
            console.log(this.matches[i]);
        }
        return this;
    };

    modula.Collection.prototype.set = function(args){
        for(var i = 0, len = this.matches.length; i < len; i++){
            this.matches[i].set.apply(this.matches[i],arguments);
        }
        return this;
    };
    modula.Collection.prototype.get = function(args){
        var c = new modula.Collection();
        for(var i = 0, len = this.matches.length; i < len; i++){
            var res = this.matches[i].get.apply(this.matches[i],arguments);
            if(res !== undefined){
                c.matches.push(res);
            }
        }
        return c;
    };
})(window.modula);
// Modula 2D Vectors
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

    modula.Vec2 = Vec2;

    var proto = Vec2.prototype;
    
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
// Modula 2D Matrixes
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

    modula.Mat2 = Mat2;

    var proto = Mat2.prototype;

    Mat2.zero = function(){ return new Mat2(0,0,0,0); };
    Mat2.id   = function(){ return new Mat2(1,0,0,1); };
    Mat2.one  = function(){ return new Mat2(1,1,1,1); };

    proto.equals = function(mat){
        return  this.fullType === mat.fullType && 
            epsilonEquals(this.xx, mat.xx) &&
            epsilonEquals(this.xy, mat.xy) &&
            epsilonEquals(this.yx, mat.yx) &&
            epsilonEquals(this.yy, mat.yy);
    };

    proto.clone = function(){
        var m = new Mat2();
        m.xx = this.xx;
        m.xy = this.xy;
        m.yx = this.yx;
        m.yy = this.yy;
        return m;
    };
    
    proto.scale = function(mat){
        var m = this.clone();
        if(m.xx !== undefined){
            m.xx *= mat.xx;
            m.xy *= mat.xy;
            m.yx *= mat.yx;
            m.yy *= mat.yy;
        }else{
            m.xx *= mat;
            m.xy *= mat;
            m.yx *= mat;
            m.yy *= mat;
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
        }else{
            m.xx += mat;
            m.xy += mat;
            m.yx += mat;
            m.yy += mat;
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
        }else{
            m.xx -= mat;
            m.xy -= mat;
            m.yx -= mat;
            m.yy -= mat;
        }
        return m;
    };
    
    proto.neg = function(){
        var m = this.clone();
        m.xx = - this.xx;
        m.xy = - this.xy;
        m.yx = - this.yx;
        m.yy = - this.yy;
        return m;
    };

    proto.mult = function(mat){
        var m = this.clone();
        // xx xy
        // yx yy
        m.xx = this.xx * mat.xx + this.xy * mat.yx;
        m.xy = this.xx * mat.xy + this.xy * mat.yy;
        m.yx = this.yx * mat.xx + this.yy * mat.yx;
        m.yy = this.yx * mat.xy + this.yy * mat.yy;
        return m;
    };

    proto.multVec = function(vec){
        var v = new Vec2();
        v.x = this.xx * vec.x + this.xy * vec.y;
        v.y = this.yx * vec.x + this.yy * vec.y;
        return v;
    };

    proto.det = function(){
        return this.xx * this.yy - this.xy * this.yx;
    };

    proto.invert = function(){
        var m = new Mat2();
        var det = this.det();
        if(det){
            det = 1.0 / det;
            m.xx = det * this.yy;
            m.xy = det * -this.xy;
            m.yx = det * -this.yx;
            m.yy = det * this.xx;
        }
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

    Mat2.rotationDeg = function(angle){
        return Mat2.rotation(angle * modula.degToRad);
    };

    Mat2.scale = function(fac){
        return new Mat2(fac,0,0,fac);
    };

    proto.rotate = function(angle){
        var rot = Mat2.rotation(angle);
        return this.mult(rot);
    };

    proto.rotateDeg = function(angle){
        return this.rotate(angle * modula.degToRad);
    };

    proto.transpose = function(){
        return new Mat2(this.xx,this.yx,this.xy,this.yy);
    };

    proto.diagonal = function(){
        return new Vec2(this.xx,this.yy);
    };

    proto.setDiagonal = function(vec){
        var m = this.clone();
        m.xx = vec.x;
        m.yy = vec.y;
        return m;
    };

    proto.trace = function(){
        return this.xx + this.yy;
    };

    proto.row = function(index){
        if(index === 0){
            return new Vec2(this.xx, this.xy);
        }else if(index === 1){
            return new Vec2(this.yx, this.yy);
        }
    };

    proto.setRow = function(index, vec){
        var m = this.clone();
        if(index === 0){
            m.xx = vec.x;
            m.xy = vec.y;
        }else if(index === 1){
            m.yx = vec.x;
            m.yy = vec.y;
        }
        return m;
    };

    proto.collumn = function(index){
        if(index === 0){
            return new Vec2(this.xx, this.yx);
        }else if(index === 1){
            return new Vec2(this.xy, this.yy);
        }
    };

    proto.setCollumn = function(index, vec){
        var m = this.clone();
        if(index === 0){
            m.xx = vec.x;
            m.yx = vec.y;
        }else if(index === 1){
            m.xy = vec.x;
            m.yy = vec.y;
        }
        return m;
    };

    proto.array = function(){
        return [this.xx, this.xy, this.yx, this.yy];
    };

})(window.modula);
// Modula 2D Homogenous Matrixes
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

    modula.Mat2h = Mat2h;

    var proto  = Mat2h.prototype;
    
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
        m.yy = 1;;
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
    
})(window.modula);
// Modula 2D Transforms
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

    function Transform2(tr){
        tr = tr || {};
        this.pos = tr.pos ? tr.pos.clone() : new Vec2();
        if(tr.scale){
            if(typeof tr.scale === 'number'){
                this.scale = new Vec2(tr.scale,tr.scale);
            }else{
                this.scale = tr.scale.clone();
            }
        }else{
            this.scale = new Vec2(1,1);
        }
        this.rotation = tr.rotation !== undefined ? tr.rotation : 0;

        this.parent = null;
        this.childs = [];

        if(tr.parent){
            tr.parent.addChild(this);
        }
        if(tr.childs){
            for(var i = 0, len = tr.childs.length; i < len; i++){
                this.addChild(tr.childs[i]);
            }
        }
        this.localToParentMatrix = null;
        this.parentToLocalMatrix = null;
        this.localToWorldMatrix  = null;
        this.worldToLocalMatrix  = null;
    }

    modula.Transform2 = Transform2;

    var proto = Transform2.prototype;

    function reset_matrix(tr){
        if(tr.localToParentMatrix){
            tr.localToParentMatrix = null;
            tr.parentToLocalMatrix = null;
            tr.localToWorldMatrix  = null;
            tr.worldToLocalMatrix  = null;
            for(var i = 0, len = tr.childs.length; i < len; i++){
                reset_matrix(tr.childs[i]);
            }
        }
    }
    function make_matrix(tr){
        if(!tr.localToParentMatrix){
            tr.localToParentMatrix = new Mat2h.transform(tr.scale,tr.rotation,tr.pos);
            tr.parentToLocalMatrix = tr.localToParentMatrix.invert();
            if(tr.parent){
                make_matrix(tr.parent);
                tr.localToWorldMatrix = tr.parent.localToWorldMatrix.mult(tr.localToParentMatrix);
                tr.worldToLocalMatrix = tr.localToWorldMatrix.invert();
            }else{
                tr.localToWorldMatrix = tr.localToParentMatrix;
                tr.worldToLocalMatrix = tr.parentToLocalMatrix;
            }
        }
    }

    proto.getLocalToParentMatrix = function(){
        if(!this.localToParentMatrix){
            make_matrix(this);
        }
        return this.localToParentMatrix;
    };

    proto.getParentToLocalMatrix = function(){
        if(!this.parentToLocalMatrix){
            make_matrix(this);
        }
        return this.parentToLocalMatrix;
    };

    proto.getLocalToWorldMatrix = function(){
        if(!this.localToWorldMatrix){
            make_matrix(this);
        }
        return this.localToWorldMatrix;
    };

    proto.getWorldToLocalMatrix = function(){
        if(!this.worldToLocalMatrix){
            make_matrix(this);
        }
        return this.worldToLocalMatrix;
    };

    proto.getDistantToLocalMatrix = function(dist){
        return this.getWorldToLocalMatrix().mult(dist.getLocalToWorldMatrix());
    }

    proto.getLocalToDistantMatrix = function(dist){
        return this.getLocalToWorldMatrix().mult(dist.getWorldToLocalMatrix());
    }

    proto.equals = function(tr){
        return  this.fullType === tr.fullType &&
            this.pos.equals(tr.pos) &&
            epsilonEquals(this.rotation, tr.rotation) &&
            epsilonEquals(this.scale.x, tr.scale.y);
    };

    proto.clone = function(){
        var tr = new Transform2();
        tr.pos  = this.pos.clone();
        tr.scale = this.scale.clone();
        tr.rotation = this.rotation;
        return tr;
    };

    proto.setPos = function(vec){
        this.pos.x = vec.x;
        this.pos.y = vec.y;
        reset_matrix(this);
        return this;
    };

    proto.setScale = function(scale){
        if((typeof scale) === 'number'){
            this.scale.x = scale;
            this.scale.y = scale;
        }else{
            this.scale.x = scale.x; 
            this.scale.y = scale.y; 
        }
        reset_matrix(this);
        return this;
    };

    proto.setRotation = function(rotation){
        this.rotation = rotation;
        reset_matrix(this);
        return this;
    };

    proto.setRotationDeg = function(rotation){
        this.rotation = rotation * degToRad;
        reset_matrix(this);
        return this;
    };

    proto.getPos = function(){
        return this.pos.clone();
    };

    proto.getScale = function(){
        return this.scale.clone();
    };

    proto.getRotation = function(){
        return this.rotation;
    };
    
    proto.getRotationDeg = function(){
        return this.rotation * radToDeg;
    };

    proto.getWorldPos = function(){
        return this.getLocalToWorldMatrix().multVec(new Vec2());
    };

    proto.parentToLocal = function(vec){
        return this.getParentToLocalMatrix().multVec(vec);
    };

    proto.worldToLocal = function(vec){
        return this.getWorldToLocalMatrix().multVec(vec);
    };

    proto.localToParent = function(vec){
        return this.getLocalToParentMatrix().multVec(vec);
    };

    proto.localToWorld = function(vec){
        return this.getLocalToWorldMatrix().multVec(vec);
    };
    
    proto.distantToLocal = function(distTransform, vec){
        vec = distTransform.localToWorld(vec);
        return this.worldToLocal(vec);
    };

    proto.localToDistant = function(dist, vec){
        vec = this.localToWorld(vec);
        return dist.worldToLocal(vec);
    };

    proto.X = function(){
        return this.localToWorld(new Vec2(1,0)).sub(this.getWorldPos()).normalize();
    };

    proto.Y = function(){
        return this.localToWorld(new Vec2(0,1)).sub(this.getWorldPos()).normalize();
    };

    proto.dist = function(tr){
        return tr.getWorldPos().sub(this.getWorldPos());
    };

    proto.addChild = function(tr){
        if(tr.parent != this){
            tr.makeRoot();
            tr.parent = this;
            this.childs.push(tr);
        }
        return this;
    };

    proto.remChild = function(tr){
        if(tr && tr.parent === this){
            tr.makeRoot();
        }
        return this;
    };

    proto.getChildCount = function(){
        return this.childs.length;
    };

    proto.getChild = function(index){
        return this.childs[index];
    };

    proto.getRoot  = function(){
        if(this.parent){
            return this.parent.getRoot();
        }else{
            return this;
        }
    };

    proto.makeRoot = function(){
        if(this.parent){
            var pchilds = this.parent.childs;
            for(var i = 0; i < pchilds.length; i++){
                while(pchilds[i] === this){
                    pchilds.splice(i,1);
                }
            }
            this.parent = null;
        }
        return this;
    };

    proto.isLeaf   = function(){ return this.childs.length === 0; };

    proto.isRoot   = function(){ return !this.parent; };

    proto.rotate = function(angle){ 
        this.rotation += angle;
        reset_matrix(this);
        return this;
    };

    proto.rotateDeg = function(angle){
        this.rotation += angle * degToRad;
        reset_matrix(this);
        return this;
    };

    proto.scale = function(scale){
        this.scale.x *= scale.x;
        this.scale.y *= scale.y;
        reset_matrix(this);
        return this;
    };

    proto.scaleFac = function(f){
        this.scale.x *= f;
        this.scale.y *= f;
        reset_matrix(this);
        return this;
    };

    proto.translate = function(deltaPos){
        this.pos.x += deltaPos.x;
        this.pos.y += deltaPos.y;
        reset_matrix(this);
        return this;
    };


})(window.modula);
// Modla 2D Bounding Volumes
window.modula = window.modula || {};
(function(modula){

    function Bound(){
    }
    modula.Bound = Bound;
    // A bounding rectangle
    // x,y the minimum coordinate contained in the rectangle
    // sx,sy the size of the rectangle along the x,y axis
    function Rect(x,y,sx,sy,centered){
        this.sx = sx;           // width of the rectangle on the x axis
        this.sy = sy;           // width of the rectangle on the y axis
        this.hx = sx/2;         // half of the rectangle width on the x axis
        this.hy = sy/2;         // half of the rectangle width on the y axis
        this.x  = x;            // minimum x coordinate contained in the rectangle  
        this.y  = y;            // minimum y coordinate contained in the rectangle
        this.cx = x + this.hx;   // x coordinate of the rectangle center
        this.cy = y + this.hy;   // y coordinate of the rectangle center
        this.mx = this.x + sx;   // maximum x coordinate contained in the rectangle
        this.my = this.y + sy;   // maximum x coordinate contained in the rectangle
        if(centered){
            this.x -= this.hx;
            this.cx -= this.hx;
            this.mx -= this.hx;
            this.y -= this.hy;
            this.cy -= this.hy;
            this.my -= this.hy;
        }
    }

    modula.Rect = Rect;

    Rect.prototype = new Bound();
    Rect.prototype.min = function(){  return new Vec2(this.x, this.y); };
    Rect.prototype.minX = function(){ return this.x; };
    Rect.prototype.minY = function(){ return this.y; };
    Rect.prototype.max = function(){  return new Vec2(this.mx, this.my); };
    Rect.prototype.maxX = function(){ return this.mx; };
    Rect.prototype.maxY = function(){ return this.my; };
    Rect.prototype.size = function(){ return new Vec2(this.sx, this.sy); };
    Rect.prototype.center = function(){return new Vec2(this.cx, this.cy); };
    Rect.prototype.equals = function(b){ return ( this.cx === b.cx && this.cy === b.cy && this.sx === b.sx && this.sy === b.sy); };
    Rect.prototype.clone  = function(){  return new Rect(this.x,this.y,this.sx, this.sy)};
    Rect.prototype.cloneAt = function(center){ return new Rect(center.x - this.hx, center.y -this.hy, this.sx, this.sy); };

    //intersect line a,b with line c,d, returns null if no intersection
    function lineIntersect(a,b,c,d){
        // http://paulbourke.net/geometry/lineline2d/
        var f = ((d.y - c.y)*(b.x - a.x) - (d.x - c.x)*(b.y - a.y)); 
        if(f == 0){
            return null;
        }
        f = 1 / f;
        var fab = ((d.x - c.x)*(a.y - c.y) - (d.y - c.y)*(a.x - c.x)) * f ;
        if(fab < 0 || fab > 1){
            return null;
        }
        var fcd = ((b.x - a.x)*(a.y - c.y) - (b.y - a.y)*(a.x - c.x)) * f ;
        if(fcd < 0 || fcd > 1){
            return null;
        }
        return new Vec2(a.x + fab * (b.x-a.x), a.y + fab * (b.y - a.y) );
    }

    // returns an unordered list of vector defining the positions of the intersections between the ellipse's
    // boundary and a line segment defined by the start and end vectors a,b

    Rect.prototype.collideSegment = function(a,b){
        var collisions = [];
        var corners = [ new Vec2(this.x,this.y), new Vec2(this.x,this.my), 
                        new Vec2(this.mx,this.my), new Vec2(this.mx,this.y) ];
        var pos = lineIntersect(a,b,corners[0],corners[1]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[1],corners[2]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[2],corners[3]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[3],corners[0]);
        if(pos) collisions.push(pos);
        return collisions;
    };
    Rect.prototype.contains = function(arg){
        if(arg instanceof Vec2){
            return ( arg.x >= this.x && arg.x <= this.mx &&
                     arg.y >= this.y && arg.y <= this.my );
        }else if(arguments.length === 2){
            return this.contains(new Vec2(arguments[0],arguments[1]));
        }else if( arg instanceof Rect){
            return (arg.x >= this.x && arg.mx <= this.mx &&
                    arg.y >= this.y && arg.my <= this.my );
        }else if(arg instanceof Bound){
            return (arg.minX() >= this.x && arg.maxX() <= this.mx &&
                    arg.minY() >= this.y && arg.maxY() <= this.my );
        }
        return false;
    };

    function boundCollides(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            return amax > bmin;
        }else{
            return amin < bmax;
        }
    }
    
    function boundEscapeDist(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            var disp = bmin - amax;
            if(disp >= 0){
                return 0;
            }else{
                return disp;
            }
        }else{
            var disp = bmax - amin;
            if(disp <= 0){
                return 0;
            }else{
                return disp;
            }
        }
    }

    Rect.prototype.collides = function(b){
        return boundCollides(this.x, this.mx, b.x, b.mx) && 
               boundCollides(this.y, this.my, b.y, b.my);
    };
    
    Rect.prototype.collisionAxis = function(b){
        var dx = boundEscapeDist(this.x, this.mx, b.x, b.mx); 
        var dy = boundEscapeDist(this.y, this.my, b.y, b.my);
        if( Math.abs(dx) < Math.abs(dy) ){
            return new Vec2(dx,0);
        }else{
            return new Vec2(0,dy);
        }
    };
    
    Rect.prototype.collisionVector = function(b){
        return new Vec2( 
            boundEscapeDist(this.x, this.mx, b.x, b.mx),
            boundEscapeDist(this.y, this.my, b.y, b.my)  
        );
    };
    Rect.prototype.transform = function(mat){
        if(Transform2 && (mat instanceof Transform2)){
            mat = mat.getLocalToWorldMatrix();
        }else if(!(mat instanceof Mat2h)){
            mat = new Mat2h(mat);
        }
        var v1,v2,v3,v4,x,y,mx,my;

        v1 = mat.multVec(new Vec2(this.cx-this.hx, this.cy-this.hy));
        v2 = mat.multVec(new Vec2(this.cx-this.hx, this.cy+this.hy));
        v3 = mat.multVec(new Vec2(this.cx+this.hx, this.cy-this.hy));
        v4 = mat.multVec(new Vec2(this.cx+this.hx, this.cy+this.hy));

        x = Math.min(Math.min(v1.x,v2.x),Math.min(v3.x,v4.x));
        y = Math.min(Math.min(v1.y,v2.y),Math.min(v3.y,v4.y));
        mx = Math.max(Math.max(v1.x,v2.x),Math.max(v3.x,v4.x));
        my = Math.max(Math.max(v1.y,v2.y),Math.max(v3.y,v4.y));

        return new Rect((x+mx)*0.5,(y+my)*0.5,mx-x,my-y);
    };
    Rect.prototype.translate = function(vec){
        return new Rect(this.x+vec.x,this.y+vec.y,this.sx,this.sy);
    };

    Rect.prototype.toString = function(){
        return "["+this.cx+","+this.cy+"|"+this.sx+","+this.sy+"]";
    };
})(window.modula);
// Modula Engine
window.modula = window.modula || {};
(function(modula){

    var Vec2 = modula.Vec2;
    var Mat2 = modula.Mat2;
    var Transform2 = modula.Transform2;

    function getNewUid(){
        uid += 1;
        return uid;
    }
    function array_remove(array, element){
        array.splice(array.indexOf(element),1);
        return array;
    }
    function array_contains(array, element){
        return array.indexOf(element) >= 0;
    }
    modula.Main = modula.Class.extend({
        init: function(options){
            this._nextUid  = 0;
            this.input = null;
            this.scene = null;
            this.sceneList = [];
            this.rng = null;
            this.running = false;
            this.restartTime = -1;
            this.frame = 0;
            this.time = 0;
            this.timeSystem = 0;
            this.startTime = 0;
            this.fps = options.fps || 60;
            this.fixedDeltaTime = 1 / this.fps;
            this.deltaTime = 1 / this.fps
            if(options.input){
                this.set('input',(options.input));
            }
            if(options.scene){
                this.add(options.scene);
            }
        },
        getNewUid: function(){
            this._nextUid += 1;
            return this._nextUid;
        },
        _add_default: function(scene){
            this._add_scene(scene);
        },
        _add_scene: function(scene){
            scene.main = this;
            this.sceneList.push(scene);
            if(!this.scene){
                this.scene = scene;
            }
            if(!scene._uid){
                scene._uid = this.getNewUid();
            }
        },
        _set_input:   function(input){
            this.input = input;
            input.main = this;
        },
        _set_fps: function(fps){
            this.fps = fps;
            this.fixedDeltaTime = 1/fps;
            this.deltaTime = 1/fps;
        },
        exit:       function(){
            this.running = false;
        },
        runStart:   function(){
            var date = new Date();
            this.running = true;
            this.startTime = date.getTime() * 0.001;
            this.time = 0;
            this.timeSystem = this.startTime;
            this.restartTime = -1;
            this.frame = 0;
        },
        runFrame:   function(){
            var date = new Date();
            this.deltaTime  = date.getTime() * 0.001 - this.timeSystem;
            this.timeSystem = date.getTime() * 0.001;
            this.time = this.timeSystem - this.startTime;

            if(this.input){
                this.input.processEvents();
            }
            for(i = 0; i < this.sceneList.length; i++){
                var redraw = false;
                this.scene = this.sceneList[i];
                var camera = this.scene.camera;
                var renderer = this.scene.renderer;
                if(!this.scene._started){
                    this.scene._started = true;
                    this.scene.time = this.time;
                    this.scene.startTime = this.time;
                    this.scene.onSceneStart();
                }
                this.scene.onFrameStart();

                redraw = this.scene.runFrame(this.deltaTime);
                
                if(camera && renderer && (redraw || renderer.alwaysRedraw || renderer.mustRedraw())){
                    if(renderer.zsort){
                        scene._rootEntityList.sort(function(a,b){
                            var za = a.zindex || 0;
                            var zb = b.zindex || 0;
                            return (za - zb);
                        });
                    }
                    renderer.drawFrame(this.scene,camera);
                }
                this.scene.onFrameEnd();
            }
        
            this.frame += 1;

        },
        runEnd: function(){
        },
        run: function(){
            var self = this;
            if(self.running){
                return;
            }
            self.running = true;
            self.runStart();

            function loop(){
                if(self.running && (self.restartTime < 0 || self.time < self.restartTime)){
                    self.runFrame();
                    var elapsedTimeMillis = ((new Date).getTime() - self.timeSystem);
                    var waitTime = (self.fixedDeltaTime * 1000) - elapsedTimeMillis;
                    if(waitTime < 0){
                        waitTime = 0;
                    }
                    //setTimeout(loop,waitTime);
                    webkitRequestAnimationFrame(loop,waitTime);
                }else{
                    self.runEnd();
                    if(self.running){
                        self.run();
                    }
                }
            }
            loop();
        },
        restart:    function(delay){
            this.restartTime = this.time;
        },
    });

    modula.Input = modula.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            this._mouseStatus = 'out'; // 'out' | 'over' | 'entering' | 'leaving'
            this._mouseStatusPrevious = 'out';
            this._mouseStatusSystem = 'out';

            this._mousePosSystem = new Vec2();
            this._mousePos = new Vec2();
            this._mousePosPrevious = new Vec2();
            this._mousePosDelta = new Vec2();

            this._mouseDragPos = new Vec2();
            this._mouseDragDeltaPos = new Vec2();
            this._mouseDrag = 'no'; // 'no' | 'dragging' | 'dragStart' | 'dragEnd'
            this._mouseEvents = [];

            this._keyStatus = {}; // 'up' | 'down' | 'press' | 'release' , undefined == 'up'
            this._keyUpdateTime = {};
            this._keyEvents = [];

            this._alias = {};
            this.main   = null;
            this.setAlias({
                'mouse-left'  : 'mouse0',
                'mouse-middle': 'mouse1',
                'mouse-right' : 'mouse2',
            });
            this.setAlias(options.alias || {});

            
            var $elem = options.$elem || $(options.selector || 'body');
            
            $elem.keyup(function(e){
                self._keyEvents.push({type:'up', key: String.fromCharCode(e.which).toLowerCase()});
            });
            $elem.keydown(function(e){
                self._keyEvents.push({type:'down', key: String.fromCharCode(e.which).toLowerCase()});
            });
            
            function relativeMouseCoords(domElement,event){
                var totalOffsetX = 0;
                var totalOffsetY = 0;
                
                do{
                    totalOffsetX += domElement.offsetLeft;
                    totalOffsetY += domElement.offsetTop;
                }while((domElement = domElement.offsetParent));
                
                return new Vec2(
                    event.pageX - totalOffsetX,
                    event.pageY - totalOffsetY 
                );
            }
            function eventMousemove(event){
                self._mousePosSystem = relativeMouseCoords(this,event);
            }
            
            $elem[0].addEventListener('mousemove',eventMousemove,false);
            
            function eventMouseover(event){
                self._mouseStatusSystem = 'over';
            }
            
            $elem[0].addEventListener('mouseover',eventMouseover,false);

            function eventMouseout(event){
                self._mouseStatusSystem = 'out';
            }
            $elem[0].addEventListener('mouseout',eventMouseout,false);
            
            function eventMousedown(event){
                self._keyEvents.push({type:'down', key:'mouse'+event.button});

            }
            $elem[0].addEventListener('mousedown',eventMousedown,false);

            function eventMouseup(event){
                self._keyEvents.push({type:'up', key:'mouse'+event.button});
            }
            $elem[0].addEventListener('mouseup',eventMouseup,false);
            
        },
        processEvents: function(){
            var time = this.main.timeSystem;
            
            for(var i = 0; i < this._keyEvents.length; i++){
                var e =  this._keyEvents[i];
                var previous = this._keyStatus[e.key];
                if(e.type === 'up'){
                    if(previous === 'down' || previous === 'press'){
                        this._keyStatus[e.key] = 'release';
                    }else{
                        this._keyStatus[e.key] = 'up';
                    }
                }else if(e.type === 'down'){
                    if(previous !== 'down'){
                        this._keyStatus[e.key] = 'press';
                    }
                    if(previous === 'press'){
                        this._keyStatus[e.key] = 'down';
                    }
                }
                this._keyUpdateTime[e.key] = time;
            }
            for(key in this._keyStatus){
                if(this._keyUpdateTime[key] === undefined || this._keyUpdateTime[key] < time ){
                    var status = this._keyStatus[key];
                    if(status === 'press'){
                        this._keyStatus[key] = 'down';
                    }else if(status === 'release'){
                        this._keyStatus[key] = 'up';
                    }
                    this._keyUpdateTime[key] = time;
                }
            }
            this._keyEvents = [];

            this._mousePosPrevious = this._mousePos || new Vec2();
            this._mousePos = this._mousePosSystem || new Vec2();
            this._mousePosDelta = this._mousePos.sub(this._mousePosPrevious);
            
            this._mouseStatusPrevious = this._mouseStatus;
            if(this._mouseStatusSystem === 'over'){
                if(this._mouseStatus === 'out' || this._mouseStatus === 'leaving'){
                    this._mouseStatus = 'entering';
                }else{ // over || entering
                    this._mouseStatus = 'over';
                }
            }else{ //out
                if(this._mouseStatus === 'over' || this._mouseStatus === 'entering'){
                    this._mouseStatus = 'leaving';
                }else{  // leaving || out
                    this._mouseStatus = 'out';
                }
            }
        },

        /* key: a,b,c,...,y,z,1,2,..0,!,    _,$,...,
         * 'left','right','up','down','space',
         * 'alt','shift','left-shift','right-shift','ctrl','super',
         * 'f1','f2','enter','esc','insert','delete','home','end',
         * 'pageup','pagedown'
         * 'mouseX','mouse-left','mouse-right','mouse-middle','scroll-up','scroll-down'
         */

        // return true the first frame of a key being pressed
        isKeyPressing : function(key){
            key = this.getAlias(key);
            return this._keyStatus[key] === 'press';
        },
        // return true the first frame of a key being depressed
        isKeyReleasing : function(key){
            key = this.getAlias(key);
            return this._keyStatus[key] === 'release';
        },
        // return true as long as a key is pressed
        isKeyDown: function(key){
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === 'down' || s === 'press';
        },
        // return true as long as a key is depressed. equivalent to !isKeyDown() 
        isKeyUp: function(key){
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === undefined || s === 'up' || s === 'release';
        },

        // return true if the mouse is over the canvas
        isMouseOver: function(){
            return this._mouseStatus === 'over' || this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is over the canvas
        isMouseEntering: function(){
            return this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is outside the canvas
        isMouseLeaving: function(){
            return this._mouseStatus === 'leaving';
        },
        // return -1 if scrolling down, 1 if scrolling up, 0 if not scrolling
        getMouseScroll: function(){
            if ( this.isKeyDown('scroll-up')){
                return 1;
            }else if (this.isKeyDown('scroll-down')){
                return -1;
            }
            return 0;
        },
        // returns the mouse position over the canvas in pixels
        getMousePos: function(){
            return this._mousePos;
        },
        setAlias: function(action,key){
            if(typeof action === 'object'){
                var aliases = action;
                for(act in aliases){
                    this.setAlias(act,aliases[act]);
                }
            }
            this._alias[action] = key;
        },
        getAlias: function(alias){
            while(alias in this._alias){
                alias = this._alias[alias];
            }
            return alias;
        },
    });

    modula.Camera = modula.Class.extend({
        scene: null,
        main: null, 
        transform : new Transform2(),
        onUpdate : function(){},
        getMouseWorldPos: function(){
            if(!this.main || !this.main.input){
                return new Vec2();
            }
            var mpos = this.main.input.getMousePos();
            if(this.scene.renderer){
                mpos = mpos.sub(this.scene.renderer.get('size').scale(0.5));
            }
            mpos = this.transform.localToWorld(mpos);
            return mpos;
        },
        _get_pos: function(){
            return this.transform.getPos();
        },
        _set_pos: function(pos){
            this.transform.setPos(pos);
        },
        _get_scale: function(){
            return this.transform.scale;
        },
        _get_scaleFac: function(){
            return Math.max(this.transform.scale.x,this.transform.scale.y);
        },
        _set_scale: function(scale){
            this.transform.setScale(scale);
        },
        _get_rotation: function(){
            return this.transform.rotation;
        },
        _set_rotation: function(rot){
            this.transform.setRotation(rot);
        },
        _get_bound: function(){
            var pos = this.transform.getPos();
            var size = this.scene.renderer.get('size');
            return new modula.Rect(pos.x,pos.y,
                    size.x*this.transform.scale.x,
                    size.y*this.transform.scale.y,'centered');
        },
    });

    modula.Camera2d = modula.Camera.extend({
        height: 1,
        parallax: false,
    });

    modula.Renderer = modula.Class.extend({
        _size : new Vec2(),
        alwaysRedraw:true,
        renderBackground: function(){},
        drawFrame: function(scene,camera){},
        passes : [],
        mustRedraw: function(){
            return false;
        },
    });
    
    modula.Renderer.Drawable = modula.Class.extend({
        pass: null,
        draw: function(renderer, entity, camera){},
    });

    modula.Renderer.Drawable2d = modula.Renderer.Drawable.extend({
        zindex: 0,
        height: 0,
    });

    
    modula.RendererCanvas2d = modula.Renderer.extend({
        init: function(options){
            options = options || {};
            this.canvas = options.canvas || this.canvas; 
            this.alwaysRedraw = options.alwaysRedraw;
            if(!this.canvas){ console.log('ERROR: please provide a canvas!'); }
            this.context = this.canvas.getContext('2d');
            this.background = options.background;
            this.compose = options.compose || 'source-over'; 
            this.globalAlpha = options.globalAlpha || 1; 
            this._get_size = options.getSize || this._get_size;
            this._size = new Vec2();
            this.passes = options.passes || this.passes;
        },
        _get_size: function(){
            return new Vec2(this.canvas.width, this.canvas.height);
        },
        mustRedraw: function(){
            return !this._size.equals(this.get('size'));
        },
        drawInit: function(camera){
            if(modula.draw){
                modula.draw.setContext(this.context);
            }
            
            this._size = this.get('size');
            canvas.width = this._size.x;
            canvas.height = this._size.y;

            this.context.save();
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
            if(this.background){
                this.context.fillStyle = this.background;
                this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
            }
            this.context.globalCompositeOperation = this.compose;
            this.context.globalAlpha = this.globalAlpha;
            if(camera){
                this.context.translate(this.canvas.width/2, this.canvas.height/2);
                if(camera.parallax && camera.height){
                    this.context.scale( 1/(camera.transform.scale.x * camera.height), 
                                        1/(camera.transform.scale.y * camera.height));
                }else{
                    this.context.scale(1/camera.transform.scale.x, 1/camera.transform.scale.y);
                }
                this.context.rotate(-camera.transform.rotation);
                this.context.translate(-camera.transform.pos.x,-camera.transform.pos.y);
            }
        },
        drawEnd: function(){
            context.restore();
        },
        drawFrame: function(scene,camera){
            this.drawInit(camera);
            for(var i = 0, len = this.passes.length; i < len; i++){
                this.drawPass(scene,camera,this.passes[i]);
            }
            this.drawPass(scene,camera,null);
            for(var i = 0, len = scene._entityList.length; i < len; i++){
                scene._entityList[i].onDrawGlobal();
            }
            this.drawEnd();
        },
        drawPass: function(scene,camera,pass){
            var self = this;
            
            function drawEntity(ent,pass){
                self.context.save();
                self.context.translate(ent.transform.pos.x, ent.transform.pos.y);
                self.context.scale(ent.transform.scale.x, ent.transform.scale.y);
                self.context.rotate(ent.transform.rotation);
                if(ent.render){
                    var drawables = ent.drawable;
                    if(!drawables){
                        drawables = [];
                    }else if (!(drawables instanceof Array)){
                        drawables = [drawables];
                    }
                    for(var i = 0, len = drawables.length; i < len; i++){
                        var drawable = drawables[i];
                        self.context.save();
                        if(camera.parallax && camera.height && drawable.height){
                            var fac = camera.height / (camera.height - drawable.height);
                            var cpos = camera.transform.pos;
                            cpos = cpos.scale(1-fac);
                            context.translate(cpos.x,cpos.y);
                            context.scale(fac,fac);
                        }
                        if(pass){
                            if(drawable.pass === pass){
                                drawable.draw(self,ent,camera);
                            }
                        }else{
                            if(!drawable.pass){
                                drawable.draw(self,ent,camera);
                            }
                        }
                        self.context.restore();
                    }
                    if(!pass){
                            ent.onDrawLocal();
                    }
                }
                if(ent.renderChilds){
                    for(var i = 0, len = ent.transform.getChildCount(); i < len; i++){
                        drawEntity(ent.transform.getChild(i).ent,pass);
                    }
                }
                self.context.restore();
            }
            for(var i = 0, len = scene._rootEntityList.length; i < len; i++){
                var ent = scene._rootEntityList[i];
                drawEntity(ent,pass);
            }
        },
    });
    
    modula.RendererCanvas2d.SpriteMap = modula.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            this._image = options.image || null;
            this._src = options.src;
            this.centered = options.centered || this.centered;
            this.compose  = options.compose  || this.compose;
            this.pass     = options.pass     || this.pass;
            this.height   = options.height   || this.height;

            if(this._src === undefined){
                this._src = this.image.src;
            }else{
                this._image = new Image();
                this._image.src = this._src;
            }

            function onload(){
                self._size = new Vec2(self._image.width, self._image.height);
            }
            this._image.onload = onload;
            onload();

            if(options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this._cellSize = new Vec2(options.cellSize, options.cellSize);
                }else{
                    this._cellSize = options.cellSize.clone();
                }
            }else{ 
                this._cellSize = this.get('cellSize') || new Vec2(32,32);
            }
            this._sprites = {};
            this._spriteNames = [];
            if(options.sprites){
                for(var i = 0, l = options.sprites.length; i < l; i++){
                    var sub = options.sprites[i];
                    this._sprites[sub.name] = sub;
                    this._spriteNames.push(sub.name);
                }
            }
        },
        _set_sprite: function(name,index,size){
            this._sprites[name] = { index: index, size: size };
            this._spriteNames.push(name);
        },
        _get_sprite: function(name,options){
            options = options || {};
            var sprite = this._sprites[name];
            if(sprite){
                console.log(this);
                arg = {
                    image: this._image,
                    src_x: sprite.index[0] * this._cellSize.x,
                    src_y: sprite.index[1] * this._cellSize.y,
                    src_sx: (sprite.size ? sprite.size[0] : 1) * this._cellSize.x,
                    src_sy: (sprite.size ? sprite.size[1] : 1) * this._cellSize.y,
                    compose: sprite.compose || this.compose || 'source-over',
                    centered: sprite.centered || this.centered || false,
                    pass: sprite.pass || this.pass || undefined,
                    height: sprite.height || this.height || 0,
                };
                for( key in options){
                    arg[key] = options[key];
                }
                return new modula.RendererCanvas2d.DrawableSprite(arg);
            }
        },
    });
    modula.RendererCanvas2d.DrawableSprite = modula.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            var self = this;

            this._image = options.image || null;
            this._src   = options.src;
            this.centered = options.centered || false;
            this.pass   = options.pass || this.pass;
            this.scale  = options.scale || this.scale;
            this.rotation  = options.rotation || this.rotation;
            this.height    = options.height || this.height;
            this.zindex    = options.zindex || this.zindex;

            if(this._src === undefined){
                this._src = this._image.src;
            }else{
                this._image = new Image();
                this._image.src = this._src;
            }

            function onload(){
                self.z     = options.z || 0;    
                self.alpha = options.alpha;
                self.compose = options.compose;
                self._src_x  = options.src_x  || 0;
                self._src_y  = options.src_y  || 0;
                self._src_sx = options.src_sx || self._image.width;
                self._src_sy = options.src_sy || self._image.height;
                self._dst_x  = options.dst_x  || 0;
                self._dst_y  = options.dst_y  || 0;
                self._dst_sx = options.dst_sx || self._src_sx;
                self._dst_sy = options.dst_sy || self._src_sy;

                self.pos   = options.pos ? options.pos.clone() : new Vec2();
            }
            this._image.onload = onload;
            onload();
        },
        clone: function(){
            return new modula.RendererCanvas2d.DrawableSprite({
                image : this._image,
                pos   : this.pos,
                alpha : this.alpha,
                scale: this.scale,
                rotation: this.rotation,
                pass  : this.pass,
                centered : this.centered,
                height: this.height,
                zindex: this.zindex,
                compose: this.compose,
                src_x : this._src_x,
                src_y : this._src_y,
                src_sx: this._src_sx,
                src_sy: this._src_sy,
                dst_x : this._dst_x,
                dst_y : this._dst_y,
                dst_sx: this._dst_sx,
                dst_sy: this._dst_sy,
            });
        },
        draw: function(renderer,ent,camera){
            var context = renderer.context;
            context.save();
            if(this.alpha !== undefined){
                context.globalAlpha *= this.alpha;
            }
            if(this.compose){
                context.globalCompositeOperation = this.compose;
            }
            if(this.scale){
                context.scale(this.scale,this.scale);
            }
            if(this.rotation){
                context.rotate(this.rotation);
            }
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            if(this.centered){
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x - this._dst_sx/2, 
                        this._dst_y + this.pos.y - this._dst_sy/2,
                        this._dst_sx, this._dst_sy );
            }else{
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x, this._dst_y + this.pos.y,
                        this._dst_sx, this._dst_sy );
            }
            context.restore();
        },
    });

    
    modula.Scene = modula.Class.extend({
        init: function(options){
            options = options || {};
            this._started = false;
            this._entityList = [];
            this._rootEntityList = [];
            this._newEntityList = [];
            this._destroyedEntityList = [];
            this._uid = options.uid || this._uid || undefined;

            this.frame = 0;
            this.time = 0;
            this.startTime = -1;
            this.timeSpeed = 1;
            this.deltaTime = 1;

            this._entityByUid = {};
            this._entityByName = {};
            this.camera = options.camera || null; 
            this.renderer = options.renderer || null;
            this.name = options.name || 'Scene';
            this.main = null;
            this.passes = options.passes || this.passes || {};
            this.passSequence = options.passSequence || this.passSequence || [
                'instantiation',
                'camera',
                'update',
                'physics',
                'animations',
                'collision',
                'destruction',
                'draw',
                ];
        },
        addPass : function(name, pass){
            this.passes[name] = pass;
        },
        //returns a list of entities matching the url and satisfying the
        //condition:
        //url : name[/name[/...]]
        //  name is either :
        //      'camera' : will match the scene current camera, (only at root
        //                 url level)
        //      uid      : will match the entity with the an uid equal to the
        //                 uid provided
        //      *          will match all entities (but not the camera)
        //      string   : will match any entity with name equal to string
        //  
        //  '/' selects the child entities: a/b/c will select the entity of
        //  name 'c' that are childs of entity of name 'b' that are childs of
        //  entityes of name 'a'
        //
        //  the optional condition is a function with a single parameter that
        //  will be called on each matched entity. if the function returns
        //  false, the entity will be removed from the matched entities.
        //
        //  if the condition is === true, then all entities match
        query: function(query){
            if(!modula.Collection){
                return undefined;
            }
            if(query instanceof modula.Camera){
                return new modula.Collection([this.camera]);
            }else if(query instanceof modula.Class){
                var matches = [];
                for(var i = 0, len = this._entityList.length; i < len; i++){
                    if(this._entityList[i] instanceof query){
                        matches.push(this._entityList[i]);
                    }
                }
                return new modula.Collection(matches);
            }else if(typeof query === 'string'){
                return this._urlquery(query);
            }else{
                return new modula.Collection();
            }
        },
        _urlquery: function(url){
            var matches = [];
            var path = url.split('/');
            for(var i = 0; i < path.length; i++){
                var name = path[i];
                if( name === ''){
                        break;
                }else if(i === 0){
                    if(name === 'camera'){
                        matches.push(this.camera);
                    }else if(name === '*'){
                        for(var j = 0; j < this._rootEntityList.length; j++){
                            matches.push(this._rootEntityList[j]);
                        }
                    }else if(this._entityByUid[name]){
                        matches.push(this._entityByUid[name]);
                    }else{
                        ents = this._entityByName[name] || [];
                        for(var j = 0; j < ents.length; j++){
                            matches.push(ents[j]);
                        }
                    }
                }else{
                    var nmatches = [];
                    for(var k = 0; k < matches.length; k++){
                        var ent = matches[k];
                        if(!ent.transform){
                            continue;
                        }
                        for(var l = 0; l < ent.tranfsorm.getChildCount(); l++){
                            var child = ent.transform.getChild(l);
                            if(name === '*'){
                                nmatches.push(child);
                            }else if(child.name === name){
                                nmatches.push(child);
                            }else if(child._uid === name){
                                nmatches.push(child);
                            }
                        }
                    }
                    matches = nmatches;
                }
            }
            return new modula.Collection(matches);
        },
        // remove all the entities found by the selector if it is a string,
        // or removes the entity if selector is an entity
        // adds an entity to the scene. It will be
        // considered present in the scene at the next update.
        _addEnt: function(ent){
            if(ent.main && ent.main !== this.main){
                throw new Error('Cannot add an entity to the scene: it belongs to another modula instance');
                return;
            }else if(this.main){
                ent.main = this.main;
                if(!ent._uid){
                    ent._uid = this.main.getNewUid();
                }
            }
            if(ent.scene && ent.scene !== this){
                ent.scene._remEnt(ent);
            }
            if(ent.scene !== this){
                ent.scene = this;
                this._newEntityList.push(ent);
                this._entityByUid[ent.get('uid')] = ent;
                var name = ent.get('name');
                if(!(name in this._entityByName)){
                    this._entityByName[name] = [ent];
                }else{
                    this._entityByName[name].push(ent);
                }
            }
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this._addEnt(ent.getChild(i));
                }
            }
        },
        //remove an entity to the scene. 
        _remEnt : function(ent){
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this._remEnt(ent.getChild(i));
                }
            }
            if(ent.scene = this){
                array_remove(this._newEntityList,ent);
                array_remove(this._entityList,ent);
                delete this._entityByUid[ent.get('uid')];
                var s = this._entityByName[ent.get('name')];
                array_remove(s.ent);
                if(s.length == 0){
                    delete this._entityByName[ent.get('name')];
                }
                if(ent.isRoot()){
                    array_remove(_rootEntityList,ent);
                }
                ent.scene = null;
            }
        },
        _add_default: function(ent){
            this._addEnt(ent);
        },
       _remove_default : function(selector){
            if(arguments.length === 1){
                this.map(selector, function(ent){ 
                    this._remEnt(ent); 
                });
            }else{
                this._remEnt(arguments[0]);
            }
            return this;
        },
        _remove_entity: function(ent){
            this._remEnt(ent);
        },
        _add_entity : function(ent){
            this._addEnt(ent);
        },
        _get_entity : function(index){
            if(index !== undefined && index !== null){
                return this._entityList[index];
            }else{
                return this._entityList;
            }
        },
        _get_rootEntities : function(index){
            if(index !== undefined && index !== null){
                return this._rootEntityList[index];
            }else{
                return this._rootEntityList;
            }
        },
        _entUpdate : function(ent){
            var draw = false;
            if(ent.active){
                if(!ent.main){
                    ent.main = this.main;
                }
                if(!ent.scene){
                    ent.scene = this.scene;
                }
                if(ent._state === 'new'){
                    ent._state = 'alive';
                    ent._currentFrame = this.main.frame;
                    ent.onInstanciation();
                    var updated = ent.onUpdate();
                    draw = draw || updated;
                }else if(ent._currentFrame != this.main.frame){
                    ent._currentFrame = this.main.frame;
                    var updated = ent.onUpdate();
                    draw = draw || updated; 
                }
            }
            //update child entities too !
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount();i++){
                    var updated = this._entUpdate(ent.getChild(i));
                    draw = draw || updated;
                }
            }
            return draw || false;
        },
        instantiationPass: function(){
            var draw = this._newEntityList.length > 0;
            for(var i = 0, len = this._newEntityList.length; i < len; i++){
                var ent = this._newEntityList[i];
                this._entityList.push(ent);
                if(ent.isRoot()){
                    this._rootEntityList.push(ent);
                }
                if(ent.startTime < 0){
                    ent.startTime = this.time;
                }
                if(!ent.main){
                    ent.main = this.main;
                }
                //FIXME make it alive and set current frame ? see J2D
            }
            this._newEntityList = [];
            return draw || false;
        },
        updatePass: function(){
            var draw = false;
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var ent = this._rootEntityList[i];
                if(ent._state !== 'destroyed'){
                    var updated = this._entUpdate(ent);
                    draw = draw || updated; 
                    if(ent._destroyTime && ent._destroyTime <= this.main.time){
                        ent.destroy();
                    }
                }
            }
            return draw || false;
        },
        collisionPass: function(){
            var draw = false;
            var emitters = [];
            var receivers = [];
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var e = this._rootEntityList[i];
                if(e.collisionBehaviour === 'emit'){
                    emitters.push(e);
                }else if(e.collisionBehaviour === 'receive'){
                    receivers.push(e);
                }else if(e.collisionBehaviour === 'both'){
                    receivers.push(e);
                    emitters.push(e);
                }
            }
            
            var elen = emitters.length;
            var rlen = receivers.length;

            for(var i = 0; i < elen; i++){
                var e = emitters[i];
                //only emitters send collision events
                for(var j = 0; j < rlen; j++){
                    var r = receivers[j];
                    //only receivers receive collision events
                    if( (r !== e) ){
                        if( e.collides(r) ){
                            var updated2 = r.onCollisionReceive(e);
                            var updated = e.onCollisionEmit(r);
                            draw = draw || updated || updated2; 
                        }
                    }
                }
            }                           
            return draw || false;
        },
        destructionPass: function(){
            var draw = false;
            for(var i = 0,len = this._entityList.length; i < len; i++){
                var ent = this._entityList[i];
                if(ent._state === "destroyed"){
                    this._destroyedEntityList.push(ent);
                }
            }

            draw = this._destroyedEntityList.length > 0;

            for(var i = 0,len = this._destroyedEntityList.length; i < len; i++){
                var ent = this._destroyedEntityList[i];
                array_remove(this._entityList,ent);
                if(ent.isRoot()){
                    array_remove(this._rootEntityList,ent);
                }
                ent.onDestruction();
            }
            this._destroyedEntityList = [];
            return draw || false;
        },
        drawPass: function(){
            return false;
        },
        cameraPass: function(){
            var draw = false;
            if(this.camera){
                this.camera.scene = this;
                this.camera.main  = this.main;
                var updated = this.camera.onUpdate();
                draw = draw || updated;
            }
            return draw || false;
        },
        runFrame : function(deltaTime){
            var draw = false;

            this.deltaTime = deltaTime * this.timeSpeed;
            this.time += this.deltaTime;
            this.frame++;
           
            for(var i = 0, len = this.passSequence.length; i < len; i++){
                var pass = this.passSequence[i];
                if(this.passes[pass]){
                    var updated =  this.passes[pass].process(this);
                    draw = draw || updated;
                }else{
                    var passFun = pass + 'Pass';
                    if(this[passFun]){
                        var updated = this[passFun]();
                        draw = draw || updated;
                    }
                }
            }
            for(var i = 0, len = this._entityList.length; i < len; i++){
                if(this._entityList[i].__updated__){
                    var draw = true;
                    this._entityList[i].__updated__ = false;
                }
            }
            return draw || false;
        },
        onFrameStart: function(){},
        onFrameEnd:   function(){},
        onSceneStart: function(){},
        onSceneEnd:   function(){},
    });

    modula.ScenePass = modula.Class.extend({
        process: function(scene,updated){
            return false;
        },
    });

    modula.Ent = modula.Class.extend({ 
        init: function( options ){
            options = options || {};

            this._uid = options.uid || this._uid || undefined;  //  The uid is unique to each entity
            this._state = 'new';    //  'new' | 'alive' | 'destroyed'   
            this._currentFrame = 0;
            this._destroyTime = this.get('destroyTime') || options.duration || Number.MAX_VALUE; // TODO correct delay

            this.scene = null;
            this.main  = null;

            // The transform contains the position, rotation, scale, and parent/childs of the entity
            this.transform     = new modula.Transform2();
            this.transform.ent = this;

            if(options.pos){
                this.transform.setPos(options.pos);
            }
            if(options.rotation){
                this.transform.setRotation(options.rotation);
            }
            if(options.scale){
                this.transform.setScale(options.scale);
            }
            
            // the collisionBehaviour decides how collision events are emitted :
            // 'none' : ignores collisions
            // 'emit' : emits collision events to colliding entities
            // 'receive' : receives collision events from colliding entitites
            // 'both'  : both emit and receive
            this.collisionBehaviour = this.collisionBehaviour || options.collisionBehaviour || 'none';
            this.name   =  options.name   || this.name   || 'Ent';
            // if not active, the entity is not updated but still rendered
            this.active = options.active || this.active || true;
            // if false, the entity does not render. (but may render its childs)
            this.render = options.render || this.render || true;
            // if false the entity does not render its childs
            this.renderChilds = options.renderChilds || this.renderChilds || true;
            // the bound is used for collisions
            this.bound    = options.bound || this.bound || undefined;
            // what will be drawn
            this.drawable = options.drawable || this.drawable || undefined;
            // the time (in seconds) when the entity had its first update
            this.startTime = -1; // todo modula.main.time;
        
        },
        // return true if the entity has no childs
        isLeaf : function(){
            return this.transform.isLeaf();
        },
        // return true if the entity has no parents
        isRoot : function(){
            return this.transform.isRoot();
        },
        // adds a child to the entity. The previous coordinates will become local coordinates
        _add_default : function(ent){
            this._add_childs(ent);
        },
        _remove_default: function(ent){
            this._remove_childs(ent);
        },
        _add_child : function(ent){
            this.transform.addChild(ent.transform);
            return this;
        },
        // removes a child from the entity
        _remove_child : function(ent){
            this.transform.remChild(ent.transform);
            return this;
        },
        // returns the child entity of index 'index'
        _get_child: function(index){
            if(index !== null && index !== undefined){
                var tr = this.transform.getChild(index);
                return tr ? tr.ent : undefined;
            }else{
                var childs = [];
                for(var i = 0, len = this.transform.getChildCount(); i < len; i++){
                    childs.push(this.transform.getChild(index));
                }
                return childs;
            }
        },
        // same as 'set'  but applies it recursively to the entity and all its childs
        setRecursively: function(name, value){
            if(arguments.length === 2){
                args = {};
                args[name] = value;
                this.setRecursively(args);
            }else{
                this.set(arguments[0]);
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.setRecursively(arguments[0]);
                }
            }
            return this;
        },
        // destroys the entity (and all childs) now or after an optional delay (in seconds) 
        destroy: function(delay){
            if(delay){
                this._destroyTime = Math.min(this._destroyTime, this.main.time + delay);
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.destroy(delay);
                }
            }else if(this._state !== "destroyed"){
                this._state = "destroyed";
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.destroy();
                }
            }
            return this; 
        },
        isDestroyed: function(){
            return this._state === "destroyed"; 
        },
        // returns true if the entity collides with another bound or entity
        collides: function(ent){
            if(ent instanceof modula.Ent){
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collides(ebound);
                }else{
                    return this.contains(epos);
                }
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collides(ent);
            }
        },
        // returns the smallest vector that would make this entity not collide 'ent' by translation
        collisionVector: function(ent){
            if(ent instanceof modula.Ent){
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionVector(ebound);
                }
                return new Vec2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collisionVector(ent);
            }
        },
        // returns the smallest distance on each axis that would make this entity not collide with
        // 'ent' by translation on one axis
        collisionAxis: function(ent){
            if(ent instanceof modula.Ent){
                    var epos = ent.transform.getWorldPos();
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionAxis(ebound);
                }
                return new Vec2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collisionAxis(ent);
            }
        },
        _get_X: function(){
            return this.transform.X();
        },
        _get_Y: function(){
            return this.transform.Y();
        },
        _get_pos: function(){
            return this.transform.getPos();
        },
        _set_pos: function(pos){
            this.transform.setPos(pos);
        },
        _get_scale: function(){
            return this.transform.getScale();
        },
        _set_scale: function(scale){
            this.transform.setScale(scale);
        },
        _get_rotation: function(){
            return this.transform.getRotation();
        },
        _set_rotation: function(rot){
            this.transform.setRotation(rot);
        },
        _get_rotationDeg: function(){
            return this.transform.getRotationDeg();
        },
        _set_rotationDeg: function(rotDeg){
            this.transform.setRotationDeg(rotDeg);
        },
        // is called before onUpdate the first time the entity is updated
        onInstanciation: function(){},
        // is called each frame
        onUpdate: function(){},
        // is called when the entity is destroyed
        onDestruction: function(){},
        // is called when the render state has local coordinates. 
        // (drawing a point centered on (0,0) will draw the point centered on the entity world position
        onDrawLocal: function(){},
        // is called when the render state has global coordinates
        // (drawing a point centered on (0,0) will draw it on (0,0)
        onDrawGlobal: function(){},
        // is called when the entity emits a collision to colliding entity 'ent'
        onCollisionEmit: function(ent){},
        // is called when the entity receives a collision from the entity 'ent'
        onCollisionReceive: function(ent){},
    });

    modula.Ray = modula.Class.extend({
        start: null,
        dir: null,
        maxLength: 0,
        length: 0,
        pos: null,
        next: function(length){
        },
    });

})(window.modula);
// Modula 2D canvas debug draw helpers
window.modula = window.modula || {}; 
(function(modula){

    modula.draw = {};

    modula.draw.setContext = function(context){
        modula.draw.context = context;
        return modula.draw;
    };
    modula.draw.line = function(from, to, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        c.beginPath();
        c.moveTo(from.x,from.y);
        c.lineTo(to.x,to.y);
        c.closePath();
        c.stroke();
        
        if(color){
            c.restore();
        }
        return modula.draw;
    };

    modula.draw.line_at = function(pos, segment, color){
        modula.draw.line(pos,pos.add(segment),color);
        return modula.draw;
    };

    modula.draw.circle = function(pos,radius, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        c.beginPath();
        c.arc(pos.x,pos.y,radius,0,2*Math.PI);
        c.closePath();
        c.stroke();

        if(color){
            c.restore();
        }
        return modula.draw;
    };

    modula.draw.disc = function(pos,radius, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.fillStyle = color;
        }
        c.beginPath();
        c.arc(pos.x,pos.y,radius,0,2*Math.PI);
        c.closePath();
        c.fill();

        if(color){
            c.restore();
        }
        return modula.draw;
    };
    
    modula.draw.centeredRect = function(center,size,color){
        var c = modula.draw.context;
        var hx = size.x * 0.5;
        var hy = size.y * 0.5;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        
        c.strokeRect(center.x - size.x*0.5, center.y - size.y * 0.5, size.x, size.y);
        
        if(color){
            c.restore();
        }
    };

    if(modula.Vec2){
        
        var proto = modula.Vec2.prototype;
        
        proto.draw = function(color){
            modula.draw.line(new Vec2(0,0), this, color);
            return this;
        };

        proto.drawAt = function(pos,color){
            modula.draw.lineAt(pos,this,color);
            return this;
        };
    }

    if(modula.Transform2){

        var proto = modula.Transform2.prototype;

        proto.drawToWorld = function(size){
            size = size || 10;
            var center = this.getWorldPos();
            var x = this.localToWorld(new Vec2(size,0));
            var y = this.localToWorld(new Vec2(0,size));
            var c = modula.draw.context;

            c.save();
            
            c.strokeStyle = 'red';
            c.beginPath();
            c.moveTo(center.x,center.y);
            c.lineTo(x.x,x.y);
            c.closePath();
            c.stroke();

            c.strokeStyle = 'green';
            c.beginPath();
            c.moveTo(center.x,center.y);
            c.lineTo(y.x,y.y);
            c.closePath();
            c.stroke();

            c.restore();
        };
    }

})(window.modula);
// Modula 2D Grid
window.modula = window.modula || {};
(function(modula){
    var Vec2 = modula.Vec2;

    modula.Grid = modula.Class.extend({
        init: function(options){
            options = options || {};
            this._cellX = this.get('cellX') || options.cellX || 1;
            this._cellY = this.get('cellY') || options.cellY || 1;
            this._cellSize = this.get('cellSize');
            if(!this._cellSize && options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this._cellSize = new Vec2(options.cellSize, options.cellSize);
                }else{
                    this._cellSize = options.cellSize.clone();
                }
            }else{
                this._cellSize = new Vec2(32,32);
            }
            this._invCellSize = new Vec2(1 / this._cellSize.x, 1 / this._cellSize.y);
            this._size = new Vec2( this._cellX * this._cellSize.x,
                                  this._cellY * this._cellSize.y  );

            this._cell = this._cell || options.cells || [];
            if(options.fill !== undefined && !options.cells){
                this.fill(options.fill);
            }
        },
        _set_cell: function(index,cell){
            if(index[0] >= 0 && index[0] < this._cellX && index[1] >= 0 && index[1] < this._cellY){
                this._cell[index[1]*this._cellX+index[0]] = cell;
            }
        },
        _get_cell: function(index){
            if(!index){
                return this._cell;
            }else if(index[0] < 0 || index[0] >= this._cellX || index[1] < 0 || index[1] >= this._cellY){
                return undefined;
            }else{
                return this._cell[index[1]*this._cellX+index[0]]; 
            }
        },
        _get_cells: function(){
            return this._cell;
        },
        getCellUnsafe: function(x,y){
            return this._cell[y*this._cellX+x];
        },
        getCell: function(x,y){
            if(x >= 0 && y >= 0 && x < this._cellX && y < this._cellY){
                return this._cell[y*this._cellX+x];
            }else{
                return undefined;
            }
        },
        fill: function(cell){
            for(var x = 0; x < this._cellX; x++){
                for (var y = 0; y < this._cellY; y++){
                    this._cell[y*this._cellX + x] = cell;
                }
            }
        },
        _get_bound: function(index){
            if(index){
                var csize = this.get('cellSize');
                return new modula.Rect(index[0] * csize.x, index[1] * csize.x, csize.x, csize.y );
            }else{
                return new modula.Rect(0,0,this.get('size').x, this.get('size').y);
            }
        },
        getBoundUnsafe: function(x,y){
            return new modula.Rect(x * this._cellSize.x, y * this._cellSize.y, this._cellSize.x, this._cellSize.y);
        },
        getCellAtPixel: function(pos){
            var size = this.get('size');
            if(pos.x < 0 || pos.x >= size.x || pos.y < 0 || pos.y >= size.y){
                return undefined;
            }else{
                var csize = this.get('cellSize');
                var x = Math.max(0,Math.min(this._cellX - 1,Math.floor(pos.x/csize.x)));
                var y = Math.max(0,Math.min(this._cellY - 1,Math.floor(pos.y/csize.y)));
                return { x:x, y:y, cell:this.getCellUnsafe(x,y)};
            }
        },
        getCellsInRect: function(minx, miny, maxx, maxy){
            var size = this._size;
            if(maxx <= 0 || maxy <= 0){
                return [];
            }else if(minx >= size.x || miny >= size.y){
                return [];
            }else{
                var csize = this._cellSize.clone();
                csize.x = 1.0 / csize.x;
                csize.y = 1.0 / csize.y;
                minx = Math.floor(Math.max(minx,0) * csize.x);
                miny = Math.floor(Math.max(miny,0) * csize.y);
                maxx = Math.floor(Math.min(maxx,size.x-1) * csize.x);
                maxy = Math.floor(Math.min(maxy,size.y-1) * csize.y);
                var cells = [];
                for(var x = minx; x <= maxx; x++){
                    for(var y = miny; y <= maxy; y++){
                        cells.push({x:x, y:y, cell: this.getCellUnsafe(x,y)});
                       }
                }
                return cells;
            }
        },
        getColldingCells: function(bound){
            var Rect  = modula.Rect;
            if(!Rect){
                return [];
            }else{
                var cells = this.getCellsInRect(bound.minX(), bound.minY(), bound.maxX(), bound.maxY());
                var csize = this._cellSize;
                var ccells = [];
                for(var i = 0, len = cells.length; i < len; i++){
                    var cell = cells[i];
                    var rect = new Rect( cell.x * csize.x,
                                                cell.y * csize.y,
                                                csize.x,
                                                csize.y );
                    if( bound.collides(rect)){
                        cell.bound = rect;
                        ccells.push(cell);
                    }
                }
                return ccells;
            }
        },
        collisionVec: function(bound, isSolid){
            var self  = this;

            var pos   = bound.center();
            var minX  = bound.minX();
            var minY  = bound.minY();
            var maxX  = bound.maxX();
            var maxY  = bound.maxY();
     
            var cx    = this._cellX;
            var cy    = this._cellY;
            var csx   = this._cellSize.x;
            var csy   = this._cellSize.y;


            if(maxX <= 0 || maxY <= 0 || minX >= cx*csx || minY >= cy*csy){
                return;
            }

            function is_solid(x,y){
                var cell = self.getCell(x,y);
                return (cell!== undefined) && isSolid(cell,x,y);
            }

            //we transform everything so that the cells are squares of size 1.

            var isx   = 1 / csx;
            var isy   = 1 / csy;

            minX *= isx;
            minY *= isy;
            maxX *= isx;
            maxY *= isy

            var min_px = Math.floor(minX);
            var max_px = Math.floor(maxX);
            var min_py = Math.floor(minY);
            var max_py = Math.floor(maxY);

            // these are the distances the entity should be displaced to escape
            // left blocks, right blocks, up ... 

            var esc_l = (min_px + 1 - minX) * csx;
            var esc_r = -( maxX - max_px )  * csx;  
            var esc_u = (min_py + 1 - minY) * csy;
            var esc_d = -( maxY - max_py )  * csy;

            // at this point we are back in world sizes 

            if(min_px === max_px && min_py === max_py){
                // in the middle of one block
                if(is_solid(min_px,min_py)){
                    var dx = esc_l < -esc_r ? esc_l : esc_r;
                    var dy = esc_u < -esc_d ? esc_u : esc_d;
                    if(Math.abs(dx) < Math.abs(dy)){
                        return new Vec2(dx,0);
                    }else{
                        return new Vec2(0,dy);
                    }
                }else{
                    return undefined;
                }
            }else if(min_px === max_px){
                // in the middle of one vertical two-block rectangle
                var solid_u = is_solid(min_px,min_py);
                var solid_d = is_solid(min_px,max_py);
                if(solid_u && solid_d){
                    return null; // error
                }else if(solid_u){
                    return new Vec2(0,esc_u);
                }else if(solid_d){
                    return new Vec2(0,esc_d);
                }else{
                    return undefined;
                }
            }else if(min_py === max_py){
                // in the middle of one horizontal two-block rectangle
                var solid_l = is_solid(min_px,min_py);
                var solid_r = is_solid(max_px,min_py);
                if(solid_l && solid_r){
                    return null; // error
                }else if(solid_l){
                    return new Vec2(esc_l,0);
                }else if(solid_r){
                    return new Vec2(esc_r,0);
                }else{
                    return undefined;
                }
            }else{
                // touching four blocks
                var solid_ul = is_solid(min_px,min_py);
                var solid_ur = is_solid(max_px,min_py);
                var solid_dl = is_solid(min_px,max_py);
                var solid_dr = is_solid(max_px,max_py);
                var count = 0 + solid_ul + solid_ur + solid_dl + solid_dr;
                if(count === 0){
                    return undefined;
                }else if(count === 4){
                    return null; // error
                }else if(count >= 2){
                    var dx = 0;
                    var dy = 0;
                    if(solid_ul && solid_ur){
                        dy = esc_u;
                    }
                    if(solid_dl && solid_dr){
                        dy = esc_d;
                    }
                    if(solid_dl && solid_ul){
                        dx = esc_l;
                    }
                    if(solid_dr && solid_ur){
                        dx = esc_r;
                    }
                    if(count === 2){
                        if(solid_dr && solid_ul){
                            return null; //WIP
                        }else if(solid_dl && solid_ur){
                            return null; //WIP
                        }
                    }
                    return new Vec2(dx,dy);
                }else{
                    if(solid_dl){
                        return -esc_d < esc_l ? new Vec2(0,esc_d) : new Vec2(esc_l,0);
                    }else if(solid_dr){
                        return -esc_d < -esc_r ? new Vec2(0,esc_d) : new Vec2(esc_r,0);
                    }else if(solid_ur){
                        return esc_u < -esc_r ? new Vec2(0,esc_u) : new Vec2(esc_r, 0);
                    }else{
                        return esc_u < esc_l ? new Vec2(0,esc_u) : new Vec2(esc_l,0);
                    }
                }
            }
        },
    });
    modula.DrawableGrid = modula.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            this.pass = options.pass || this.pass;
            this.height = options.height || this.height;
            this.zindex = options.zindex || this.zindex;
            console.log(this.pass);
            this.grid = options.grid;
            this._drawables = options.drawables || {};
            if(options.spriteMap){
                sprites = options.spriteMap.get('spriteNames');
                for(var i = 0, len = sprites.length; i < len; i++){
                    this._drawables[sprites[i]] = options.spriteMap.get('sprite',sprites[i]);
                }
            }
        },
        clone: function(){
            return new modula.DrawableGrid({
                height: this.height,
                zindex: this.zindex,
                drawables: this._drawables,
                grid: this.grid,
            });
        },
        draw: function(renderer, ent, camera){
            var cx = this.grid._cellX;
            var cy = this.grid._cellY;
            var size = this.grid._cellSize; 

            for(var x = 0; x < cx; x++){
                for(var y = 0; y < cy; y++){
                    var cell = this.grid.getCellUnsafe(x,y);
                    var drawable = this._drawables[cell];
                    if(drawable){
                        var px = x * size.x;
                        var py = y * size.y;
                        context.save();
                        context.translate(px,py);
                        drawable.draw(renderer,ent);
                        context.restore();
                    }
                }
            }
        },
    });
})(modula);
