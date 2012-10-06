window.import_game = function(module){

	module.Player = Class.extend({
		name: 'unnamed',
		nickname: '<|o|> UNN4M3d',
		team: 'spectator',
		state: 'spectating',
		ship: null,
        init: function(opts){
            opts = opts || {};
            this.name = opt.name || this.name;
        },
	});

	module.Score = Class.extend({
		points: 0,
		frags: 0,
		deaths: 0,
        compare: function(score){
            if(this.points > score.points){
                return 1;
            }else if(this.points === score.points){
                return 0;
            }else{
                return -1;
            }
        },
	});

	module.Game = Class.extend({
		name: 'DebugMode',
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
            this.playerScores  = {};
            this.teamScores = {};
            for(var i = 0; i < teams.length; i++){
                this.teamScores[this.teams[i]] = new module.Score();
            }
			this.level = opt.level || this.levelRotation[0];
			this.phase = opt.phase || 'warmup';
            this.phaseTime = 0;
		},
        launch:function(){
            var canvas   = document.getElementById('test_canvas_1');
            var context  = canvas.getContext('2d');
            var renderer = new RendererCanvas2d({
                // passes:[],
                canvas: canvas,
                getSize: function(){
                    return new Vec2(window.innerWidth, window.innerHeight);
                },
                background: 'rgba(40,35,30,1)',
                alwaysRedraw: true,
            });

            var input: new Input({
                //alias: bindings,
            });

            var GameScene = Scene.extend({
                game: this,
                onSceneStart: function(){
                },
                onFrameEnd: function(){
                },
            });

            var main = new Main({
                input: input,
                scene: new GameScene(),
            });
            main.run();
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
			this.players[playername] = new module.Player({name:playername}),
            this.playerScores[playername] = new module.Score();
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
            this.players[playername].team = teamname;
		},
		getPlayerTeam: function(playername){
            return this.players[playername].team;
		},
		getAllPlayersByTeam: function(teamname){
            var p = [];
            for(playername in this.players){
                if(this.players[playername].team === teamname){
                    p.push(playername);
                }
            }
            return p;
		},
		getPlayerScore: function(playername){
            return this.playerScores[playername];
		},
		getTeamScore: function(teamname){
            return this.teamScores[teamname];
		},
		getWinnerTeams: function(){
            var winners = [this.teams[0]];
            var winnerScore = this.getTeamScore(this.teams[0]);
            for(var i = 1; i < this.teams.length; i++){
                var score = this.getTeamScore(this.teams[i]);
                if( score.compare(winnerScore) > 0){
                    winners = [this.teams[i]];
                    winnerScore = score;
                }else if( score.compare(winnerScore) === 0){
                    winners.push(this.teams[i]);
                }
            }
            return winners;
        },
		getWinnerPlayers: function(){
            var winners = [this.players[0]];
            var winnerScore = this.getPlayerScore(this.players[0]);
            for(var i = 1; i < this.players.length; i++){
                var score = this.getPlayerScore(this.players[i]);
                if( score.compare(winnerScore) > 0){
                    winners = [this.players[i]];
                    winnerScore = score;
                }else if( score.compare(winnerScore) === 0){
                    winners.push(this.players[i]);
                }
            }
            return winners;
		},
        loadLevel : function(levelname){
            this.level = new module.Level({name:levelname});
        },
        getLevelList: function(){
            return this.levels;
        },
		getLevel: function(){
            return this.level;
		},


		getAllPhases: function(){
            var phases = [];
            for(phase in this.phases){
                phases.push(phase);
            }
            return phases;
		},
		getPhase: function(){
            return this.phase;
		},
		setPhase: function(phase){
            this.phase = phase;
            if(this.main){
                this.phaseTime = this.main.time;
            }else{
                this.phaseTime = 0;
            }
		},
		getPhaseTime: function(){
            return this.phaseTime;
		},
		getPhaseDuration: function(){
            return this.phases[this.phase] || 0;
		},
		onPlayerUpdate:function( playername, player){
		},
		onTeamUpdate: function(teamname){
		},
		onGameUpdate: function(){
		},
		startGame: function(){
            // this should start an instance of modula
		},
		quitGame:  function(){
            // this should close the instance of modula
		},
	});
};
