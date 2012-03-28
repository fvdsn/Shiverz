
window.modula = window.modula || {};

(function(modula){

	// Multiply a number expressed in radiant by rad2deg to convert it in degrees
	var rad2deg = 57.29577951308232;
	modula.rad2deg = rad2deg;

	// Multiply a number expressed in degrees by deg2rad to convert it to radiant
	var deg2rad = 0.017453292519943295;
	modula.deg2rad = deg2rad;

	// The numerical precision used to compare vector equality
	modula.epsilon   = 0.0000001;

	var epsilon_equals = function(a,b){
		return Math.abs(a-b) <= modula.epsilon;
	};
	
	function Mat2(){

		//   | xx xy |
		//   | yx yy |
		
		this.xx = 1;
		this.xy = 0;
		this.yx = 0;
		this.yy = 1;

		if (arguments.length === 1){
			var arg = arguments[0];

			this.xx = arg.xx || this.xx;
			this.xy = arg.xy || this.xy;
			this.yx = arg.yx || this.yx;
			this.yy = arg.yy || this.yy;

		} else if (arguments.length === 4){
			this.xx = arguments[0];
			this.xy = arguments[1];
			this.yx = arguments[2];
			this.yy = arguments[3];
		}
	};

	modula.Mat2 = Mat2();

	var proto = Mat2.prototype;

	proto.type  	= 'mat';
	proto.dimension = 2;
	proto.full_type = 'mat2';

	Mat2.zero = function(){ return new Mat2(0,0,0,0); };
	Mat2.id   = function(){ return new Mat2(1,0,0,1); };
	Mat2.one  = function(){ return new Mat2(1,1,1,1); };

	proto.equals = function(mat){
		return  this.full_type == mat.full_type && 
			epsilon_equals(this.xx, mat.xx) &&
			epsilon_equals(this.xy, mat.xy) &&
			epsilon_equals(this.yx, mat.yx) &&
			epsilon_equals(this.yy, mat.yy);
	};

	proto.clone = function(mat){
		var m = new Mat2();
		m.xx = mat.xx;
		m.xy = mat.xy;
		m.yx = mat.yx;
		m.yy = mat.yy;
		return m;
	}
	
	proto.scale = function(mat){
		var m = this.clone();
		m.xx *= mat.xx || mat;
		m.xy *= mat.xy || mat;
		m.yx *= mat.yx || mat;
		m.yy *= mat.yy || mat;
		return m;
	};

	proto.add = function(mat){
		var m = this.clone();
		m.xx += mat.xx || mat;
		m.xy += mat.xy || mat;
		m.yx += mat.yx || mat;
		m.yy += mat.yy || mat;
		return m;
	};

	proto.sub = function(mat){
		var m = this.clone();
		m.xx -= mat.xx || mat;
		m.xy -= mat.xy || mat;
		m.yx -= mat.yx || mat;
		m.yy -= mat.yy || mat;
		return m;
	};
	
	proto.neg = function(mat){
		var m = this.clone();
		m.xx = - m.xx;
		m.xy = - m.xy;
		m.yx = - m.yx;
		m.yy = - m.yy;
		return m;
	};

	proto.mult = function(mat){
		var m = this.clone();
		// xx xy
		// yx yy
		m.xx = this.xx * mat.xx + this.xy * mat.yx;
		m.xy = this.xx * mat.xy + this.xy * mat.yy;
		m.yx = this.yx * mat.xx + this.yy * mat.yx;
		m.yy = this.yx * mat.xy + this.yy * mat.yy;
		return m;
	};

	proto.mult_vec = function(vec){
		var v = new Vec2();
		v.x = this.xx * vec.x + this.xy * vec.y;
		v.y = this.yx * vec.x + this.yy * vec.y;
		return v;
	};

	proto.det = function(){
		return this.xx * this.yy - this.xy * this.yx;
	};

	proto.invert = function(){
		var m = new Mat2();
		var det = this.det();
		if(det){
			det = 1.0 / det;
			m.xx = det * this.yy;
			m.xy = det * -this.xy;
			m.yx = det * -this.yx;
			m.yy = det * this.xx;
		}
		return m;
	};

	Mat2.rotation = function(angle){
		var m = new Mat2();
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		m.xx = c;
		m.xy = -s;
		m.yx = s;
		m.yy = c;
		return m;
	};

	Mat2.rotation_deg = function(angle){
		return Mat2.rotation(angle * modula.rad2deg);
	};

	Mat2.scale = function(fac){
		return new Mat2(fac,0,0,fac);
	};

	proto.rotate = function(angle){
		var rot = Mat2.rotation(angle);
		return this.mult(rot);
	};

	proto.rotate_deg = function(angle){
		return this.rotate(angle * modula.rad2deg);
	};

	proto.transpose = function(){
		return new Mat2(this.xx,this.yx,this.xy,this.yy);
	};

	proto.diagonal = function(){
		return new Vec2(this.xx,this.yy);
	};

	proto.set_diagonal = function(vec){
		var m = this.clone();
		m.xx = vec.x;
		m.yy = vec.y;
		return m;
	};

	proto.trace = function(){
		return this.xx + this.yy;
	};

	proto.row = function(index){
		if(index === 0){
			return new Vec2(this.xx, this.xy);
		}else if(index === 1){
			return new Vec2(this.yx, this.yy);
		}
	};

	proto.set_row = function(index, vec){
		var m = this.clone();
		if(index === 0){
			m.xx = vec.x;
			m.xy = vec.y;
		}else if(index === 1){
			m.yx = vec.x;
			m.yy = vec.y;
		}
		return m;
	};

	proto.collumn = function(index){
		if(index === 0){
			return new Vec2(this.xx, this.yx);
		}else if(index === 1){
			return new Vec2(this.xy, this.yy);
		}
	};

	proto.set_collumn = function(index, vec){
		var m = this.clone();
		if(index === 0){
			m.xx = vec.x;
			m.yx = vec.y;
		}else if(index === 1){
			m.xy = vec.x;
			m.yy = vec.y;
		}
		return m;
	};

})(window.modula);


