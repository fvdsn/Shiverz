
window.modula = window.modula || {};

(function(modula){

	modula.Core = {};

	modula.require = function(loader, names){
		for(var i = 1; i < arguments.length; i++){
			if(!modula[arguments[i]]){
				console.log("Missing Module, Could not find the "+arguments[i]+" module required by "+loader);
			}
		}
		return modula;
	};
	
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
				if(	prop !== modula.core && 
					prop !== modula.use &&
					prop !== modula.require && 
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
		this.get = function(name){
			var fun = 'get_'+name;
			if(this[fun]){
				return this[fun]();
			}else{
				var ret = this['_'+name];
				if(ret === undefined){
					ret = this[name];
				}
				return ret;
			}
		};
		this.set = function(name,value){
			if(arguments.length == 1 && typeof arguments[0] === "object"){
				var arg = arguments[0];
				for (attr in arg){
					if(arg.hasOwnProperty(attr)){
						this.set(attr,arg[attr]);
					}
				}
			}else{
				var fun = 'set_'+name;
				if(this[fun]){
					this[fun](name,value);
				}else{
					if( this['_' + name] === undefined ){
						this[name] = value;
					}
				}
			}
			return this;
		};
		this.get_opt = function(options,name,default_value){
			if(options && options[name]){
				return options[name];
			}
			return default_value;
		};
		/*
		this.getsetters = function(){
			if(!this.prototype){ // ???
				this.prototype = {};
			}
			for( field in this){
				if(!this.hasOwnProperty(field)){
					continue;
				}
				if(typeof (this.field) === "function"){
					continue;
				}
				if(field === "prototype"){
					continue;
				}
				if(field[0] === '_'){
					if(this['get'+field] === undefined){
						this.prototype['get'+field] = function(){ return this.field; };
					}
				}else{
					if(this['get_'+field] === undefined){
						this.prototype['get_'+field] = function(){ return this.field; };
					}
					if(this['set_'+field] === undefined){
						this.prototype['set_'+field] = function(value){ this.field = value; return this; };
					}
				}
			}
		};*/
  	};
  
  // Create a new Class that inherits from this class
  this.Class.extend = function(prop) {
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
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
}).call(modula);

})(window.modula);
