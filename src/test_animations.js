window.onload = function() {

	window.canvas = document.getElementById('testCanvas1');
	window.context = canvas.getContext('2d');
	
	modula.use();	
	
	window.microbeSprite = new RendererCanvas2d.DrawableSprite({
		src:'img/microbe64.png',
	});
	
	window.DemoScene = Scene.extend({
		onSceneStart: function(){
            for(var i = 0; i < 1; i++){
                var pos = Vec2.newRandomPositive().multXY(
                        canvas.width, canvas.height
                    );

                var ent = new TestEnt({
                    pos: pos,
                    speed: Vec2.newRandom().scale(5+Math.random() *50),
                });

                this.add(ent);
                

                ent.anim('pos',new Vec2(500,500),3,'decelerating',function(){
                    main.exit();
                });
                
                ent.anim('rotationDeg',180,3,'decelerating');
                ent.anim('scaleFac',5,3,'smooth');
              
                window.ent = ent;
            }
        },
	});

	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new DemoScene({
            passes: {
                animations: new AnimationsPass(),
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
	
    window.AnimEnt = Ent.extend(AnimationsMixin,{
        init: function(options){
            options = options || {};
            this._super(options);
            this.initAnimations(options);
        },
    });
            
	window.TestEnt = AnimEnt.extend({
		init: function(opt){
            opt = opt || {};
			this._super(opt);
			this.drawable = (opt.sprite || microbeSprite).clone(); 
            console.log('yo');
		},
	});

    window.main.set('fps',60);
	window.main.run();
};
