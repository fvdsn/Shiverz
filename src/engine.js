
window.modula = window.modula || {};

(function(modula){

	modula.require('engine','Core','Vec2','Transform2');

	var Vec2 = modula.Vec2;
	var Mat2 = modula.Mat2;
	var Transform2 = modula.Transform2;

	var uid = 0;

	function get_new_uid(){
		uid += 1;
		return uid;
	}

	function get(params,field,default_value){
		if(params && params[field]){
			return params[field];
		}
		return default_value;
	}
	Object.prototype.remove = function(element){
		delete this[element];
		return this;
	};
	Object.prototype.contains = function(element){
		return element in this;
	};
	Array.prototype.remove = function(element){
		this.splice(this.indexOf(element),1);
		return this;
	};
	Array.prototype.contains = function(element){
		return this.indexOf(element) >= 0;
	};

	modula.Main = modula.Class.extend({
		game:	null,
		scene:	null,
		scene_list: [],
		rng:	null,
		running:	false,
		restart_time: 	-1,
		frame:	0,
		time:	0,
		time_millis:	0,
		time_system:	0,
		start_time: 0,
		fps:	60,
		fixed_delta_time:	1/60,
		delta_time:		1/60,
		
		resolution: 	new Vec2(800,600),
	
		add_scene: function(scene){
			this.scene_list.push(scene);
			if(!this.scene){
				this.scene = scene;
			}
		},
		set_fps:	function(fps){
			this.fps = fps;
			this.fixed_delta_time = 1/fps;
			this.delta_time = this.theoric_delta_time;
		},
		exit:		function(){
			this.running = false;
		},
		run_start:	function(){
			var date = new Date();
			this.running = true;
			this.start_time = date.getTime();
			this.time = 0;
			this.time_millis = 0;
			this.time_system = date.getTime();
			this.restart_time = -1;
			this.frame = 0;
			if(this.game){
				this.game.on_game_start();
			}
		},
		run_frame:	function(){
			var date = new Date();
			this.delta_time  = (date.getTime() - this.time_system) * 0.001;
			this.time_system = date.getTime();
			this.time_millis = this.time_system - this.start_time;
			this.time = this.time_millis * 0.001;
			//console.log("Frame: "+this.frame+" time: "+this.time+" time_system: "+this.time_system+" delta_time: "+this.delta_time);

			if(this.game){
				this.game.on_frame_start();
			}
			for(i = 0; i < this.scene_list.length; i++){
				this.scene = this.scene_list[i];
				var camera = this.scene.camera;

				if(camera){
					camera.on_render_setup();
					camera.background_setup();
					camera.projection_setup();
				}

				this.scene.run_frame();

				if(camera){
					camera.on_render_start();
					this.scene.draw();
					camera.on_render_end();
				}
			}
			if(this.game){
				this.game.on_frame_end();
			}
			this.frame += 1;

		},
		run_end: function(){
			if(this.game){
				this.game.on_game_end();
			}
		},
		run_loop: function(){
		},

		run: function(){
			console.log("start");

			var self = this;
			self.running = true;
			self.run_start();

			(function loop(){
				if(self.running && (self.restart_time < 0 || self.time < self.restart_time)){
					self.run_frame();
					var elapsed_time_millis = ((new Date).getTime() - self.time_system);
					var wait_time = (self.fixed_delta_time * 1000) - elapsed_time_millis;
					if(wait_time < 0){
						wait_time = 0;
					}
					setTimeout(loop,wait_time);
				}else{
					self.run_end();
					if(self.running){
						self.run();
					}
				}
			})();
		},
		restart:	function(delay){
			this.restart_time = this.time;
		},
	});

	modula.main = new modula.Main();

	modula.Game = modula.Class.extend({
		on_game_start  : function(){},
		on_frame_start : function(){},
		on_frame_end   : function(){},
		on_game_end    : function(){},
	});

	modula.Camera = modula.Class.extend({
		transform : new Transform2(),
		renderer  : null,
		z_near : 100,
		z_far : -100,
		_viewport : null,
		_resolution : new Vec2(),
		_width2height : 1,
		_heigth2width : 1,
	});

	modula.Renderer = modula.Class.extend({
		render_background: function(){},
		Material: modula.Class.extend({
		}),
	});

	modula.Scene = modula.Class.extend({
		init: function(params){
			this._entity_list = [];
			this._root_entity_list = [];
			this._new_entity_list = [];
			this._destroyed_entity_list = [];

			this._entity_by_uid = {};
			this._entity_by_name = {};
			this._entity_by_class = {};
			this.camera = get(params,'camera',null);
			this.name = get(params,'name',"Scene"+get_new_uid());

			this.sequence = get(params,'sequence',[
				'new',
				'update',
				'remove',
				'physics',
				'collisions',
				'remove',
				'draw',
				]);
		},
		add_ent: function(ent){
			if(!ent.get('scene_list').contains(this)){
				this._new_entity_list.push(ent);
				this._entity_by_uid[ent.get('uid')] = ent;
				var name = ent.get('name');
				if(!(name in this._entity_by_name)){
					this._entity_by_name[name] = [ent];
				}else{
					this._entity_by_name[name].push(ent);
				}
				//TODO Class
			}
			if(!ent.is_leaf()){
				for(var i = 0; i < ent.get_child_count(); i++){
					this.add_ent(ent.get_child(i));
				}
			}
		},
		rem_ent : function(ent){
			if(!ent.is_leaf()){
				for(var i = 0; i < ent.get_child_count(); i++){
					this.rem_ent(ent.get_child(i));
				}
			}
			if(!ent.get('scene_list').contains(this)){
				this._new_entity_list.remove(ent);
				this._entity_list.remove(ent);
				this._entity_by_uid.remove(ent.get('uid'));
				var s = this._entity_by_name[ent.get('name')];
				s.remove(ent);
				if(s.length == 0){
					this._entity_by_name.remove(ent.get('name'));
				}
				if(ent.is_root()){
					this._root_entity_list.remove(ent);
				}
				e._scene_list.remove(this);
			}
		},
		get_ent_by_uid : function(uid){
			return this._entity_by_uid[ent.get('uid')];
		},
		get_ent_by_name : function(name){
			var s = this._entity_by_name[ent.get('name')];
			if(s && s.length){
				return s[0];
			}else{
				return undefined;
			}
		},
		get_all_ent_by_name : function(name){
			return this._entity_by_name[ent.get('name')] || [];
		},
		get_all_ent_by_class : function(klass){
		},
		get_all_ent : function(){
			return this._entity_list;
		},
		get_all_root_ent : function(){
			return this._root_entity_list;
		},
		_ent_update : function(ent){
			if(ent.active){
				if(ent._state === 'new'){
					ent._state = 'alive';
					ent._current_frame = main.frame;
					ent.on_first_update();
					ent.on_update();
				}else if(ent._current_frame != main.frame){
					ent._current_frame = main.frame;
					ent.on_update();
				}
			}
			if(!ent.is_leaf()){
				for(var i = 0; i < ent.get_child_count();i++){
					this._ent_update(ent.get_child(i));
				}
			}
		},
		run_frame : function(){

			// Adding new entities to the entity_list.
			for(var i = 0, len = this._new_entity_list.length; i < len; i++){
				var ent = this._new_entity_list[i];
				this._entity_list.push(ent);
				if(ent.is_root()){
					this._root_entity_list.push(ent);
				}
				//FIXME make it alive and set current frame ?
			}
			this._new_entity_list = [];

			//Updating all entities
			for(var i = 0, len = this._entity_list.length; i < len; i++){
				var ent = this._entity_list[i];
				if(ent._state !== 'destroyed'){
					this._ent_update(ent);
					if(ent._destroy_time && ent._destroy_time <= main.time){
						ent.destroy();
					}
				}
			}

			//Applying physics
			//Applying collisions
			//Destroying entities
			for(var i = 0,len = this._entity_list.length; i < len; i++){
				var ent = this._entity_list[i];
				if(ent._state === "destroyed"){
					this._destroyed_entity_list.push(ent);
				}
			}
			for(var i = 0,len = this._destroyed_entity_list.length; i < len; i++){
				var ent = this._destroyed_entity_list[i];
				this._entity_list.remove(ent);
				if(ent.is_root()){
					this._root_entity_list.remove(ent);
				}
				ent.on_destroy();
			}
			this._destroyed_entity_list = [];
		},
		_ent_draw : function(ent){},
		draw : function(){},
	});




	modula.Ent2 = modula.Class.extend({ 
		init: function( attrs ){
			this._uid = get_new_uid();
			this._state = 'new';
			this._current_frame = 0;
			this._destroy_time = get(attrs,'duration')  || Number.MAX_VALUE; // TODO correct delay
			this._scene_list   = get(attrs,'scene') ? [attrs.scene] : [];
			this._transform    = get(attrs,'transform') || new modula.Transform2();
			this.transform	   = this._transform; 	//readonly
			this.transform.ent = this;
			this.transform.pos = get(attrs,'pos',this.transform.pos);
			
			this.collision_behaviour = get(attrs,'collision_behaviour', 'receiver');
			this.name   = get(attrs,'name', "Ent2_"+this._uid);
			this.active = get(attrs,'active',true);
			this.bound  = get(attrs,'bound',null);
			this.pos_z  = get(attrs,'pos_z',0);
		},
		set_transform: function(tr){
			this._transform.ent = undefined;
			this._transform = tr;
			this._transform.ent = this;
			this.transform = this._transform;
			return this;
		},
		get_transform: function(){
			return this.transform;
		},
		is_leaf : function(){
			return this.transform.is_leaf();
		},
		is_root : function(){
			return this.transform.is_root();
		},
		add_child: function(ent){
			this.transform.add_child(ent.transform);
			return this;
		},
		rem_child: function(ent){
			this.transform.rem_child(ent.transform);
			return this;
		},
		get_child: function(index){
			var tr = this.transform.get_child(index);
			return tr ? tr.ent : undefined;
		},
		get_child_count: function(){
			return this.transform.get_child_count();
		},
		set_active_recursively: function(active){
			this.active = active;
			for(var i = 0; i < this.transform.get_child_count(); i++){
				this.transform.get_child(i).ent.set_active_recursively(active);
			}
			return this;
		},
		destroy: function(delay){
			if(delay){
				this._destroy_time = Math.min(this._destroy_time, modula.main.time + delay);
				for(var i = 0; i < this.transform.get_child_count(); i++){
					this.transform.get_child(i).ent.destroy(delay);
				}
			}else if(this._state !== "destroyed"){
				this._state = "destroyed";
				for(var i = 0; i < this.transform.get_child_count(); i++){
					this.transform.get_child(i).ent.destroy();
				}
			}
			return this; 
		},
		get_time_before_destruction: function(){ 
			if(this._destroy_time < Number.MAX_VALUE){
				return this._destroy_time - modula.main.time;
			}else{
				return Number.MAX_VALUE;
			}

		},
		is_destroyed: function(){
			return this._state === "destroyed"; 
		},
		on_first_update: function(){},
		on_update: function(){},
		on_destroy: function(){},
		on_draw: function(){},
		on_collision_emit: function(ent, col_vec){},
		on_collision_receive: function(ent, col_vec){},
	});

})(window.modula);
