(function() {
	var spr=PP.spr,rm=PP.rm,obj=PP.obj,snd=PP.snd,al=PP.al,global=PP.global,Alarm=PP.Alarm,collision=PP.collision,draw=PP.draw,init=PP.init,key=PP.key,load=PP.load,loop=PP.loop,mouse=PP.mouse,physics=PP.physics,Sound=PP.Sound,SoundEffect=PP.SoundEffect,Sprite=PP.Sprite,view=PP.view,walkDown=PP.walkDown;
	
	init('game',800,480);
	loop.rate = 30;	//	speed
	birth_rate = 4;	//	birth rate
	number_from = 2;	//	range begin
	number_to = 19;	//	range end
	minimum_balloons = 5;
	maximum_balloons = 10;
	toggle = true;
	
	// The balloon object is created to better organize the sprites
	spr.balloon = {};
	 
	// The new Sprite function will return a new sprite object.
	spr.balloon.red = new Sprite('sprites/balloon_red.png',1,0,0);
	spr.balloon.blue = new Sprite('sprites/balloon_blue.png',1,0,0);
	spr.balloon.green = new Sprite('sprites/balloon_green.png',1,0,0);
	spr.background = new Sprite('sprites/sky_'+Math.ceil(Math.random()*5)+'.jpg',1,0,0);
	//	sounds
	spr.pop = new Sound('snd/pop.ogg');
	spr.pop2 = new Sound('snd/pop2.ogg');
	spr.giggle = new Sound('snd/giggle.ogg');
	
	// This function will be invoked when all of the resources have finished downloading
	load(function() {
		obj.balloon = {
			parent: {
				mask: spr.balloon.red.mask,
				
				// The initialization function will be invoked when an object is registered.
				initialize: function(t) {
					// The t parameter passed to this function will hold the same value as "this" will inside a function
					// It could be written like this in every function:
					// var t = this;
					// Having it passed as a parameter saves time.
					 
					// The x and y properties determine the position of the object in game space.
					// The x coordinates increase to the left and the y coordinates increase downwards.
					 
					// The balloon will be randomly assigned a position
					t.x = Math.floor(Math.random()*12)*64+32;
					 
					// This y coordinate will start the balloon below the view of the game view.
					t.y = 423;
					t.value = Math.floor(Math.random()*19)+1;
					t.value = number_from + Math.floor(Math.random()*(number_to-number_from+1));
					t.angle = 0;
				},
				 
				tick: function(t) {
					// This controls the upward movement of the balloon
					t.y -= t.vspeed;
					for(var i in loop.regObjects) 
					{ 
						g = loop.regObjects[i];
						if( t === g )
						{
							break;
						}
						if(g.mask)
						if(t.y>g.y)
						{
							o1 = t;
							o2 = g;
							res = PP.collision.resolveShape(o1.mask,o1.x,o1.y,o1.angle);
							res1 = PP.collision.resolveShape(o2.mask,o2.x,o2.y,o2.angle);
							col = PP.collision.sat(res,res1,o1,o2,true,0.5,false);
						}
					}
		 
					// mouse.left.down holds a value of true if the left mouse button has been
					// pressed down since the end of the last loop
					// The collision.point function determines if a point lies within a mask.
					if ((mouse.left.down || PP.touch) && collision.point(t,mouse.x,mouse.y,false)) {
						for(var i in loop.regObjects) 
						{ 
							g = loop.regObjects[i];
							if(t.value<g.value)
							{
								spr.giggle.play();
								console.log('choose ' + g.value);
								return;
							}
						}
						if(toggle)
							spr.pop.play();
						else
							spr.pop2.play();
						toggle = !toggle;	
						global.total_active --;
						global.score += global.total_active;
						loop.remove(t);
					}
					 
					// If the balloon moves so far up that it is outside of the view, remove it
					if (t.y < -40) {
						global.total_active --;
						loop.remove(t);
					}
				},
				 
				draw: function(t) {
					// The actual sprite of the balloon is drawn here.
					// All sprite objects have a draw method that is used to draw a sprite.
					t.sprite.draw(t.x,t.y);
					
					draw.textHalign = 'center';
					draw.color = 'white';
					draw.font = 'normal normal normal 40px Georgia';
					draw.text(t.x+30,t.y+60,t.value);
				}
			},
		 
			red: {
				vspeed: 1,
				sprite: spr.balloon.red
			},
		 
			blue: {
				vspeed: 3/2,
				sprite: spr.balloon.blue
			},
		 
			green: {
				vspeed: 2,
				sprite: spr.balloon.green
			}
		};
		 
		// Set up the inheritence chain
		obj.balloon.red.proto = obj.balloon.parent;
		obj.balloon.blue.proto = obj.balloon.parent;
		obj.balloon.green.proto = obj.balloon.parent;

		obj.background = {
			depth: -1,
			draw: function(t) {
				spr.background.draw(0,0);	
			}
		};
		
		// The gameOver object controls the drawing of the final score and allows the user
		// to press enter to start a new game.
		obj.gameOver = {
			tick: function(t) {
				// If the enter key has been released, switch back to the play room
				
				if (key.enter.up || mouse.left.up || PP.touch) {
					loop.room = rm.play;
				}
			},
			
			// Here the game over texts are drawn
			draw: function(t) {
				draw.textHalign = 'center';
				draw.textValign = 'middle';
                draw.color = 'white';
                if(global.score != undefined)
                {
				    draw.font = 'normal normal normal 60px Georgia';
				    draw.text(400,340,'Score: '+global.score);
				}
                draw.font = 'normal normal normal 40px Georgia';
				draw.text(400,240,'Click here to start a new game');
			}
		};

		obj.score = {
			initialize: function(t) {
				// Create the alarm to be used as a countdown
				t.countdown = new Alarm(function() {
					// When the alarm reaches 0, switch to the rm.gameOver room.
					loop.room = rm.gameOver;
				});
				
				// Alarms are decremented by 1 each loop. If we take the loops per second and multiply by some
				// number, we will be able to count down in seconds. Here, the countdown will take 30 seconds.
				t.countdown.time = loop.rate*30;
			},
			
			draw: function(t) {
				// The textHalign property sets the horizontal alignment of the draw.text function
				draw.textHalign = 'left';
				// The textValign property sets the vertical alignment of the draw.text function
				draw.textValign = 'bottom';
				// Change the drawing color (used for things like primitive shapes and text) to white, so the score text
				// will be visible against a brown background
				draw.color = 'white';
				// The draw.font property takes a css font string, to be used by the draw.text function
				draw.font = 'normal normal normal 20px Georgia';
				// Here, the score is drawn in the bottom left at position (0,480)
				draw.text(10,475,'Score: '+global.score);
				
				// If there are 5 seconds left, switch to red
				if (t.countdown.time <= loop.rate*5) {
					draw.color = 'red';
				}
				
				// Draw the current time remaining.
				draw.text(10,450,Math.ceil(t.countdown.time/loop.rate)+' Seconds Left');
			}
		};
		

		rm.play = function() {
			// Register the background and score objects
			loop.register(obj.background,0,0);
			loop.register(obj.score,0,0);

			global.score = 0;
			global.total_active = 0;
			// The balloonCreator alarm controls the timing of the creations of the balloons
			var balloonCreator = new Alarm(function() {
				var bal = obj.balloon;
				// The choose function will randomly choose one of the passed parameters and return it.
				// The loop.beget function is a combination of the Object.create and loop.register functions
				if(global.total_active<maximum_balloons)
				{
					var new_baloon = loop.beget(Math.choose(bal.red,bal.blue,bal.green));
					global.total_active ++;
				}
				// The alarm resets itself for half a second. Balloons will spawn half a second apart.
				if(global.total_active<minimum_balloons)
					this.time = 0;
				else
					this.time = loop.rate*birth_rate;
			});
			var bal = obj.balloon;
				
			var new_baloon = loop.beget(bal.red);
			new_baloon.y -= Math.random()*400;
			var new_baloon = loop.beget(bal.blue);
			new_baloon.y -= Math.random()*400;
			var new_baloon = loop.beget(bal.green);
			new_baloon.y -= Math.random()*400;
			
			global.total_active = 3;
			// Set the initial alarm time to 0 so it will trigger right away.
			balloonCreator.time = 0;
		};
		
		rm.gameOver = function() {
			loop.register(obj.background,0,0);
			loop.register(obj.gameOver);
		};
		
		loop.active = true;
		loop.room = rm.gameOver;
	});
}());
