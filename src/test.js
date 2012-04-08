window.onload = function() {
	console.log("Hello World!");
	window.canvas = document.getElementById('test_canvas_1');
	window.context = canvas.getContext('2d');
	context.fillStyle = 'black';
	modula.use();
	window.scene1 = new Scene();
	window.TestEnt = Ent2.extend({
		on_first_update: function(){
			console.log("First:"+this.name+" frame:"+this._current_frame);
		},
		on_update: function(){
			console.log("Update:"+this.name+" frame:"+this._current_frame);
		},
		on_destroy: function(){
			console.log("Destroyed:"+this.name);
		},
	});
	main.set_fps(5);
	main.add_scene(scene1);
};
