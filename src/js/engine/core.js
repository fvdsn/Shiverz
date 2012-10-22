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
