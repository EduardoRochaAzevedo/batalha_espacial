(function(){

	//canvas
	var cnv = document.querySelector("canvas");
	//contexto 
	var ctx = cnv.getContext('2d');


	//RECURSOS DO JOGO =====================================================>

	//arrays
	var sprintes = [];
	var assetsToLoad = [];
	var missiles = [];
	var aliens = [];
	var messages = [];

	//var uteis
	var alienFrequency = 100;
	var alienTimer = 0;
	var shots = 0;
	var hits = 0;
	var acuracy = 0;
	var scoreToWin = 50;
	var FIRE = 0,EXPLOSION = 1 ,bgmusic = 2;

	//sprites
	//cenario
	var background = new Sprite(0,56,400,500,0,0);
	sprintes.push(background);

	//nave
	var defender = new Sprite(0,0,30,50,185,450);
	sprintes.push(defender);

	//mensagem na tela inicial
	var startMessage = new ObjectMessage(cnv.height/2,"PRESS ENTER","#f00"); 
	messages.push(startMessage);

	//mensage da pausa 
	var pausedMessage = new ObjectMessage(cnv.height/2,"PAUSED","#f00");
	pausedMessage.visible = false;
	messages.push(pausedMessage);

	//mensaegem game over
	var gameOverMessage = new ObjectMessage(cnv.height/2," ", "#f00");
	gameOverMessage.visible = false;
	messages.push(gameOverMessage);

	//placar 
	var scoreMessage = new ObjectMessage(10,"","#0f0");
	scoreMessage.font = "normal bold 15px emulogic"
	updateScore();
	messages.push(scoreMessage)
    
	//imagem
	var img = new Image();
	img.addEventListener('load',loadHandler,false);
	img.src = "img/img.png";
	assetsToLoad.push(img);
	//contador de recursos
	var loadedAssets = 0;



	//entradas
	var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32;

	//ações
	var mvLEFT = mvRight = shoot = spaceIsDown = false;

	//estados do jogo 

	var LOADING = 0,PLAYING = 1, PAUSED = 2, OVER = 3;
	var gameState = LOADING;

	//Listeners

	window.addEventListener('keydown', function(e){
		var key = e.keyCode;
		switch(key){
			case LEFT:
				mvLEFT = true;
				break;

			case RIGHT:
				mvRight = true;
				break;	

			case SPACE:
				if(!spaceIsDown){
					shoot = true;
					spaceIsDown = true;	
				}	
				break;
		}
	},false);

	window.addEventListener('keyup', function(e){
		var key = e.keyCode;
		switch(key){
			case LEFT:
				mvLEFT = false;
				break;

			case RIGHT:
				mvRight = false;
				break;

			case ENTER:
			if(gameState === PLAYING){
				playSound
			}
			if (gameState !== PLAYING){
				gameState = PLAYING;
				pausedMessage.visible = false;
			    startMessage.visible = false;
			} else {
				gameState = PAUSED;
				pausedMessage = true;
			}
			break;
			case SPACE:
			spaceIsDown = false;
		}
	},false);



	//FUNÇÕES ==============================================================>
	function 
	loadHandler(){
		loadedAssets++;
		if(loadedAssets === assetsToLoad.length){
			img.removeEventListener('load',loadHandler,false);
			//inicia o jogo
			gameState = PAUSED;

		}
	}

	function loop(){
		requestAnimationFrame(loop, cnv);
		//define as açoes com base no etado do jogo
		switch(gameState){
			case LOADING:
				console.log('loading...');
				break;
			case PLAYING:
				update();
				break;
			case OVER:
				endGame();
				break;	
		}
		render();
	}

	function update(){
		//move para a esquerda
		if(mvLEFT && !mvRight){
			defender.vx = -5;
		} 
		//move para a direita
		if(mvRight && !mvLEFT){
			defender.vx = 5;
		}
		//para a nave
		if(!mvLEFT && !mvRight){
			defender.vx = 0;
		}

		//dispara o canhão
		if(shoot){
			fireMisssile();
			shoot= false;
		}
		//atualiza a posição 
		defender.x = Math.max(0,Math.min(cnv.width - defender.width, defender.x + defender.vx));
		
		//atualiza a posição do misel
		for(var i in missiles){
			var missile = missiles[i];
			missile.y += missile.vy;
			if(missile.y < -missile.height){
				removeObjects(missile,missiles);
				removeObjects(missile,sprintes);
				updateScore();
				i--;
			}

		}

		//encremento do alienTimer
		alienTimer++;

		//cria o alien,caso o timer se = frequencia
		if(alienTimer === alienFrequency){
			makeAlien();
			alienTimer = 0;
			//ajuste na frequencia da criaçao de aliens
			if(alienFrequency > 2){
				alienFrequency--;
			}
		}

		//move o alien
		for(var i in aliens){
			var alien = aliens[i];
			if(alien.state !== alien.EXPLODED){
				alien.y += alien.vy;
				if(alien.state === alien.CRAZY){
					if(alien.x > cnv.width - alien.width || alien.x > 0){
						alien.vx *= -1;
					}
					alien.x += alien.vx;
				}

			}
			//colição do alien com a terra
			if(alien.y > cnv.height + alien.height){
			gameState = OVER; 

			}

			//confere se algun alien colidiu com a nave
			if(collide(alien,defender)){
				destroyAlien(alien);
				removeObjects(defender,sprintes);
				gameState = OVER;
			}

			//confere se algum alien foi destruido
			for(var j in missiles){
				var missile = missiles[j];
				if(collide(missile,alien) && alien.state !== alien.EXPLODED){
					destroyAlien(alien);
					hits++;
					updateScore();
					if(parseInt(hits) === scoreToWin){
						gameState = OVER;
						//destroi todos os aliens
						for(var k in alliens){
							var alienk = aliens[k];
							destroyAlien(alienk);
						}
					}
					removeObjects(missile,missiles);
					removeObjects(missile,sprintes);
					j--;
					i--;
				}
			}
		}//fim da movimentão dos aliens
	}//fim do update

	//criação do missel
	function fireMisssile(){
		var missile = new Sprite(136,12,8,13,defender.centerX() - 4,defender.y - 13);
		missile.vy = -8;
		sprintes.push(missile);
		missiles.push(missile);
		playSound(FIRE);
		shots++;
	}

	//criacao de aliens
	function makeAlien(){
		//cria um valor aleatorio entre 0 e 7 => largura do canvas / largura do canvas
		//divide o canvas em 8 partes para o posicionamento aleatorio do alien
		var alienPosition = (Math.floor(Math.random() * 8)) * 50;
	
		var alien = new Alien(30,0,50,50,alienPosition,-50);
		alien.vy = 1;

		//otimização do alien
		if(Math.floor(Math.random() * 11) > 7 ){
			alien.state = alien.CRAZY;

			alien.vx = 2;
		}

		if(Math.floor(Math.random() * 11) > 5){
			alien.state = alien.CRAZY;
			alien.vx = 2;
		}

		sprintes.push(alien);
		aliens.push(alien);
	}

	//destroi aliens
	function destroyAlien(alien){
		alien.state = alien.EXPLODED;
		alien.explode();
		playSound(EXPLOSION);
		setTimeout(function(){
			removeObjects(alien,aliens);
			removeObjects(alien,sprintes);
		},1000);
	}


	//remove os obj do jogo

	function removeObjects(objectToRemove,array){
		var i = array.indexOf(objectToRemove);
		if(i !== -1){
			array.splice(i,1);
		}
	}

	//atualização do placar
	function updateScore(){
		//calculo do aprofeitamento do misil
		if(shots === 0 ){
			acuracy = 100;
		}else {
			acuracy = Math.floor((hits/shots)*100);
		}
		//ajuste no  texto 
		if(acuracy < 100){
			acuracy = acuracy.toString();
			if(acuracy.length < 2){
				acuracy = "  " + acuracy;
			} else {
				acuracy =" " + acuracy;
			}
		}
		//ajuste no texto do hits
		hits = hits.toString();
		if(hits.length < 2){
			hits = "0" + hits;
		}
		scoreMessage.text = "HITS: "+ hits + "  PORCENTAGEM:" + acuracy + "%"
	}

	function endGame(){
		if(hits < scoreToWin){
			gameOverMessage.text = "TERRA DESTRUÍDA";
		} else {
			gameOverMessage.text = "TERRA SALVA";
			gameOverMessage.color = "#00f";
		}
		gameOverMessage.visible = true;
		setTimeout(function(){
			location.reload();
		},3000);
	}

	//effects of songs
	function playSound(soundType){
		var sound = document.createElement("audio");
		if(soundType === EXPLOSION){
			sound.src = "sound/explosion.ogg"
		} else {
			sound.src = "sound/fire.ogg"
		}
		sound.addEventListener("canplaythrough",function(){
			sound.play();
		},false);
	}

	function render(){
		ctx.clearRect(0,0,cnv.width,cnv.height);
		//exibe os sprites
		if(sprintes.length !== 0){
			for(var i in sprintes){
				var spr = sprintes[i];
				ctx.drawImage(img,spr.sourceX,spr.sourceY, spr.width,spr.height,Math.floor(spr.x),Math.floor(spr.y),spr.width,spr.height);
			}
		}
		//exibe o texto
		if(messages.length !== 0){
			for(var i in messages){
				var mensage = messages[i];
				if(mensage.visible){
					ctx.font = mensage.font;
					ctx.fillStyle = mensage.color;
					ctx.textBaseline = mensage.baseline;
					mensage.x = (cnv.width - ctx.measureText(mensage.text).width)/2; 
					ctx.fillText(mensage.text,mensage.x,mensage.y);
				}
			}
		}
	}

loop();

}());