
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
  	
    function capitalizeFirstLetter(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

	// The base Class implementation
  	this.Class = function(){
		
		//Returns the value of the field 'name'
		//it will first try to execute the getter method 'get_name()'
		//then it will try to find a readonly field '_name'
		//then it will try to find a field 'name'
		//it returns undefined if everything fails
		this.get = function(name){
            var Name = capitalizeFirstLetter(name);
			var fun = 'get'+Name;
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
		
		// Tries to set the value of the field 'name' to 'value'
		// it will first try to use a setter method 'set_name(value)'
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
			if(arguments.length == 1 && typeof arguments[0] === "object"){
				var arg = arguments[0];
				for (attr in arg){
					if(arg.hasOwnProperty(attr)){
						this.set(attr,arg[attr]);
					}
				}
			}else{
				var fun = 'set' + captalizeFirstLetter(name);
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
		
		//Returns true if the object has a field named 'name', readonly or not
		this.has = function(name){
			return this[name] || 
                   this['_'+name] || 
                   this['get'+capitalizeFirstLetter(name)] ;
		};
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
