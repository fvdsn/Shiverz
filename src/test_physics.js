window.onload = function() {

	window.canvas = document.getElementById('testCanvas1');
	window.context = canvas.getContext('2d');
	
	modula.use();	
	
	window.microbeSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/microbe64.png',
	});
	
	window.DemoScene = Scene.extend({
		onSceneStart: function(){
            for(var i = 0; i < 10; i++){
                var ent = new TestEnt({
                    pos: Vec2.newRandomPositive().multXY(
                        canvas.width, canvas.height
                    ),
                    speed: Vec2.newRandom().scale(5+Math.random() *50),
                });
                this.addEnt(ent);
            }
        },
	});

	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new DemoScene({
            passes: {
                physics: new PhysicsPass(),
            },
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
	
    window.PhysicsEnt = Ent.extend(Physics2DMixin,{
        gravity:new Vec2(0,100),
        gravityFactor:1,
        init: function(options){
            options = options || {};
            this._super(options);
            this.initPhysics(options);
        },
    });
            
	window.TestEnt = PhysicsEnt.extend({
		init: function(opt){
            opt = opt || {};
			this._super(opt);
			this.drawable = (opt.sprite || microbeSprite).clone(); 
		},
		onUpdate: function(){
            var pos = this.transform.getPos();
            if(pos.x < 0 || pos.x > window.innerWidth){
                this.speed.x = - this.speed.x;
            }
            if(pos.y < 0 || pos.y > window.innerHeight){
                this.speed.y = - this.speed.y;
            }
		},
	});

	window.main.run();
};
