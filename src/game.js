function import_game(module){

	module.Player = Class.extend({
		name: 'unnamed',
		nickname: '<|o|> UNN4M3d',
		team: 'spectator',
		state: 'spectating',
		ship: null,
	});

	module.Score = Class.extend({
		points: 0,
		frags: 0,
		deaths: 0,
		medals:{},
		shots:{},
		accuracy:{},
	});

	module.Game = Class.extend({
		name: 'DebugMode'
		teams: ['red','blue','spectator'],
		maxplayers: 8,
		playerstates: ['spectating','spawning','playing','dead','scoreboard'],
		phases: {
			'warmup' : 20,
			'play' : Number.MAX_VALUE,
			'scoreboard': 10,
		},
		levels :{
			'defaultlevel': null,
		},
		levelRotation:[
			'defaultlevel',
		],
		init: function(opt){
			this.players = {};
			this.player  = null;
			this.level = opt.level || this.levelRotation[0];
			this.phase = opt.phase || 'warmup';
		},
		load: function(gamedescr){
		},
		save: function(){
		},
		getName: function(){ 
			return this.name; 
		},
		addPlayer: function(playername,local,info){
			if(this.players[playername]){
				this.removePlayer(playername);
			}
			this.players[playername] = new module.Player({name:playername, info:info ||{}}),
			if(local){
				this.player = playername;
			}
		},
		removePlayer: function(playername){
			if(this.player === playername){
				this.player = null;
			}
			delete this.players[playername];
		},
		getPlayer: function(playername){
			if(playername){
				return this.players[playername];
			}else{
				return this.players[this.player];
			}
		},
		getAllPlayers: function(){
			return this.players;
		},
		isPlayerLocal: function(playername){
			return playername === this.player;
		},
		setPlayerTeam: function(playername, teamname){

		},
		getPlayerTeam: function(playername){
		},
		getAllPlayersByTeam: function(teamname){
		},
		
		getPlayerScore: function(playername){
		},
		setPlayerScore: function(playername,score){
		},
		getTeamScore: function(teamname){
		},
		setTeamScore: function(teamname,score){
		},
		getScoreBoard:  function(){
		},
		getWinnerTeam: function(){
		},
		getWinnerPlayer: function(){
		},

		setLevel: function(levelname){
		},
		getLevel: function(){
		},

		startGame: function(){
		},
		quitGame:  function(){
		},

		getAllPhases: function(){
		},
		getPhase: function(){
		},
		setPhase: function(){
		},
		getPhaseTame: function(){
		},
		getPhaseDuration: function(){
		},

		onPlayerUpdate:function( playername, player){
		},
		onTeamUpdate: function(teamname){
		},
		onGameUpdate: function(){
		},
	})
}