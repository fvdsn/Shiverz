
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
            this.timeMillis = 0;
            this.timeSystem = 0;
            this.startTime = 0;
            this.fps = options.fps || 60;
            this.fixedDeltaTime = 1 / this.fps;
            this.deltaTime = 1 / this.fps
            if(options.input){
                this.setInput(options.input);
            }
            if(options.scene){
                this.addScene(options.scene);
            }
        },
        getNewUid: function(){
            this._nextUid += 1;
            return this._nextUid;
        },
        addScene: function(scene){
            scene.main = this;
            this.sceneList.push(scene);
            if(!this.scene){
                this.scene = scene;
            }
            if(!scene._uid){
                scene._uid = this.getNewUid();
            }
        },
        setInput:   function(input){
            this.input = input;
            input.main = this;
        },
        setFps: function(fps){
            this.fps = fps;
            this.fixedDeltaTime = 1/fps;
            this.deltaTime = this.theoricDeltaTime;
        },
        exit:       function(){
            this.running = false;
        },
        runStart:   function(){
            var date = new Date();
            this.running = true;
            this.startTime = date.getTime();
            this.time = 0;
            this.timeMillis = 0;
            this.timeSystem = date.getTime();
            this.restartTime = -1;
            this.frame = 0;
        },
        runFrame:   function(){
            var date = new Date();
            this.deltaTime  = (date.getTime() - this.timeSystem) * 0.001;
            this.timeSystem = date.getTime();
            this.timeMillis = this.timeSystem - this.startTime;
            this.time = this.timeMillis * 0.001;


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
                    this.scene.onSceneStart();
                }
                this.scene.onFrameStart();

                redraw = this.scene.runFrame();
                
                if(renderer && (redraw || renderer.alwaysRedraw || renderer.mustRedraw())){
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

            (function loop(){
                if(self.running && (self.restartTime < 0 || self.time < self.restartTime)){
                    self.runFrame();
                    var elapsedTimeMillis = ((new Date).getTime() - self.timeSystem);
                    var waitTime = (self.fixedDeltaTime * 1000) - elapsedTimeMillis;
                    if(waitTime < 0){
                        waitTime = 0;
                    }
                    setTimeout(loop,waitTime);
                    //webkitRequestAnimationFrame(loop);
                }else{
                    self.runEnd();
                    if(self.running){
                        self.run();
                    }
                }
            })();
        },
        restart:    function(delay){
            this.restartTime = this.time;
        },
    });

    modula.Input = modula.Class.extend({
        init: function(selector){
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
            
            var $elem = $(selector);
            
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
                    event.pageY - totalOffsetY );
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
                mpos = mpos.sub(this.scene.renderer.getSize().scale(0.5));
            }
            mpos = this.transform.localToWorld(mpos);
            return mpos;
        },
    });

    modula.Renderer = modula.Class.extend({
        alwaysRedraw:true,
        renderBackground: function(){},
        getSize  : function(){},
        drawFrame: function(scene,camera){},
        mustRedraw: function(){
            return false;
        },
    });
    
    modula.Renderer.Drawable = modula.Class.extend({
        draw: function(renderer, entity){},
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
            this.getSize = options.getSize || this.getSize;
            this._size = new Vec2();
        },
        getSize: function(){
            return new Vec2(this.canvas.width, this.canvas.height);
        },
        mustRedraw: function(){
            return !this._size.equals(this.getSize());
        },
        drawInit: function(camera){
            if(modula.draw){
                modula.draw.setContext(this.context);
            }
            
            this._size = this.getSize();
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
                this.context.translate(
                    -camera.transform.pos.x + this.canvas.width/2, 
                    -camera.transform.pos.y + this.canvas.height/2
                );
                this.context.scale(1/camera.transform.scale.x, 1/camera.transform.scale.y);
                this.context.rotate(-camera.transform.rotation);
            }
        },
        drawEnd: function(){
            context.restore();
        },
        drawFrame: function(scene,camera){
            this.drawInit(camera);
            
            function drawEntity(ent){
                this.context.save();
                this.context.translate(ent.transform.pos.x, ent.transform.pos.y);
                this.context.scale(ent.transform.scale.x, ent.transform.scale.y);
                this.context.rotate(ent.transform.rotation);
                if(ent.render){
                    if(ent.drawable){
                        ent.drawable.draw(this,ent);
                    }
                    ent.onDrawLocal();
                }
                if(ent.renderChilds){
                    for(var i = 0, len = ent.getChildCount(); i < len; i++){
                        drawEntity(ent.getChild(i));
                    }
                }
                this.context.restore();
            }
            
            for(var i = 0, len = scene._rootEntityList.length; i < len; i++){
                var ent = scene._rootEntityList[i];
                drawEntity(ent);
            }
            for(var i = 0, len = scene._entityList.length; i < len; i++){
                scene._entityList[i].onDrawGlobal();
            }

            this.drawEnd();
        },
    });
    
    modula.RendererCanvas2d.DrawableSprite = modula.Renderer.Drawable.extend({
        init: function(options){
            options = options || {};
                var self = this;
            this.z     = options.z || 0;    
            this.image = options.image || null;
    
            this.alpha = options.alpha;
            this.globalCompositeOperation = options.globalCompositeOperation;
            this.src   = options.src;

            if(this.src === undefined){
                this.src = this.image.src;
            }else{
                this.image = new Image();
                this.image.src = this.src;
            }
            this.pos   = options.pos || new Vec2(); 

            this.image.onload = function(){
                self.pos   = self.pos.addXY(-self.image.width/2,-self.image.height/2);
            };
            
        },
        clone: function(){
            var r = new modula.RendererCanvas2d.DrawableSprite({image:this.image});
            r.pos = this.pos.clone();
            r.src = this.src;
            r.alpha = this.alpha;
            r.globalCompositeOperation = this.globalCompositeOperation;
            return r;
        },
        draw: function(renderer,ent){
            context.save();
            if(this.alpha !== undefined){
                context.globalAlpha *= this.alpha;
            }
            if(this.globalCompositeOperation !== undefined){
                context.globalCompositeOperation = this.globalCompositeOperation;
            }
            renderer.context.drawImage(this.image,this.pos.x, this.pos.y);
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
        find: function(url,condition){
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
            if(condition && condition !== true){
                var nmatches = [];
                for(var i = 0; i < matches.length; i++){
                    if( condition(matches[i])){
                        nmatches.push(matches[i]);
                    }
                }
                matches = nmatches;
            }
            return matches;
        },
        // calls the function fun(ent) on every ent matched by
        // the url and the optional condition (see find()) 
        map: function(url,condition,fun){
            if(arguments.length == 2){
                fun = condition;
                condition = undefined;
            }
            var matches = this.find(url,condition);
            for(var i = 0; i < matches.length; i++){
                fun(matches[i]);
            }
        },
        // calls the method 'method' with the arguments
        // supplied in the argument list 'args' on
        // all entities matched by the url and the condition.
        // the condition is not optional, set it to null,
        // undefined or true to match all entities
        mapApply: function(url,condition,method,args){
            var matches = this.find(url,condition);
            for(var i = 0; i < matches.length; i++){
                var ent = matches[i];
                if(ent[method]){
                    ent[method].apply(ent,args);
                }
            }
        },
        // calls the method 'method with the arguments
        // supplied at and after args on all entities matched
        // by the url and the condition.
        // the condition is not optional, set it to null,
        // undefined or true to match all entities
        mapCall: function(url, condition, method, args){
            var matches = this.find(url,condition);
            var arglist = [];
            for(var i = 3; i < arguments.length; i++){
                arglist.push(arguments[i]);
            }
            for(var i = 0; i < matches.length; i++){
                var ent = matches[i];
                if(ent[method]){
                    ent[method].apply(ent,arglist);
                }
            }
        },
        // remove all the entities found by the selector if it is a string,
        // or removes the entity if selector is an entity
        remove : function(selector){
            if( (typeof selector) === 'string'){
                this.map(selector, function(ent){ 
                    this.remEnt(ent); 
                });
            }else{
                var ent = selector;
                this.remEnt(ent);
            }
        },
        // adds an entity to the scene. It will be
        // considered present in the scene at the next update.
        addEnt: function(ent){
            if(ent.main && ent.main !== this.main){
                return;
            }else if(this.main){
                ent.main = this.main;
                if(!ent._uid){
                    ent._uid = this.main.getNewUid();
                }
            }
            if(ent.scene && ent.scene !== this){
                this.remEnt(ent);
            }
            if(ent.scene !== this){
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
                    this.addEnt(ent.getChild(i));
                }
            }
        },
        //remove an entity to the scene. It will be considered 
        //removed from the scene after the current or next update
        remEnt : function(ent){
            if(!ent.isLeaf()){
                for(var i = 0; i < ent.getChildCount(); i++){
                    this.remEnt(ent.getChild(i));
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
        // return a list of all entities. do not modify the list
        getAllEnt : function(){
            return this._entityList;
        },
        // return a list of all root entities. 
        // do not modify the list
        getAllRootEnt : function(){
            return this._rootEntityList;
        },
        _entUpdate : function(ent){
            var draw = false;
            if(ent.active){
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
                    ent.startTime = this.main.time;
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
            for(var i = 0, len = this._rootEntityList.length; i < len; i++){
                var e = this._rootEntityList[i];
                //only emitters send collision events
                if( e.collisionBehaviour === 'emit' || e.collisionBehaviour === 'both'){
                    for(var j = 0; j < len; j++){
                        var r = this._rootEntityList[j];
                        //only receivers receive collision events
                        if( (r !== e) && (r.collisionBehaviour === 'receive' || e.collisionBehaviour === 'both') ){
                            if( e.collides(r) ){
                                var updated = e.onCollisionEmit(r);
                                var updated2 = r.onCollisionReceive(e);
                                draw = draw || updated || updated2; 
                            }
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
        runFrame : function(){
            var draw = false;
           
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
            return draw || false;
        },
        _entDraw : function(ent){},
        draw : function(){},
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
        addChild: function(ent){
            this.transform.addChild(ent.transform);
            return this;
        },
        // removes a child from the entity
        remChild: function(ent){
            this.transform.remChild(ent.transform);
            return this;
        },
        // returns the child entity of index 'index'
        getChild: function(index){
            var tr = this.transform.getChild(index);
            return tr ? tr.ent : undefined;
        },
        // returns the number of child entities
        getChildCount: function(){
            return this.transform.getChildCount();
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
        // returns the time remaining before the entity is destroyed
        getTimeBeforeDestruction: function(){ 
            if(this._destroyTime < Number.MAX_VALUE){
                return this._destroyTime - this.main.time;
            }else{
                return Number.MAX_VALUE;
            }
        },
        isDestroyed: function(){
            return this._state === "destroyed"; 
        },
        // returns true if the entity collides with another entity
        collides: function(ent){
            var epos = this.transform.distantToLocal(ent.transform);
            //var epos = ent.transform.getWorldPos();
            //var epos = epos.sub(this.transform.getWorldPos());
            if(ent.bound){
                var ebound = ent.bound.cloneAt(epos.addXY(ent.bound.cx, ent.bound.cy));
                return this.bound.collides(ebound);
            }else{
                return this.contains(epos);
            }
        },
        // returns the smallest vector that would make this entity not collide 'ent' by translation
        collisionVector: function(ent){
            var epos = this.transform.distantToLocal(ent.transform);
            if(ent.bound){
                var ebound = ent.bound.cloneAt(epos.addXY(ent.bound.cx, ent.bound.cy));
                return this.bound.collisionVector(ebound);
            }
            return new Vec2();
        },
        // returns the smallest distance on each axis that would make this entity not collide with
        // 'ent' by translation on one axis
        collisionAxis: function(ent){
            var epos = this.transform.distantToLocal(ent.transform);
            if(ent.bound){
                var ebound = ent.bound.cloneAt(epos.addXY(ent.bound.cx, ent.bound.cy));
                return this.bound.collisionAxis(ebound);
            }
            return new Vec2();
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

})(window.modula);
