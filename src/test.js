window.onload = function() {

	window.canvas = document.getElementById('testCanvas1');
	window.context = canvas.getContext('2d');
	
	modula.use();	
	
	window.microbeSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/microbe64.png',
	});
	
	window.DemoScene = Scene.extend({
		onSceneStart: function(){
			this.lastTime = -1;
		},
		onFrameStart: function(){
			if(this.main.time > this.lastTime + 0.02){
				this.lastTime = this.main.time;
				var i = 1;
				while(i--){
					var ent = new TestEnt({
						pos: Vec2.newRandomPositive().multXY(canvas.width,canvas.height),
						dir: Vec2.newRandom().scale(5+Math.random()*50),
						rotSpeed: Math.random() * 2 - 1,
						color: 'rgba('+
								Math.round(10 + Math.random() * 10)+','+
								Math.round(1 + Math.random() * 5) +','+
								Math.round(5  + Math.random() * 15)+',1)',
						radius: 5 + Math.random()*50,
						size: 0.5 + Math.random(),
						//color: 'rgba(0.1,255,0,1)', 
					});
					this.addEnt(ent);
				}
			}
		},
		onFrameEnd: function(){
		},
	});

	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new DemoScene({
			renderer: new RendererCanvas2d({
                canvas: window.canvas,
                getSize: function(){
                    return new Vec2(window.innerWidth, window.innerHeight);
                },
                globalCompositeOperation: 'lighter',
                globalAlpha: 0.3,
                background: "#324",
            }),
		}),
	});
	
	window.TestEnt = Ent.extend({
		init: function(opt){
            opt = opt || {};
			this._super(opt);
            this.dir = opt.dir || new Vec(3,10);
            this.color = opt.color || '#F00';
            this.radius = opt.radius || 20;
			this.drawable = (opt.sprite || microbeSprite).clone(); 
			this.transform.setScaleFac(opt.size || 1);
			this.rotSpeed = opt.rotSpeed || 0;
		},
		onUpdate: function(){
			var input = this.main.input;
			this.transform.translate(this.dir.scale(this.main.deltaTime));
			this.transform.rotate(this.rotSpeed * this.main.deltaTime);
			this.drawable.alpha = Math.min(this.main.time - this.startTime, 1);
			if(input.isKeyPressing('invert')){
				this.dir = this.dir.neg();
			}
			if(input.isKeyDown('r')){
				this.dir = this.dir.scale(1+1*this.main.deltaTime);
			}
			if(input.isKeyDown('t')){
				this.dir = this.dir.scale(1-1*this.main.deltaTime);
			}
			if(input.isKeyDown('f')){
				this.dir = this.dir.rotateDeg( 45 * this.main.deltaTime);
			}else if(input.isKeyDown('mouse0')){ 
				var speed = this.dir.len();
				var newdir = input.get('mousePos').sub(this.transform.pos).normalize();
				var olddir = this.dir.normalize();
				this.dir = olddir.lerp(newdir,0.05).setLen(speed);
			}
		},
	});

	window.main.run();
};
