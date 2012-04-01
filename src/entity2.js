
window.modula = window.modula || {};

(function(modula){
	var __uid__ = 0;
	function get_new_uid(){
		__uid__ += 1;
		return __uid__;
	}
	function Ent2(params) { 
		this.name = params.name;
		this.uid = get_new_uid();
		this.state = 'new';
		this.collision_behaviour = 'receiver';
		this.current_frame = 0;
		this.destroy_time = 0; //TODO MAX_VALUE;
		this.active = true;

		this.scene_list = [];

		this.bound = null;

		this.transform = new Transform2();
		this.pos_z     = 0;
	};

	modula.Ent2 = Ent2;

	var proto = Ent2.proto;

	proto.get_name = function(){};

	proto.set_name = function(){};

	proto.set_bound = function(){};

	proto.get_bound = function(){};

	proto.get_transform = function(){};

	proto.set_transform = function(){};

	proto.is_active = function(){};

	proto.set_active = function(){};

	proto.set_active_recursively = function(){};

	proto.destroy = function(time){};

	proto.get_time_before_destroy = function(){};

	proto.is_destroyed = function(){};

	proto.on_first_update = function(){};

	proto.on_update = function(){};

	proto.on_destroyed = function(){};

	proto.on_draw = function(){};

	proto.on_world_collision = function(){};

	proto.on_collision_emit = function(ent, col_vec){};

	proto.on_collision_receive = function(ent, col_vec){};

})(window.modula);
