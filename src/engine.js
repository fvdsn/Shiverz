
window.modula = window.modula || {};

(function(modula){

    var Vec2 = modula.Vec2;
    var Mat2 = modula.Mat2;
    var Transform2 = modula.Transform2;

    function getNewUid(){
        uid += 1;
        return uid;
    }
    function array_remove(array, element){
        array.splice(array.indexOf(element),1);
        return array;
    }
    function array_contains(array, element){
        return array.indexOf(element) >= 0;
    }
    modula.Main = modula.Class.extend({
        init: function(options){
            this._nextUid  = 0;
            this.input = null;
            this.scene = null;
            this.sceneList = [];
            this.rng = null;
            this.running = false;
            this.restartTime = -1;
            this.frame = 0;
            this.time = 0;
            this.timeSystem = 0;
            this.startTime = 0;
            this.fps = options.fps || 60;
            this.fixedDeltaTime = 1 / this.fps;
            this.deltaTime = 1 / this.fps
            if(options.input){
                this.set('input',(options.input));
            }
            if(options.scene){
                this.add(options.scene);
            }
        },
        getNewUid: function(){
            this._nextUid += 1;
            return this._nextUid;
        },
        _add_default: function(scene){
            this._add_scene(scene);
        },
        _add_scene: function(scene){
            scene.main = this;
            this.sceneList.push(scene);
            if(!this.scene){
                this.scene = scene;
            }
            if(!scene._uid){
                scene._uid = this.getNewUid();
            }
        },
        _set_input:   function(input){
            this.input = input;
            input.main = this;
        },
        _set_fps: function(fps){
            this.fps = fps;
            this.fixedDeltaTime = 1/fps;
            this.deltaTime = 1/fps;
        },
        exit:       function(){
            this.running = false;
        },
        runStart:   function(){
            var date = new Date();
            this.running = true;
            this.startTime = date.getTime() * 0.001;
            this.time = 0;
            this.timeSystem = this.startTime;
            this.restartTime = -1;
            this.frame = 0;
        },
        runFrame:   function(){
            var date = new Date();
            this.deltaTime  = date.getTime() * 0.001 - this.timeSystem;
            this.timeSystem = date.getTime() * 0.001;
            this.time = this.timeSystem - this.startTime;

            if(this.input){
                this.input.processEvents();
            }
            for(i = 0; i < this.sceneList.length; i++){
                var redraw = false;
                this.scene = this.sceneList[i];
                var camera = this.scene.camera;
                var renderer = this.scene.renderer;
                if(!this.scene._started){
                    this.scene._started = true;
                    this.scene.time = this.time;
                    this.scene.startTime = this.time;
                    this.scene.onSceneStart();
                }
                this.scene.onFrameStart();

                redraw = this.scene.runFrame(this.deltaTime);
                
                if(camera && renderer && (redraw || renderer.alwaysRedraw || renderer.mustRedraw())){
                    if(renderer.zsort){
                        scene._rootEntityList.sort(function(a,b){
                            var za = a.zindex || 0;
                            var zb = b.zindex || 0;
                            return (za - zb);
                        });
                    }
                    renderer.drawFrame(this.scene,camera);
                }
                this.scene.onFrameEnd();
            }
        
            this.frame += 1;

        },
        runEnd: function(){
        },
        run: function(){
            var self = this;
            if(self.running){
                return;
            }
            self.running = true;
            self.runStart();

            function loop(){
                if(self.running && (self.restartTime < 0 || self.time < self.restartTime)){
                    self.runFrame();
                    var elapsedTimeMillis = ((new Date).getTime() - self.timeSystem);
                    var waitTime = (self.fixedDeltaTime * 1000) - elapsedTimeMillis;
                    if(waitTime < 0){
                        waitTime = 0;
                    }
                    //setTimeout(loop,waitTime);
                    webkitRequestAnimationFrame(loop,waitTime);
                }else{
                    self.runEnd();
                    if(self.running){
                        self.run();
                    }
                }
            }
            loop();
        },
        restart:    function(delay){
            this.restartTime = this.time;
        },
    });

    modula.Input = modula.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            this._mouseStatus = 'out'; // 'out' | 'over' | 'entering' | 'leaving'
            this._mouseStatusPrevious = 'out';
            this._mouseStatusSystem = 'out';

            this._mousePosSystem = new Vec2();
            this._mousePos = new Vec2();
            this._mousePosPrevious = new Vec2();
            this._mousePosDelta = new Vec2();

            this._mouseDragPos = new Vec2();
            this._mouseDragDeltaPos = new Vec2();
            this._mouseDrag = 'no'; // 'no' | 'dragging' | 'dragStart' | 'dragEnd'
            this._mouseEvents = [];

            this._keyStatus = {}; // 'up' | 'down' | 'press' | 'release' , undefined == 'up'
            this._keyUpdateTime = {};
            this._keyEvents = [];

            this._alias = {};
            this.main   = null;
            this.setAlias({
                'mouse-left'  : 'mouse0',
                'mouse-middle': 'mouse1',
                'mouse-right' : 'mouse2',
            });
            this.setAlias(options.alias || {});

            
            var $elem = options.$elem || $(options.selector || 'body');
            
            $elem.keyup(function(e){
                self._keyEvents.push({type:'up', key: String.fromCharCode(e.which).toLowerCase()});
            });
            $elem.keydown(function(e){
                self._keyEvents.push({type:'down', key: String.fromCharCode(e.which).toLowerCase()});
            });
            
            function relativeMouseCoords(domElement,event){
                var totalOffsetX = 0;
                var totalOffsetY = 0;
                
                do{
                    totalOffsetX += domElement.offsetLeft;
                    totalOffsetY += domElement.offsetTop;
                }while((domElement = domElement.offsetParent));
                
                return new Vec2(
                    event.pageX - totalOffsetX,
                    event.pageY - totalOffsetY 
                );
            }
            function eventMousemove(event){
                self._mousePosSystem = relativeMouseCoords(this,event);
            }
            
            $elem[0].addEventListener('mousemove',eventMousemove,false);
            
            function eventMouseover(event){
                self._mouseStatusSystem = 'over';
            }
            
            $elem[0].addEventListener('mouseover',eventMouseover,false);

            function eventMouseout(event){
                self._mouseStatusSystem = 'out';
            }
            $elem[0].addEventListener('mouseout',eventMouseout,false);
            
            function eventMousedown(event){
                self._keyEvents.push({type:'down', key:'mouse'+event.button});

            }
            $elem[0].addEventListener('mousedown',eventMousedown,false);

            function eventMouseup(event){
                self._keyEvents.push({type:'up', key:'mouse'+event.button});
            }
            $elem[0].addEventListener('mouseup',eventMouseup,false);
            
        },
        processEvents: function(){
            var time = this.main.timeSystem;
            
            for(var i = 0; i < this._keyEvents.length; i++){
                var e =  this._keyEvents[i];
                var previous = this._keyStatus[e.key];
                if(e.type === 'up'){
                    if(previous === 'down' || previous === 'press'){
                        this._keyStatus[e.key] = 'release';
                    }else{
                        this._keyStatus[e.key] = 'up';
                    }
                }else if(e.type === 'down'){
                    if(previous !== 'down'){
                        this._keyStatus[e.key] = 'press';
                    }
                    if(previous === 'press'){
                        this._keyStatus[e.key] = 'down';
                    }
                }
                this._keyUpdateTime[e.key] = time;
            }
            for(key in this._keyStatus){
                if(this._keyUpdateTime[key] === undefined || this._keyUpdateTime[key] < time ){
                    var status = this._keyStatus[key];
                    if(status === 'press'){
                        this._keyStatus[key] = 'down';
                    }else if(status === 'release'){
                        this._keyStatus[key] = 'up';
                    }
                    this._keyUpdateTime[key] = time;
                }
            }
            this._keyEvents = [];

            this._mousePosPrevious = this._mousePos || new Vec2();
            this._mousePos = this._mousePosSystem || new Vec2();
            this._mousePosDelta = this._mousePos.sub(this._mousePosPrevious);
            
            this._mouseStatusPrevious = this._mouseStatus;
            if(this._mouseStatusSystem === 'over'){
                if(this._mouseStatus === 'out' || this._mouseStatus === 'leaving'){
                    this._mouseStatus = 'entering';
                }else{ // over || entering
                    this._mouseStatus = 'over';
                }
            }else{ //out
                if(this._mouseStatus === 'over' || this._mouseStatus === 'entering'){
                    this._mouseStatus = 'leaving';
                }else{  // leaving || out
                    this._mouseStatus = 'out';
                }
            }
        },

        /* key: a,b,c,...,y,z,1,2,..0,!,    _,$,...,
         * 'left','right','up','down','space',
         * 'alt','shift','left-shift','right-shift','ctrl','super',
         * 'f1','f2','enter','esc','insert','delete','home','end',
         * 'pageup','pagedown'
         * 'mouseX','mouse-left','mouse-right','mouse-middle','scroll-up','scroll-down'
         */

        // return true the first frame of a key being pressed
        isKeyPressing : function(key){
            key = this.getAlias(key);
            return this._keyStatus[key] === 'press';
        },
        // return true the first frame of a key being depressed
        isKeyReleasing : function(key){
            key = this.getAlias(key);
            return this._keyStatus[key] === 'release';
        },
        // return true as long as a key is pressed
        isKeyDown: function(key){
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === 'down' || s === 'press';
        },
        // return true as long as a key is depressed. equivalent to !isKeyDown() 
        isKeyUp: function(key){
            key = this.getAlias(key);
            var s = this._keyStatus[key];
            return s === undefined || s === 'up' || s === 'release';
        },

        // return true if the mouse is over the canvas
        isMouseOver: function(){
            return this._mouseStatus === 'over' || this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is over the canvas
        isMouseEntering: function(){
            return this._mouseStatus === 'entering';
        },
        // return true the first frame the mouse is outside the canvas
        isMouseLeaving: function(){
            return this._mouseStatus === 'leaving';
        },
        // return -1 if scrolling down, 1 if scrolling up, 0 if not scrolling
        getMouseScroll: function(){
            if ( this.isKeyDown('scroll-up')){
                return 1;
            }else if (this.isKeyDown('scroll-down')){
                return -1;
            }
            return 0;
        },
        // returns the mouse position over the canvas in pixels
        getMousePos: function(){
            return this._mousePos;
        },
        setAlias: function(action,key){
            if(typeof action === 'object'){
                var aliases = action;
                for(act in aliases){
                    this.setAlias(act,aliases[act]);
                }
            }
            this._alias[action] = key;
        },
        getAlias: function(alias){
            while(alias in this._alias){
                alias = this._alias[alias];
            }
            return alias;
        },
    });

    modula.Camera = modula.Class.extend({
        scene: null,
        main: null, 
        transform : new Transform2(),
        onUpdate : function(){},
        getMouseWorldPos: function(){
            if(!this.main || !this.main.input){
                return new Vec2();
            }
            var mpos = this.main.input.getMousePos();
            if(this.scene.renderer){
                mpos = mpos.sub(this.scene.renderer.get('size').scale(0.5));
            }
            mpos = this.transform.localToWorld(mpos);
            return mpos;
        },
        _get_pos: function(){
            return this.transform.getPos();
        },
        _set_pos: function(pos){
            this.transform.setPos(pos);
        },
        _get_scale: function(){
            return this.transform.scale;
        },
        _get_scaleFac: function(){
            return Math.max(this.transform.scale.x,this.transform.scale.y);
        },
        _set_scale: function(scale){
            this.transform.setScale(scale);
        },
        _get_rotation: function(){
            return this.transform.rotation;
        },
        _set_rotation: function(rot){
            this.transform.setRotation(rot);
        },
        _get_bound: function(){
            var pos = this.transform.getPos();
            var size = this.scene.renderer.get('size');
            return new modula.Rect(pos.x,pos.y,
                    size.x*this.transform.scale.x,
                    size.y*this.transform.scale.y,'centered');
        },
    });

    modula.Camera2d = modula.Camera.extend({
        height: 1,
        parallax: false,
    });

    modula.Renderer = modula.Class.extend({
        _size : new Vec2(),
        alwaysRedraw:true,
        renderBackground: function(){},
        drawFrame: function(scene,camera){},
        passes : [],
        mustRedraw: function(){
            return false;
        },
    });
    
    modula.Renderer.Drawable = modula.Class.extend({
        pass: null,
        draw: function(renderer, entity, camera){},
    });

    modula.Renderer.Drawable2d = modula.Renderer.Drawable.extend({
        zindex: 0,
        height: 0,
    });

    
    modula.RendererCanvas2d = modula.Renderer.extend({
        init: function(options){
            options = options || {};
            this.canvas = options.canvas || this.canvas; 
            this.alwaysRedraw = options.alwaysRedraw;
            if(!this.canvas){ console.log('ERROR: please provide a canvas!'); }
            this.context = this.canvas.getContext('2d');
            this.background = options.background;
            this.globalCompositeOperation = options.globalCompositeOperation || 'source-over'; 
            this.globalAlpha = options.globalAlpha || 1; 
            this._get_size = options.getSize || this._get_size;
            this._size = new Vec2();
            this.passes = options.passes || this.passes;
        },
        _get_size: function(){
            return new Vec2(this.canvas.width, this.canvas.height);
        },
        mustRedraw: function(){
            return !this._size.equals(this.get('size'));
        },
        drawInit: function(camera){
            if(modula.draw){
                modula.draw.setContext(this.context);
            }
            
            this._size = this.get('size');
            canvas.width = this._size.x;
            canvas.height = this._size.y;

            this.context.save();
            this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
            if(this.background){
                this.context.fillStyle = this.background;
                this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
            }
            this.context.globalCompositeOperation = this.globalCompositeOperation;
            this.context.globalAlpha = this.globalAlpha;
            if(camera){
                this.context.translate(this.canvas.width/2, this.canvas.height/2);
                if(camera.parallax && camera.height){
                    this.context.scale( 1/(camera.transform.scale.x * camera.height), 
                                        1/(camera.transform.scale.y * camera.height));
                }else{
                    this.context.scale(1/camera.transform.scale.x, 1/camera.transform.scale.y);
                }
                this.context.rotate(-camera.transform.rotation);
                this.context.translate(-camera.transform.pos.x,-camera.transform.pos.y);
            }
        },
        drawEnd: function(){
            context.restore();
        },
        drawFrame: function(scene,camera){
            this.drawInit(camera);
            for(var i = 0, len = this.passes.length; i < len; i++){
                this.drawPass(scene,camera,this.passes[i]);
            }
            this.drawPass(scene,camera,null);
            for(var i = 0, len = scene._entityList.length; i < len; i++){
                scene._entityList[i].onDrawGlobal();
            }
            this.drawEnd();
        },
        drawPass: function(scene,camera,pass){
            var self = this;
            
            function drawEntity(ent,pass){
                self.context.save();
                self.context.translate(ent.transform.pos.x, ent.transform.pos.y);
                self.context.scale(ent.transform.scale.x, ent.transform.scale.y);
                self.context.rotate(ent.transform.rotation);
                if(ent.render){
                    var drawables = ent.drawable;
                    if(!drawables){
                        drawables = [];
                    }else if (!(drawables instanceof Array)){
                        drawables = [drawables];
                    }
                    for(var i = 0, len = drawables.length; i < len; i++){
                        var drawable = drawables[i];
                        self.context.save();
                        if(camera.parallax && camera.height && drawable.height){
                            var fac = camera.height / (camera.height - drawable.height);
                            var cpos = camera.transform.pos;
                            cpos = cpos.scale(1-fac);
                            context.translate(cpos.x,cpos.y);
                            context.scale(fac,fac);
                        }
                        if(pass){
                            if(drawable.pass === pass){
                                drawable.draw(self,ent,camera);
                            }
                        }else{
                            if(!drawable.pass){
                                drawable.draw(self,ent,camera);
                            }
                        }
                        self.context.restore();
                    }
                    if(!pass){
                            ent.onDrawLocal();
                    }
                }
                if(ent.renderChilds){
                    for(var i = 0, len = ent.transform.getChildCount(); i < len; i++){
                        drawEntity(ent.transform.getChild(i).ent,pass);
                    }
                }
                self.context.restore();
            }
            for(var i = 0, len = scene._rootEntityList.length; i < len; i++){
                var ent = scene._rootEntityList[i];
                drawEntity(ent,pass);
            }
        },
    });
    
    modula.RendererCanvas2d.SpriteMap = modula.Class.extend({
        init: function(options){
            options = options || {};
            var self = this;
            this._image = options.image || null;
            this._src = options.src;

            if(this._src === undefined){
                this._src = this.image.src;
            }else{
                this._image = new Image();
                this._image.src = this._src;
            }

            function onload(){
                self._size = new Vec2(self._image.width, self._image.height);
            }
            this._image.onload = onload;
            onload();

            if(options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this._cellSize = new Vec2(options.cellSize, options.cellSize);
                }else{
                    this._cellSize = options.cellSize.clone();
                }
            }else{ 
                this._cellSize = this.get('cellSize') || new Vec2(32,32);
            }
            this._sprites = {};
            this._spriteNames = [];
            if(options.sprites){
                for(var i = 0, l = options.sprites.length; i < l; i++){
                    var sub = options.sprites[i];
                    this._sprites[sub.name] = sub;
                    this._spriteNames.push(sub.name);
                }
            }
        },
        _set_sprite: function(name,index,size){
            this._sprites[name] = { index: index, size: size };
            this._spriteNames.push(name);
        },
        _get_sprite: function(name,options){
            options = options || {};
            var sprite = this._sprites[name];
            if(sprite){
                arg = {
                    image: this._image,
                    src_x: sprite.index[0] * this._cellSize.x,
                    src_y: sprite.index[1] * this._cellSize.y,
                    src_sx: (sprite.size ? sprite.size[0] : 1) * this._cellSize.x,
                    src_sy: (sprite.size ? sprite.size[1] : 1) * this._cellSize.y,
                };
                for( key in options){
                    arg[key] = options[key];
                }
                return new modula.RendererCanvas2d.DrawableSprite(arg);
            }
        },
    });
    modula.RendererCanvas2d.DrawableSprite = modula.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            var self = this;

            this._image = options.image || null;
            this._src   = options.src;
            this.centered = options.centered || false;
            this.pass   = options.pass || this.pass;
            this.scale  = options.scale || this.scale;
            this.rotation  = options.rotation || this.rotation;
            this.height    = options.height || this.height;
            this.zindex    = options.zindex || this.zindex;

            if(this._src === undefined){
                this._src = this._image.src;
            }else{
                this._image = new Image();
                this._image.src = this._src;
            }

            function onload(){
                self.z     = options.z || 0;    
                self.alpha = options.alpha;
                self.globalCompositeOperation = options.globalCompositeOperation;
                self._src_x  = options.src_x  || 0;
                self._src_y  = options.src_y  || 0;
                self._src_sx = options.src_sx || self._image.width;
                self._src_sy = options.src_sy || self._image.height;
                self._dst_x  = options.dst_x  || 0;
                self._dst_y  = options.dst_y  || 0;
                self._dst_sx = options.dst_sx || self._src_sx;
                self._dst_sy = options.dst_sy || self._src_sy;

                self.pos   = options.pos ? options.pos.clone() : new Vec2();
            }
            this._image.onload = onload;
            onload();
        },
        clone: function(){
            return new modula.RendererCanvas2d.DrawableSprite({
                image : this._image,
                pos   : this.pos,
                alpha : this.alpha,
                scale: this.scale,
                rotation: this.rotation,
                pass  : this.pass,
                centered : this.centered,
                height: this.height,
                zindex: this.zindex,
                globalCompositeOperation: this.globalCompositeOperation,
                src_x : this._src_x,
                src_y : this._src_y,
                src_sx: this._src_sx,
                src_sy: this._src_sy,
                dst_x : this._dst_x,
                dst_y : this._dst_y,
                dst_sx: this._dst_sx,
                dst_sy: this._dst_sy,
            });
        },
        draw: function(renderer,ent,camera){
            var context = renderer.context;
            context.save();
            if(this.alpha !== undefined){
                context.globalAlpha *= this.alpha;
            }
            if(this.globalCompositeOperation){
                context.globalCompositeOperation = this.globalCompositeOperation;
            }
            if(this.scale){
                context.scale(this.scale,this.scale);
            }
            if(this.rotation){
                context.rotate(this.rotation);
            }
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            if(this.centered){
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x - this._dst_sx/2, 
                        this._dst_y + this.pos.y - this._dst_sy/2,
                        this._dst_sx, this._dst_sy );
            }else{
                context.drawImage(this._image, 
                        this._src_x,  this._src_y, 
                        this._src_sx, this._src_sy,
                        this._dst_x + this.pos.x, this._dst_y + this.pos.y,
                        this._dst_sx, this._dst_sy );
            }
            context.restore();
        },
    });

    
    modula.Scene = modula.Class.extend({
        init: function(options){
            options = options || {};
            this._started = false;
            this._entityList = [];
            this._rootEntityList = [];
            this._newEntityList = [];
            this._destroyedEntityList = [];
            this._uid = options.uid || this._uid || undefined;

            this.frame = 0;
            this.time = 0;
            this.startTime = -1;
            this.timeSpeed = 1;
            this.deltaTime = 1;

            this._entityByUid = {};
            this._entityByName = {};
            this.camera = options.camera || null; 
            this.renderer = options.renderer || null;
            this.name = options.name || 'Scene';
            this.main = null;
            this.passes = options.passes || this.passes || {};
            this.passSequence = options.passSequence || this.passSequence || [
                'instantiation',
                'camera',
                'update',
                'physics',
                'animations',
                'collision',
                'destruction',
                'draw',
                ];
        },
        addPass : function(name, pass){
            this.passes[name] = pass;
        },
        //returns a list of entities matching the url and satisfying the
        //condition:
        //url : name[/name[/...]]
        //  name is either :
        //      'camera' : will match the scene current camera, (only at root
        //                 url level)
        //      uid      : will match the entity with the an uid equal to the
        //                 uid provided
        //      *          will match all entities (but not the camera)
        //      string   : will match any entity with name equal to string
        //  
        //  '/' selects the child entities: a/b/c will select the entity of
        //  name 'c' that are childs of entity of name 'b' that are childs of
        //  entityes of name 'a'
        //
        //  the optional condition is a function with a single parameter that
        //  will be called on each matched entity. if the function returns
        //  false, the entity will be removed from the matched entities.
        //
        //  if the condition is === true, then all entities match
        query: function(query){
            if(!modula.Collection){
                return undefined;
            }
            if(query instanceof modula.Camera){
                return new modula.Collection([this.camera]);
            }else if(query instanceof modula.Class){
                var matches = [];
                for(var i = 0, len = this._entityList.length; i < len; i++){
                    if(this._entityList[i] instanceof query){
                        matches.push(this._entityList[i]);
                    }
                }
                return new modula.Collection(matches);
            }else if(typeof query === 'string'){
                return this._urlquery(query);
            }else{
                return new modula.Collection();
            }
        },
        _urlquery: function(url){
            var matches = [];
            var path = url.split('/');
            for(var i = 0; i < path.length; i++){
                var name = path[i];
                if( name === ''){
                        break;
                }else if(i === 0){
                    if(name === 'camera'){
                        matches.push(this.camera);
                    }else if(name === '*'){
                        for(var j = 0; j < this._rootEntityList.length; j++){
                            matches.push(this._rootEntityList[j]);
                        }
                    }else if(this._entityByUid[name]){
                        matches.push(this._entityByUid[name]);
                    }else{
                        ents = this._entityByName[name] || [];
                        for(var j = 0; j < ents.length; j++){
                            matches.push(ents[j]);
                        }
                    }
                }else{
                    var nmatches = [];
                    for(var k = 0; k < matches.length; k++){
                        var ent = matches[k];
                        if(!ent.transform){
                            continue;
                        }
                        for(var l = 0; l < ent.tranfsorm.getChildCount(); l++){
                            var child = ent.transform.getChild(l);
                            if(name === '*'){
                                nmatches.push(child);
                            }else if(child.name === name){
                                nmatches.push(child);
                            }else if(child._uid === name){
                                nmatches.push(child);
                            }
                        }
                    }
                    matches = nmatches;
                }
            }
            return new modula.Collection(matches);
        },
        // remove all the entities found by the selector if it is a string,
        // or removes the entity if selector is an entity
        // adds an entity to the scene. It will be
        // considered present in the scene at the next update.
        _addEnt: function(ent){
            if(ent.main && ent.main !== this.main){
                throw new Error('Cannot add an entity to the scene: it belongs to another modula instance');
                return;
            }else if(this.main){
                ent.main = this.main;
                if(!ent._uid){
                    ent._uid = this.main.getNewUid();
                }
            }
            if(ent.scene && ent.scene !== this){
                ent.scene._remEnt(ent);
            }
            if(ent.scene !== this){
                ent.scene = this;
                this._newEntityList.push(ent);
                this._entityByUid[ent.get('uid')] = ent;
                var name = ent.get('name');
                if(!(name in this._entityByName)){
                    this._entityByName[name] = [ent];
                }else{
                    this._entityByName[name].push(ent);
                }
            }
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this._addEnt(ent.getChild(i));
                }
            }
        },
        //remove an entity to the scene. 
        _remEnt : function(ent){
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this._remEnt(ent.getChild(i));
                }
            }
            if(ent.scene = this){
                array_remove(this._newEntityList,ent);
                array_remove(this._entityList,ent);
                delete this._entityByUid[ent.get('uid')];
                var s = this._entityByName[ent.get('name')];
                array_remove(s.ent);
                if(s.length == 0){
                    delete this._entityByName[ent.get('name')];
                }
                if(ent.isRoot()){
                    array_remove(_rootEntityList,ent);
                }
                ent.scene = null;
            }
        },
        _add_default: function(ent){
            this._addEnt(ent);
        },
       _remove_default : function(selector){
            if(arguments.length === 1){
                this.map(selector, function(ent){ 
                    this._remEnt(ent); 
                });
            }else{
                this._remEnt(arguments[0]);
            }
            return this;
        },
        _remove_entity: function(ent){
            this._remEnt(ent);
        },
        _add_entity : function(ent){
            this._addEnt(ent);
        },
        _get_entity : function(index){
            if(index !== undefined && index !== null){
                return this._entityList[index];
            }else{
                return this._entityList;
            }
        },
        _get_rootEntities : function(index){
            if(index !== undefined && index !== null){
                return this._rootEntityList[index];
            }else{
                return this._rootEntityList;
            }
        },
        _entUpdate : function(ent){
            var draw = false;
            if(ent.active){
                if(!ent.main){
                    ent.main = this.main;
                }
                if(!ent.scene){
                    ent.scene = this.scene;
                }
                if(ent._state === 'new'){
                    ent._state = 'alive';
                    ent._currentFrame = this.main.frame;
                    ent.onInstanciation();
                    var updated = ent.onUpdate();
                    draw = draw || updated;
                }else if(ent._currentFrame != this.main.frame){
                    ent._currentFrame = this.main.frame;
                    var updated = ent.onUpdate();
                    draw = draw || updated; 
                }
            }
            //update child entities too !
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount();i++){
                    var updated = this._entUpdate(ent.getChild(i));
                    draw = draw || updated;
                }
            }
            return draw || false;
        },
        instantiationPass: function(){
            var draw = this._newEntityList.length > 0;
            for(var i = 0, len = this._newEntityList.length; i < len; i++){
                var ent = this._newEntityList[i];
                this._entityList.push(ent);
                if(ent.isRoot()){
                    this._rootEntityList.push(ent);
                }
                if(ent.startTime < 0){
                    ent.startTime = this.time;
                }
                if(!ent.main){
                    ent.main = this.main;
                }
                //FIXME make it alive and set current frame ? see J2D
            }
            this._newEntityList = [];
            return draw || false;
        },
        updatePass: function(){
            var draw = false;
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var ent = this._rootEntityList[i];
                if(ent._state !== 'destroyed'){
                    var updated = this._entUpdate(ent);
                    draw = draw || updated; 
                    if(ent._destroyTime && ent._destroyTime <= this.main.time){
                        ent.destroy();
                    }
                }
            }
            return draw || false;
        },
        collisionPass: function(){
            var draw = false;
            var emitters = [];
            var receivers = [];
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var e = this._rootEntityList[i];
                if(e.collisionBehaviour === 'emit'){
                    emitters.push(e);
                }else if(e.collisionBehaviour === 'receive'){
                    receivers.push(e);
                }else if(e.collisionBehaviour === 'both'){
                    receivers.push(e);
                    emitters.push(e);
                }
            }
            
            var elen = emitters.length;
            var rlen = receivers.length;

            for(var i = 0; i < elen; i++){
                var e = emitters[i];
                //only emitters send collision events
                for(var j = 0; j < rlen; j++){
                    var r = receivers[j];
                    //only receivers receive collision events
                    if( (r !== e) ){
                        if( e.collides(r) ){
                            var updated2 = r.onCollisionReceive(e);
                            var updated = e.onCollisionEmit(r);
                            draw = draw || updated || updated2; 
                        }
                    }
                }
            }                           
            return draw || false;
        },
        destructionPass: function(){
            var draw = false;
            for(var i = 0,len = this._entityList.length; i < len; i++){
                var ent = this._entityList[i];
                if(ent._state === "destroyed"){
                    this._destroyedEntityList.push(ent);
                }
            }

            draw = this._destroyedEntityList.length > 0;

            for(var i = 0,len = this._destroyedEntityList.length; i < len; i++){
                var ent = this._destroyedEntityList[i];
                array_remove(this._entityList,ent);
                if(ent.isRoot()){
                    array_remove(this._rootEntityList,ent);
                }
                ent.onDestruction();
            }
            this._destroyedEntityList = [];
            return draw || false;
        },
        drawPass: function(){
            return false;
        },
        cameraPass: function(){
            var draw = false;
            if(this.camera){
                this.camera.scene = this;
                this.camera.main  = this.main;
                var updated = this.camera.onUpdate();
                draw = draw || updated;
            }
            return draw || false;
        },
        runFrame : function(deltaTime){
            var draw = false;

            this.deltaTime = deltaTime * this.timeSpeed;
            this.time += this.deltaTime;
            this.frame++;
           
            for(var i = 0, len = this.passSequence.length; i < len; i++){
                var pass = this.passSequence[i];
                if(this.passes[pass]){
                    var updated =  this.passes[pass].process(this);
                    draw = draw || updated;
                }else{
                    var passFun = pass + 'Pass';
                    if(this[passFun]){
                        var updated = this[passFun]();
                        draw = draw || updated;
                    }
                }
            }
            for(var i = 0, len = this._entityList.length; i < len; i++){
                if(this._entityList[i].__updated__){
                    var draw = true;
                    this._entityList[i].__updated__ = false;
                }
            }
            return draw || false;
        },
        onFrameStart: function(){},
        onFrameEnd:   function(){},
        onSceneStart: function(){},
        onSceneEnd:   function(){},
    });

    modula.ScenePass = modula.Class.extend({
        process: function(scene,updated){
            return false;
        },
    });

    modula.Ent = modula.Class.extend({ 
        init: function( options ){
            options = options || {};

            this._uid = options.uid || this._uid || undefined;  //  The uid is unique to each entity
            this._state = 'new';    //  'new' | 'alive' | 'destroyed'   
            this._currentFrame = 0;
            this._destroyTime = this.get('destroyTime') || options.duration || Number.MAX_VALUE; // TODO correct delay

            this.scene = null;
            this.main  = null;

            // The transform contains the position, rotation, scale, and parent/childs of the entity
            this.transform     = new modula.Transform2();
            this.transform.ent = this;

            if(options.pos){
                this.transform.setPos(options.pos);
            }
            if(options.rotation){
                this.transform.setRotation(options.rotation);
            }
            if(options.scale){
                this.transform.setScale(options.scale);
            }
            
            // the collisionBehaviour decides how collision events are emitted :
            // 'none' : ignores collisions
            // 'emit' : emits collision events to colliding entities
            // 'receive' : receives collision events from colliding entitites
            // 'both'  : both emit and receive
            this.collisionBehaviour = this.collisionBehaviour || options.collisionBehaviour || 'none';
            this.name   =  options.name   || this.name   || 'Ent';
            // if not active, the entity is not updated but still rendered
            this.active = options.active || this.active || true;
            // if false, the entity does not render. (but may render its childs)
            this.render = options.render || this.render || true;
            // if false the entity does not render its childs
            this.renderChilds = options.renderChilds || this.renderChilds || true;
            // the bound is used for collisions
            this.bound    = options.bound || this.bound || undefined;
            // what will be drawn
            this.drawable = options.drawable || this.drawable || undefined;
            // the time (in seconds) when the entity had its first update
            this.startTime = -1; // todo modula.main.time;
        
        },
        // return true if the entity has no childs
        isLeaf : function(){
            return this.transform.isLeaf();
        },
        // return true if the entity has no parents
        isRoot : function(){
            return this.transform.isRoot();
        },
        // adds a child to the entity. The previous coordinates will become local coordinates
        _add_default : function(ent){
            this._add_childs(ent);
        },
        _remove_default: function(ent){
            this._remove_childs(ent);
        },
        _add_child : function(ent){
            this.transform.addChild(ent.transform);
            return this;
        },
        // removes a child from the entity
        _remove_child : function(ent){
            this.transform.remChild(ent.transform);
            return this;
        },
        // returns the child entity of index 'index'
        _get_child: function(index){
            if(index !== null && index !== undefined){
                var tr = this.transform.getChild(index);
                return tr ? tr.ent : undefined;
            }else{
                var childs = [];
                for(var i = 0, len = this.transform.getChildCount(); i < len; i++){
                    childs.push(this.transform.getChild(index));
                }
                return childs;
            }
        },
        // same as 'set'  but applies it recursively to the entity and all its childs
        setRecursively: function(name, value){
            if(arguments.length === 2){
                args = {};
                args[name] = value;
                this.setRecursively(args);
            }else{
                this.set(arguments[0]);
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.setRecursively(arguments[0]);
                }
            }
            return this;
        },
        // destroys the entity (and all childs) now or after an optional delay (in seconds) 
        destroy: function(delay){
            if(delay){
                this._destroyTime = Math.min(this._destroyTime, this.main.time + delay);
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.destroy(delay);
                }
            }else if(this._state !== "destroyed"){
                this._state = "destroyed";
                for(var i = 0; i < this.transform.getChildCount(); i++){
                    this.transform.getChild(i).ent.destroy();
                }
            }
            return this; 
        },
        isDestroyed: function(){
            return this._state === "destroyed"; 
        },
        // returns true if the entity collides with another bound or entity
        collides: function(ent){
            if(ent instanceof modula.Ent){
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collides(ebound);
                }else{
                    return this.contains(epos);
                }
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collides(ent);
            }
        },
        // returns the smallest vector that would make this entity not collide 'ent' by translation
        collisionVector: function(ent){
            if(ent instanceof modula.Ent){
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionVector(ebound);
                }
                return new Vec2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collisionVector(ent);
            }
        },
        // returns the smallest distance on each axis that would make this entity not collide with
        // 'ent' by translation on one axis
        collisionAxis: function(ent){
            if(ent instanceof modula.Ent){
                    var epos = ent.transform.getWorldPos();
                var epos = ent.transform.getWorldPos();
                var epos = epos.sub(this.transform.getWorldPos());
                if(ent.bound){
                    var ebound = ent.bound.cloneAt(epos.add(ent.bound.center()));
                    return this.bound.collisionAxis(ebound);
                }
                return new Vec2();
            }else if(ent instanceof Bound){
                return this.bound.cloneAt(this.transform.getPos()).collisionAxis(ent);
            }
        },
        _get_X: function(){
            return this.transform.X();
        },
        _get_Y: function(){
            return this.transform.Y();
        },
        _get_pos: function(){
            return this.transform.getPos();
        },
        _set_pos: function(pos){
            this.transform.setPos(pos);
        },
        _get_scale: function(){
            return this.transform.getScale();
        },
        _set_scale: function(scale){
            this.transform.setScale(scale);
        },
        _get_rotation: function(){
            return this.transform.getRotation();
        },
        _set_rotation: function(rot){
            this.transform.setRotation(rot);
        },
        _get_rotationDeg: function(){
            return this.transform.getRotationDeg();
        },
        _set_rotationDeg: function(rotDeg){
            this.transform.setRotationDeg(rotDeg);
        },
        // is called before onUpdate the first time the entity is updated
        onInstanciation: function(){},
        // is called each frame
        onUpdate: function(){},
        // is called when the entity is destroyed
        onDestruction: function(){},
        // is called when the render state has local coordinates. 
        // (drawing a point centered on (0,0) will draw the point centered on the entity world position
        onDrawLocal: function(){},
        // is called when the render state has global coordinates
        // (drawing a point centered on (0,0) will draw it on (0,0)
        onDrawGlobal: function(){},
        // is called when the entity emits a collision to colliding entity 'ent'
        onCollisionEmit: function(ent){},
        // is called when the entity receives a collision from the entity 'ent'
        onCollisionReceive: function(ent){},
    });

    modula.Ray = modula.Class.extend({
        start: null,
        dir: null,
        maxLength: 0,
        length: 0,
        pos: null,
        next: function(length){
        },
    });

})(window.modula);
