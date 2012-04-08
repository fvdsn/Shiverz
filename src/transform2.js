
(function(modula){

	modula.require('Transform2','Core','Vec2');

	// Multiply a number expressed in radiant by rad2deg to convert it in degrees
	var rad2deg = 57.29577951308232;
	modula.rad2deg = rad2deg;

	// Multiply a number expressed in degrees by deg2rad to convert it to radiant
	var deg2rad = 0.017453292519943295;
	modula.deg2rad = deg2rad;

	// The numerical precision used to compare vector equality
	modula.epsilon   = 0.0000001;

	var epsilon_equals = function(a,b){
		return Math.abs(a-b) <= modula.epsilon;
	};

	var Vec2 = modula.Vec2;

	function Transform2(){
		this.pos = new Vec2();
		this.scale = 1.0;
		this.rotation = 0.0;
		this.parent = null;
		this.childs = [];
	}

	modula.Transform2 = Transform2;

	var proto = Transform2.prototype;

	proto.type = "transform";
	proto.dimension = 2;
	proto.full_type = "transform2";

	proto.equals = function(tr){
		return  this.full_type === tr.full_type &&
			this.pos.equals(tr.pos) &&
			epsilon_equals(this.rotation, tr.rotation) &&
			epsilon_equals(this.scale, tr.scale);
	};

	proto.clone = function(){
		var tr = new Transform2();
		tr.pos  = this.pos.clone();
		tr.scale = this.scale;
		tr.rotation = this.rotation;
		return tr;
	};

	proto.set_pos = function(vec){
		this.pos = vec.clone();
		return this;
	};

	proto.set_pos_xy = function(x,y){
		this.pos = new Vec2(x,y);
		return this;
	};

	proto.set_scale = function(scale){
		this.scale = scale;
		return this;
	};

	proto.set_rotation = function(rotation){
		this.rotation = rotation;
		return this;
	};

	proto.set_rotation_deg = function(rotation){
		this.rotation = rotation * deg2rad;
		return this;
	};

	proto.set_scale = function(scale){
		this.scale = scale;
		return this;
	};

	proto.get_pos = function(){
		return this.pos.clone();
	};

	proto.get_scale = function(){
		return this.scale;
	};

	proto.get_rotation = function(){
		return this.rotation;
	};
	
	proto.get_rotation_deg = function(){
		return this.rotation * rad2deg;
	};

	proto.get_world_pos = function(){
		return this.local_to_world(new Vec2());
	};

	proto.parent_to_local = function(vec){
		return vec.sub(this.pos)
			  .rotate(-this.rotation)
			  .scale(1.0/this.scale);
	};

	proto.world_to_local = function(vec){
		if(this.parent){
			return this.parent_to_local( this.parent.world_to_local(vec) );
		}else{
			return this.parent_to_local(vec);
		}
	};

	proto.local_to_parent = function(vec){
		return vec.scale(this.scale)
			  .rotate(this.rotation)
			  .add(this.pos);
	};

	proto.local_to_world = function(vec){
		if(this.parent){
			return this.parent.local_to_world( this.local_to_parent(vec));
		}else{
			return this.local_to_parent(vec);
		}
	};


	proto.add_child = function(tr){
		if(tr.parent != this){
			tr.make_root();
			tr.parent = this;
			this.childs.push(tr);
		}
		return this;
	};

	proto.rem_child = function(tr){
		if(tr && tr.parent === this){
			tr.make_root();
		}
		return this;
	};

	proto.get_child_count = function(){
		return this.childs.length;
	};

	proto.get_child = function(index){
		return this.childs[index];
	};

	proto.get_root  = function(){
		if(this.parent){
			return this.parent.get_root();
		}else{
			return this;
		}
	};

	proto.make_root = function(){
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

	proto.is_leaf   = function(){ return this.childs.length === 0; };

	proto.is_root   = function(){ return !this.parent; };

	proto.rotate = function(angle){ 
		this.rotation += angle;
		return this;
	};

	proto.rotate_deg = function(angle){
		this.rotation += angle * deg2rad;
		return this;
	};

	proto.scale = function(scale){
		this.scale *= scale;
		return this;
	};

	proto.translate = function(delta_pos){
		this.pos.x += delta_pos.x;
		this.pos.y += delta_pos.y;
		return this;
	};

	proto.translate_xy = function(x,y){
		this.pos.x += x;
		this.pos.y += y;
		return this;
	};

})(window.modula);
	


	
			
			





