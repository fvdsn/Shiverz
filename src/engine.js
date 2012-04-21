
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
		input:	null,
		scene:	null,
		scene_list: [],
		rng:	null,
		running:	false,
		restart_time:	-1,
		frame:	0,
		time:	0,
		time_millis:	0,
		time_system:	0,
		start_time: 0,
		fps:	60,
		fixed_delta_time:	1/60,
		delta_time:		1/60,
		
		resolution:		new Vec2(800,600),
	
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


			if(this.input){
				this.input.process_events();
			}
			if(this.game){
				this.game.on_frame_start();
			}
			for(i = 0; i < this.scene_list.length; i++){
				this.scene = this.scene_list[i];
				var camera = this.scene.camera;
				var renderer = this.scene.renderer;
				
				if(renderer){
					renderer.draw_init();
				}
				if(camera){
					camera.on_render_setup();
					camera.background_setup();
					camera.projection_setup();
				}

				this.scene.run_frame();
				
				if(renderer){
					renderer.draw_frame(this.scene,camera);
					renderer.draw_end();
				}
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
			var self = this;
			if(self.running){
				return;
			}
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

	modula.Input = modula.Class.extend({
		init: function(selector){
			var self = this;
			this._mouse_status = 'out'; // 'out' | 'over' | 'entering' | 'leaving'
			this._mouse_status_previous = 'out';
			this._mouse_status_system = 'out';

			this._mouse_pos_system = new Vec2();
			this._mouse_pos = new Vec2();
			this._mouse_pos_previous = new Vec2();
			this._mouse_pos_delta = new Vec2();

			this._mouse_drag_pos = new Vec2();
			this._mouse_drag_delta_pos = new Vec2();
			this._mouse_drag = 'no'; // 'no' | 'dragging' | 'drag_start' | 'drag_end'
			this._mouse_events = [];

			this._key_status = {}; // 'up' | 'down' | 'press' | 'release' , undefined == 'up'
			this._key_update_time = {};
			this._key_events = [];

			this._alias = {};
			
			var $elem = $(selector);
			console.log(selector,$elem, $elem[0]);
			
			$elem.keyup(function(e){
				//console.log('keyup',e);
				self._key_events.push({type:'up', key: String.fromCharCode(e.which).toLowerCase()});
			});
			$elem.keydown(function(e){
				//console.log('keydown',e);
				self._key_events.push({type:'down', key: String.fromCharCode(e.which).toLowerCase()});
			});
			
			function relative_mouse_coords(dom_element,event){
				var total_offset_x = 0;
				var total_offset_y = 0;
				
				do{
					total_offset_x += dom_element.offsetLeft;
					total_offset_y += dom_element.offsetTop;
				}while((dom_element = dom_element.offsetParent));
				
				return new Vec2(
					event.pageX - total_offset_x,
					event.pageY - total_offset_y );
			}
			function event_mousemove(event){
				self._mouse_pos_system = relative_mouse_coords(this,event);
				//console.log('mouse:',self._mouse_pos_system.x, self._mouse_pos_system.y);
			}
			
			$elem[0].addEventListener('mousemove',event_mousemove,false);
			
			function event_mouseover(event){
				self._mouse_status_system = 'over';
			}
			
			$elem[0].addEventListener('mouseover',event_mouseover,false);

			function event_mouseout(event){
				self._mouse_status_system = 'out';
			}
			$elem[0].addEventListener('mouseout',event_mouseout,false);
			
			function event_mousedown(event){
				self._key_events.push({type:'down', key:'mouse'+event.button});
				//console.log('mousedown:'+event.button);

			}
			$elem[0].addEventListener('mousedown',event_mousedown,false);

			function event_mouseup(event){
				self._key_events.push({type:'up', key:'mouse'+event.button});
				//console.log('mouseup:'+event.button);
			}
			$elem[0].addEventListener('mouseup',event_mouseup,false);
			
		},
		process_events: function(){
			var time = modula.main.time_system;
			
			for(var i = 0; i < this._key_events.length; i++){
				var e =  this._key_events[i];
				var previous = this._key_status[e.key];
				if(e.type === 'up'){
					if(previous === 'down' || previous === 'press'){
						this._key_status[e.key] = 'release';
					}else{
						this._key_status[e.key] = 'up';
					}
				}else if(e.type === 'down'){
					if(previous !== 'down'){
						this._key_status[e.key] = 'press';
					}
					if(previous === 'press'){
						this._key_status[e.key] = 'down';
					}
				}
				this._key_update_time[e.key] = time;
				//console.log('updated key '+e.key+' from '+previous+' to '+this._key_status[e.key]+' at time '+time);
			}
			for(key in this._key_status){
				//console.log(time,this,this._key_update_time);
				if(this._key_update_time[key] === undefined || this._key_update_time[key] < time ){
					var status = this._key_status[key];
					if(status === 'press'){
						this._key_status[key] = 'down';
					}else if(status === 'release'){
						this._key_status[key] = 'up';
					}
					this._key_update_time[key] = time;
					//console.log('processeed key '+key+' from '+status+' to '+this._key_status[key]+' at time '+time);
				}
			}
			this._key_events = [];

			this._mouse_pos_previous = this._mouse_pos || new Vec2();
			this._mouse_pos = this._mouse_pos_system || new Vec2();
			this._mouse_pos_delta = this._mouse_pos.sub(this._mouse_pos_previous);
			
			this._mouse_status_previous = this._mouse_status;
			if(this._mouse_status_system === 'over'){
				if(this._mouse_status === 'out' || this._mouse_status === 'leaving'){
					this._mouse_status = 'entering';
				}else{ // over || entering
					this._mouse_status = 'over';
				}
			}else{ //out
				if(this._mouse_status === 'over' || this._mouse_status === 'entering'){
					this._mouse_status = 'leaving';
				}else{	// leaving || out
					this._mouse_status = 'out';
				}
			}
			//console.log('MAUS:',this._mouse_status, this._mouse_pos.x, this._mouse_pos.y);
		},

		/* key: a,b,c,...,y,z,1,2,..0,!,@,$,...,
		 * 'left','right','up','down','space',
		 * 'alt','shift','left-shift','right-shift','ctrl','super',
		 * 'f1','f2','enter','esc','insert','delete','home','end',
		 * 'pageup','pagedown'
		 * 'mouse_x','mouse-left','mouse-right','mouse-middle','scroll-up','scroll-down'
		 */

		is_key_pressing : function(key){
			key = this.get_alias(key);
			//console.log(this._key_status[key]);
			return this._key_status[key] === 'press';
		},
		is_key_releasing : function(key){
			key = this.get_alias(key);
			return this._key_status[key] === 'release';
		},
		is_key_down: function(key){
			key = this.get_alias(key);
			var s = this._key_status[key];
			return s === 'down' || s === 'press';
		},
		is_key_up: function(key){
			key = this.get_alias(key);
			var s = this._key_status[key];
			return s === undefined || s === 'up' || s === 'release';
		},

		is_mouse_over: function(){
			return this._mouse_status === 'over' || this._mouse_status === 'entering';
		},
		is_mouse_entering: function(){
			return this._mouse_status === 'entering';
		},
		is_mouse_leaving: function(){
			return this._mouse_status === 'leaving';
		},
		get_mouse_scroll: function(){
			if ( this.is_key_down('scroll-up')){
				return 1;
			}else if (this.is_key_down('scroll-down')){
				return -1;
			}
			return 0;
		},
		set_alias: function(action,key){
			this._alias[action] = key;
		},
		get_alias: function(alias){
			while(alias in this._alias){
				alias = this._alias[alias];
			}
			return alias;
		},
	});

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
		get_width: function(){},
		get_height: function(){},
		draw_init: function(){},
		draw_frame: function(scene,camera){},
		draw_end: function(){},
	});
	
	modula.Renderer.Drawable = modula.Class.extend({
		draw: function(renderer, entity){},
	})
	
	modula.RendererCanvas2d = modula.Renderer.extend({
		init: function(options){
			this.canvas = this.get_opt(options,'canvas',undefined);
			if(!this.canvas){ console.log('ERROR: please provide a canvas!'); }
			this.context = this.canvas.getContext('2d');
			this.background = this.get_opt(options,'background',undefined);
			this.globalCompositeOperation = this.get_opt(options,'globalCompositeOperation','source-over');
			this.globalAlpha = this.get_opt(options,'globalAlpha',1);
		},
		get_width: function(){
			return this.canvas.width;
		},
		get_height: function(){
			return this.canvas.height;
		},
		draw_init: function(){
			if(modula.draw){
				modula.draw.set_context(this.context);
			}
			this.context.save();
			this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
			if(this.background){
				this.context.fillStyle = this.background;
				this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
			}
			this.context.globalCompositeOperation = this.globalCompositeOperation;
			this.context.globalAlpha = this.globalAlpha;
		},
		draw_end: function(){
			context.restore();
		},
		draw_frame: function(scene,camera){
			
			function draw_entity(ent){
				this.context.save();
				this.context.translate(ent.transform.pos.x, ent.transform.pos.y);
				this.context.scale(ent.transform.scale, ent.transform.scale);
				this.context.rotate(ent.transform.rotation);
				if(ent.render){
					if(ent.drawable){
						ent.drawable.draw(this,ent);
					}
					ent.on_draw();
				}
				if(ent.render_childs){
					for(var i = 0, len = ent.get_child_count(); i < len; i++){
						draw_entity(ent.get_child(i));
					}
				}
				this.context.restore();
			}
			
			for(var i = 0, len = scene._root_entity_list.length; i < len; i++){
				var ent = scene._root_entity_list[i];
				draw_entity(ent);
			}
		},
	});
	
	modula.RendererCanvas2d.DrawableSprite = modula.Renderer.Drawable.extend({
		init: function(options){
			this.z     = options.z || 0;	
			this.image = this.get_opt(options,'image',null);
	
			this.alpha = this.get_opt(options,'alpha',undefined);
			this.compositeOperation = this.get_opt(options,'compositeOperation',undefined);
			this.src   = this.get_opt(options,'src',undefined);
			
			if(this.src === undefined){
				this.src = this.image.src;
			}else{
				this.image = new Image();
				this.image.src = this.src;
			}
			
			this.pos   = this.get_opt(options,'pos',new Vec2());
			this.pos   = this.pos.add_xy(-this.image.width/2,-this.image.height/2);
		},
		clone: function(){
			var r = new modula.RendererCanvas2d.DrawableSprite({image:this.image});
			r.pos = this.pos.clone();
			r.src = this.src;
			r.alpha = this.alpha;
			r.compositeOperation = this.compositeOperation;
			return r;
		},
		draw: function(renderer,ent){
			context.save();
			if(this.alpha !== undefined){
				context.globalAlpha *= this.alpha;
			}
			if(this.compositeOperation !== undefined){
				context.globalCompositeOperation = this.compositeOperation;
			}
			renderer.context.drawImage(this.image,this.pos.x, this.pos.y);
			context.restore();
		},
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
			this.renderer = get(params,'renderer',null);
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
			//update child entities too !
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
				//FIXME make it alive and set current frame ? see J2D
			}
			this._new_entity_list = [];

			// Updating all entities. root entities updates their childs so that 
			// they dont update after their childs
			for(var i = 0, len = this._root_entity_list.length; i < len; i++){
				var ent = this._root_entity_list[i];
				if(ent._state !== 'destroyed'){
					this._ent_update(ent);
					if(ent._destroy_time && ent._destroy_time <= main.time){
						ent.destroy();
					}
				}
			}

			//Applying physics TODO
			
			//Applying collisions FIXME: Slow, TODO: port optiomisations from J2D
			for(var i = 0, len = this._root_entity_list.length; i < len; i++){
				var e = this._root_entity_list[i];
				//only emitters send collision events
				if( e.collision_behaviour === 'emitter' || e.collision_behaviour === 'both'){
					for(var j = 0; j < len; j++){
						var r = this._root_entity_list[j];
						//only receivers receive collision events
						if( (r !== e) && (r.collision_behaviour === 'receiver' || e.collision_behaviour === 'both') ){
							if( e.collides(r) ){
								e.on_collision_emit(r);
								r.on_collision_receive(e);
							}
						}
					}
				}
			}							
						
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




	modula.Ent = modula.Class.extend({ 
		init: function( attrs ){
			this._uid = get_new_uid();
			this._state = 'new';
			this._current_frame = 0;
			this._destroy_time = get(attrs,'duration')	|| Number.MAX_VALUE; // TODO correct delay
			this._scene_list   = get(attrs,'scene') ? [attrs.scene] : [];
			this._transform    = get(attrs,'transform') || new modula.Transform2();
			this.transform	   = this._transform;	//readonly
			this.transform.ent = this;
			this.transform.pos = get(attrs,'pos',this.transform.pos);
			
			this.collision_behaviour = get(attrs,'collision_behaviour', 'none');	// none, receiver, emitter, both
			this.name	= get(attrs,'name', "Ent_"+this._uid);
			this.active = get(attrs,'active',true);
			this.render = get(attrs,'render',true);
			this.render_childs = get(attrs,'render_childs',true);
			this.bound	= get(attrs,'bound',undefined);
			this.drawable = get(attrs,'drawable',undefined);
			this.start_time = modula.main.time;
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
		collides: function(ent){
			var epos = ent.transform.get_world_pos();
			var epos = epos.sub(this.transform.get_world_pos());
			if(ent.bound){
				var ebound = ent.bound.clone_at(epos.add_xy(ent.bound.cx, ent.bound.cy));
				return this.bound.collides(ebound);
			}else{
				return this.contains(epos);
			}
		},
		on_first_update: function(){},
		on_update: function(){},
		on_destroy: function(){},
		on_draw: function(){},
		on_collision_emit: function(ent){},
		on_collision_receive: function(ent){},
	});

})(window.modula);
