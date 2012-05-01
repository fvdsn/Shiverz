
(function(modula){

	// Multiply a number expressed in radiant by radToDeg to convert it in degrees
	var radToDeg = 57.29577951308232;
	modula.radToDeg = radToDeg;

	// Multiply a number expressed in degrees by degToRad to convert it to radiant
	var degToRad = 0.017453292519943295;
	modula.degToRad = degToRad;

	// The numerical precision used to compare vector equality
	modula.epsilon   = 0.0000001;

	var epsilonEquals = function(a,b){
		return Math.abs(a-b) <= modula.epsilon;
	};

	var Vec2 = modula.Vec2;

	function Transform2(){
		this.pos = new Vec2();
		this.scale = new Vec2(1,1);
		this.rotation = 0.0;
		this.parent = null;
		this.childs = [];
	}

	modula.Transform2 = Transform2;

	var proto = Transform2.prototype;

	proto.type = "transform";
	proto.dimension = 2;
	proto.fullType = "transform2";

	proto.equals = function(tr){
		return  this.fullType === tr.fullType &&
			this.pos.equals(tr.pos) &&
			epsilonEquals(this.rotation, tr.rotation) &&
			epsilonEquals(this.scale.x, tr.scale.y);
	};

	proto.clone = function(){
		var tr = new Transform2();
		tr.pos  = this.pos.clone();
		tr.scale = this.scale.clone();
		tr.rotation = this.rotation;
		return tr;
	};

	proto.setPos = function(vec){
		this.pos.x = vec.x;
		this.pos.y = vec.y;
		return this;
	};

	proto.setPosXY = function(x,y){
		this.pos.x = x;
		this.pos.y = y;
		return this;
	};

	proto.setScale = function(scale){
		this.scale.x = scale.x; 
		this.scale.y = scale.y; 
		return this;
	};
	proto.setScaleXY = function(x,y){
		this.scale.x = x; 
		this.scale.y = y; 
		return this;
	};
	proto.setScaleFac = function(f){
		this.scale.x = f; 
		this.scale.y = f; 
		return this;
	};

	proto.setRotation = function(rotation){
		this.rotation = rotation;
		return this;
	};

	proto.setRotationDeg = function(rotation){
		this.rotation = rotation * degToRad;
		return this;
	};

	proto.getPos = function(){
		return this.pos.clone();
	};

	proto.getScale = function(){
		return this.scale.clone();
	};

	proto.getRotation = function(){
		return this.rotation;
	};
	
	proto.getRotationDeg = function(){
		return this.rotation * radToDeg;
	};

	proto.getWorldPos = function(){
		return this.localToWorld(new Vec2());
	};

	proto.parentToLocal = function(vec){
		return vec.sub(this.pos)
			  .rotate(-this.rotation)
			  .multXY(1.0/this.scale.x, 1.0/this.scale.y);
	};

	proto.worldToLocal = function(vec){
		if(this.parent){
			return this.parentToLocal( this.parent.worldToLocal(vec) );
		}else{
			return this.parentToLocal(vec);
		}
	};

	proto.localToParent = function(vec){
		return vec.multXY(this.scale.x, this.scale.y)
			  .rotate(this.rotation)
			  .add(this.pos);
	};

	proto.localToWorld = function(vec){
		if(this.parent){
			return this.parent.localToWorld( this.localToParent(vec));
		}else{
			return this.localToParent(vec);
		}
	};
	proto.distantToLocal = function(distTransform, vec){	//TODO Rotation, scale
		var distPos = distTransform.getWorldPos();
		var pos = this.getWorldPos();
		var localPos = pos.sub(distPos);
		if(vec){
			return localPos.add(vec);
		}else{
			return localPos;
		}
	}


	proto.addChild = function(tr){
		if(tr.parent != this){
			tr.makeRoot();
			tr.parent = this;
			this.childs.push(tr);
		}
		return this;
	};

	proto.remChild = function(tr){
		if(tr && tr.parent === this){
			tr.makeRoot();
		}
		return this;
	};

	proto.getChildCount = function(){
		return this.childs.length;
	};

	proto.getChild = function(index){
		return this.childs[index];
	};

	proto.getRoot  = function(){
		if(this.parent){
			return this.parent.getRoot();
		}else{
			return this;
		}
	};

	proto.makeRoot = function(){
		if(this.parent){
			var pchilds = this.parent.childs;
			for(var i = 0; i < pchilds.length; i++){
				while(pchilds[i] === this){
					pchilds.splice(i,1);
				}
			}
			this.parent = null;
		}
		return this;
	};

	proto.isLeaf   = function(){ return this.childs.length === 0; };

	proto.isRoot   = function(){ return !this.parent; };

	proto.rotate = function(angle){ 
		this.rotation += angle;
		return this;
	};

	proto.rotateDeg = function(angle){
		this.rotation += angle * degToRad;
		return this;
	};

	proto.scale = function(scale){
		this.scale.x *= scale.x;
		this.scale.y *= scale.y;
		return this;
	};

	proto.scaleXY = function(x,y){
		this.scale.x *= x;
		this.scale.y *= y;
		return this;
	};

	proto.scaleFac = function(f){
		this.scale.x *= f;
		this.scale.y *= f;
		return this;
	};

	proto.translate = function(deltaPos){
		this.pos.x += deltaPos.x;
		this.pos.y += deltaPos.y;
		return this;
	};

	proto.translateXY = function(x,y){
		this.pos.x += x;
		this.pos.y += y;
		return this;
	};

})(window.modula);

