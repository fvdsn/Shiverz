window.onload = function() {
	console.log("Hello World!");
	window.canvas = document.getElementById('test_canvas_1');
	window.context = canvas.getContext('2d');
	context.fillStyle = 'black';
	modula.use();
	window.scene1 = new Scene();
	draw.set_context(context);
	
	
	main.game = new (Game.extend({
		init:function(){
			this.last_time = -1;
		},
		on_frame_start: function(){
			context.canvas.width = window.innerWidth;
			context.canvas.height = window.innerHeight;
			context.clearRect(0,0, canvas.width, canvas.height);
			context.globalCompositeOperation = "lighter";

			
			if(main.time > this.last_time + 0.02){
				this.last_time = main.time;
				var i = 5;
				while(i--){
					var ent = new TestEnt({
						pos: Vec2.random_positive().mult_xy(canvas.width,canvas.height),
						dir: Vec2.random().scale(5+Math.random()*50),
						color: 'rgba('+
								Math.round(10 + Math.random() * 10)+','+
								Math.round(1 + Math.random() * 5) +','+
								Math.round(5  + Math.random() * 15)+',1)',
						radius: 5 + Math.random()*50,
						//color: 'rgba(0.1,255,0,1)', 
					});
					scene1.add_ent(ent);
				}
			}
		},
	}))();
	
	window.TestEnt = Ent2.extend({
		init: function(opt){
			this._super(opt);
			this.dir = this.get_opt(opt,'dir', new Vec2(3,10));
			this.color = this.get_opt(opt,'color','#F00');
			this.radius = this.get_opt(opt,'radius',20);
		},
		on_update: function(){
			this.transform.translate(this.dir.scale(main.delta_time));
			draw.disc(this.transform.pos, this.radius, this.color);
		},
	});
	
	main.add_scene(scene1);
	main.run();
};
