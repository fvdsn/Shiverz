window.onload = function() {

	window.canvas = document.getElementById('test_canvas_1');
	window.context = canvas.getContext('2d');
	
	modula.use();	
	
	window.scene1 = new Scene();
	
	scene1.renderer = new RendererCanvas2d({
		canvas:window.canvas,
		globalAlpha: 0.3,
		globalCompositeOperation: 'lighter',
		background:"#324",
	});
	
	window.microbeSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/microbe64.png',
	});
	
	main.game = new (Game.extend({
		init:function(){
			this.last_time = -1;
		},
		on_frame_start: function(){
			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;
			
			if(main.time > this.last_time + 0.02){
				this.last_time = main.time;
				var i = 1;
				while(i--){
					var ent = new TestEnt({
						pos: Vec2.random_positive().mult_xy(canvas.width,canvas.height),
						dir: Vec2.random().scale(5+Math.random()*50),
						rot_speed: Math.random() * 2 - 1,
						color: 'rgba('+
								Math.round(10 + Math.random() * 10)+','+
								Math.round(1 + Math.random() * 5) +','+
								Math.round(5  + Math.random() * 15)+',1)',
						radius: 5 + Math.random()*50,
						size: 0.5 + Math.random(),
						//color: 'rgba(0.1,255,0,1)', 
					});
					scene1.add_ent(ent);
				}
			}
		},
		on_frame_end: function(){
		  //console.log('fps:',1/main.delta_time,'ents:',main.scene.get_all_ent().length);
		},
	}))();
	
	window.TestEnt = Ent2.extend({
		init: function(opt){
			this._super(opt);
			this.get_all_opt(opt,{
				'dir':		new Vec2(3,10),
				'color':	'#F00',
				'radius':	20,
			});
			this.drawable = this.get_opt(opt,'sprite',microbeSprite).clone();
			this.transform.scale = this.get_opt(opt,'size',1);
			this.rot_speed = this.get_opt(opt,'rot_speed',0);
		},
		on_update: function(){
			var input = modula.main.input;
			this.transform.translate(this.dir.scale(main.delta_time));
			this.transform.rotate(this.rot_speed * main.delta_time);
			this.drawable.alpha = Math.min(main.time - this.start_time, 1);
			if(input.is_key_pressing('invert')){
				this.dir = this.dir.neg();
			}
			if(input.is_key_down('r')){
				this.dir = this.dir.scale(1+1*main.delta_time);
			}
			if(input.is_key_down('t')){
				this.dir = this.dir.scale(1-1*main.delta_time);
			}
			if(input.is_key_down('f')){
				this.dir = this.dir.rotate_deg( 45 * main.delta_time);
			}else if(input.is_key_down('mouse0')){ 
				var speed = this.dir.len();
				var newdir = input.get('mouse_pos').sub(this.transform.pos).normalize();
				var olddir = this.dir.normalize();
				this.dir = olddir.lerp(newdir,0.05).set_len(speed);
			}
		},
	});

    main.input = new Input('body');
	//main.set_fps(1);
	main.add_scene(scene1);
	main.run();
	main.input.set_alias('invert','e');
};
