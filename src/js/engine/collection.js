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
