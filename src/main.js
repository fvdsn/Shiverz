
window.modula = window.modula || {};

(function(modula){

	modula.Main = {
		game:	null,
		scene:	null,
		camera:	null,
		rng:	null,
		running:	false,
		restart_time: 	-1,
		frame:	0,
		time:	0,
		time_millis:	0,
		time_system:	0,
		fps:	60,
		delta_time:	1/60,
		resolution: 	new Vec2(800,600),
		
		set_fps:	function(){},
		exit:		function(){},
		run_start:	function(){},
		run_frame:	function(){},
		run_end:	function(){},
		run_exit:	function(){},
		run:		function(){},
		restart:	function(delay){},
		tick:		function(delay){},
	};

	modula.Game = function(){
		this.on_game_start = function(){};
		this.on_frame_start = function(){};
		this.on_frame_end   = function(){};
		this.on_game_end = function(){};
	};

	modula.Camera = function(){
		this.transform = new Transform2();
		this.z_near = 100;
		this.z_far = -100;
		this.viewport = null;
		this.resolution = new Vec2();
		this.width2height = 1;
		this.heigth2width = 1;
	};

		


})(window.main);
