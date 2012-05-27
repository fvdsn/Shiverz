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
                console.log('Startpos:',pos.toString());
                var ent = new TestEnt({
                    pos: pos,
                    speed: Vec2.newRandom().scale(5+Math.random() *50),
                });
                this.addEnt(ent);
                //ent.animate('foobar',42,5);
                ent.animate('pos',new Vec2(500,500),3,'decelerating',function(){
                    main.exit();
                });
                window.ent = ent;
            }
        },
	});

	window.main   = new Main({
		fps: 60,
		input: new Input('body'),
		scene: new DemoScene({
            passes: {
                physics: new AnimationsPass(),
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
        setPos: function(pos){
            this.transform.setPos(pos);
        },
        getPos: function(pos){
            return this.transform.pos;
        },
    });
            
	window.TestEnt = AnimEnt.extend({
        foobar: 25,
		init: function(opt){
            opt = opt || {};
			this._super(opt);
			this.drawable = (opt.sprite || microbeSprite).clone(); 
		},
		onUpdate: function(){
            console.log('u ',this.getPos().toString());
            //console.log(this.foobar);
		},
	});

    window.main.setFps(60);
	window.main.run();
};
