window.modula = window.modula || {};

(function(modula){

	function Scene(){
		this.name = undefined;
		this.entity_list = [];
		this.root_entity_list = [];
		this.new_entity_list = [];
		this.destroyed_entity_list = [];

		this.entity_by_uid = {};
		this.entity_by_name = {};
		this.entity_by_class = {};

		this.sequence = [
			'new',
			'update',
			'remove',
			'physics',
			'collisions',
			'remove',
			'draw',
			];
			

	};

	modula.Scene = Scene;

	var proto = Scene.prototype;

	proto.add_ent = function(ent){};

	proto.rem_ent = function(ent){};

	proto.get_ent_by_uid = function(uid){};

	proto.get_ent_by_name = function(name){};

	proto.get_all_ent_by_name = function(name){};

	proto.get_all_ent_by_class = function(klass){};

	proto.get_all_ent = function(){};

	proto.get_all_root_ent = function(){};

	proto.__ent_update__ = function(ent){};

	proto.run_frame = function(){};

	proto.__ent_draw__ = function(ent){};

	proto.draw = function(){};


})(window.modula);
