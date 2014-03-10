enchant();

//Stage Variables
var moveSpeed = 4;
var health = 5;
var stgWidth = 960;
var stgHeight = 512;

// Paths variables
var en_imgs = '../static/images/';
var en_path = '../static/js/enchant.js-builds-0.8.0-fix/';

var DIR_LEFT = 0;
var DIR_RIGHT = 1;
var DIR_UP = 2;
var DIR_DOWN = 3;

/* Web Socket Messaging */

function sendPlayer(player) {
  /* send player's coords, icon, name, health */
  data = {
    type: "update",
    user: player.name,
    posx: player.x,
    posy: player.y,
    icon: player.icon
  }

  ws.send(JSON.stringify(data));
}

player_dict = {}

function updatePlayer(message) {
  /* go through a dict of players (sub-dict) and position them */ 
  user = message['user'];
  if(user in player_dict) {
    /* just update their position */
    player_dict[user].x = message['posx'];
    player_dict[user].y = message['posy'];
  }
  else {
    /* create new user */
    game = Game.instance;
    player_dict[user] = new Sprite(32, 32);
    player_dict[user].image = game.assets[en_imgs+message['icon']];
    player_dict[user].x = message['posx'];
    player_dict[user].y = message['posy'];
    game.currentScene.addChild(player_dict[user]);
  }
}

//Begin game code
function runGame() {
    var game = new Game(stgWidth, stgHeight);

    //Preload images
    //Any resources not preloaded will not appear
    game.preload(en_imgs+'female-warrior30px.png',en_imgs+'icon0.png', en_imgs+'diamond-sheet.png', 
                en_imgs+'bg.png', en_imgs+'fireball16.png', en_imgs+'cavemap.png', en_imgs+'rogue30px.png');

    game.onload = function () {
      //Prepares the game
        //01 Add Background
        bg = new Sprite(stgWidth, stgHeight);
        bg.image = game.assets[en_imgs+'bg.png'];
        game.rootScene.addChild(bg);

        //02 Add Player
        player = new Player();
        game.rootScene.addChild(player);

        //05 Add Gem
        gem = new Gem();
        game.rootScene.addChild(gem);

        // Add Spell Fireball
        fireball = new Spell();

        //06 Create Label
        game.score = 0;
        scoreLabel = new Label("Score: ");
        scoreLabel.addEventListener('enterframe', function(){
            this.text = "Score:"+game.score;
        });
        scoreLabel.x = 10;
        scoreLabel.y = 10;
        scoreLabel.color = "white";
        game.rootScene.addChild(scoreLabel);
        nameLabel = new Label("");
        nameLabel.addEventListener('enterframe', function() {
            this.text = player.name;
        });
        nameLabel.color = "white";
        nameLabel.x = 10;
        nameLabel.y = 30;
        game.rootScene.addChild(nameLabel);

        //08 Health Label
        healthLabel = new Label("Health: ");
        healthLabel.addEventListener('enterframe', function(){
            this.text = "Health: "+player.health;
          
            if(player.health <= 2){
                this.color = "red";
            }
        });
        healthLabel.color = "white";
        healthLabel.x = 6 * stgWidth/8;
        healthLabel.y = 10
        game.rootScene.addChild(healthLabel);

        //04 Touch Listener - I won't be using this to move but rather to select targets
        game.rootScene.addEventListener('touchend', function(e){
            fireball.x = player.x;
            fireball.y = player.y;
            game.rootScene.addChild(fireball);
            fireball.tx = e.x-16;
            fireball.ty = e.y-16;
        });
        //Game Condition Check
        /*game.rootScene.addEventListener('enterframe', function() {
            //08 Game Over
            if(player.health <= 0){
                game.end();
            }
            //08 Make Bomb Generator
            if(player.age % 30 === 0){
                bomb = new Bomb();
                game.rootScene.addChild(bomb);
            }
        });*/
        game.pushScene(game.makeEntryScene());
    };
    game.start();

    // Entry Scene Creation
    game.makeEntryScene = function() {
      var sceneEntry = new Scene();

      // Background creation
      var map = new Map(32, 32);
      map.image = game.assets[en_imgs+'cavemap.png'];
      map.loadData([    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                        [0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0],
                        [0,0,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0,0],
                        [0,0,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,0,0],
                        [0,0,0,0,0,0,0,0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0,0,0,0,0,0,0,0]

                    ]);

        map.collisionData = [
                                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                                [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
                                [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
                                [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
                                [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1]
                            ];

        sceneEntry.addChild(map);
        sceneEntry.addChild(player);
        sendPlayer(player);

        player.addEventListener(Event.ENTER_FRAME, function() {
            //Move up
            if (game.input.up) {
                player.dir = DIR_UP;
                player.y -= 4;
                if (map.hitTest(player.x + 16, player.y + 32)) 
                { player.y += 6; }
                sendPlayer(player);
            }
            //Move down
            else if (game.input.down) {
                player.dir = DIR_DOWN;
                player.y += 4;
                //console.log(map.hitTest(player.x + 16, player.y + 32));
                if (map.hitTest(player.x + 16, player.y + 32)) 
                { player.y -= 4; } 
                sendPlayer(player);
            }
            //Move left
            else if (game.input.left) {
                player.dir = DIR_LEFT;
                player.x -= 4;
                if (map.hitTest(player.x + 16, player.y + 32)) 
                { player.x += 4; }
                sendPlayer(player);
            }
            //Move right
            else if (game.input.right) {
                player.dir = DIR_RIGHT;
                player.x += 4;
                if (map.hitTest(player.x + 16, player.y + 32)) 
                { player.x -= 4; }
                sendPlayer(player);
            }

            //Frame setting
            //if (!game.input.up && !game.input.down && !game.input.left && !game.input.right) player.age = 1;//Standing Still
            //player.frame = player.anim[player.dir * 4 + (player.age % 4)];
        });
        return sceneEntry;
    }

    var toon = Math.floor(Math.random()*2)
    console.log(toon);
    var icon = "female-warrior30px.png";
    switch(toon) {
        case 0:
            icon = "female-warrior30px.png";
            break;
        case 1:
            icon = "rogue30px.png";
            break;
        default:
            icon = "rogue30px.png";
            break;
    }

    //02 Player Class
    Player = Class.create(Sprite, {
        initialize: function() {
            this.name = username;
            Sprite.call(this, 30, 30);

            this.icon = icon;
            this.image = game.assets[en_imgs+icon];
            this.x = stgWidth/2;
            this.y = stgHeight/2;
            this.frame = 44;
            this.health = 4;
            //03 Bind Keys
            game.keybind(65, 'left');
            game.keybind(68, 'right');
            game.keybind(87, 'up');
            game.keybind(83, 'down');
          
            //04 Mouse Variables
            /*this.tx = this.x;
            this.ty = this.y;*/
        },

        onenterframe: function() {
            //03 Player Controls
            /*if(game.input.left && !game.input.right){
                this.x -= moveSpeed;
            }
            else if(game.input.right && !game.input.left){
                this.x += moveSpeed;
            }
            if(game.input.up && !game.input.down){
                this.y -= moveSpeed;
            }
            else if(game.input.down && !game.input.up){
                this.y += moveSpeed;
            }*/
            
            //04 Mouse Update
            /*this.x += (this.tx - this.x)/4;
            this.y += (this.ty - this.y)/4;*/
        }
    });

    Spell = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, 16, 16);

            //game = Game.instance;
            this.image = game.assets[en_imgs+'fireball16.png'];

            this.x = 50;
            this.y = 50;
        },
        onenterframe: function() {
            //04 Mouse Update
            this.x += (this.tx - this.x)/4;
            this.y += (this.ty - this.y)/4;

        }
    })

    //05 Gem Class
    Gem = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, 16, 16);
            // 2 - Access to the game singleton instance
            //game = Game.instance;
            this.image = game.assets[en_imgs+'diamond-sheet.png'];
            /* These x and y coordinates place the gem in the top right corner of the screen */
            /*this.x = 3 * stgWidth/4;
            this.y = stgHeight/4;*/
            this.x = Math.random() * (stgWidth - 16);
            this.y = Math.random() * (stgHeight - 16);

            if(this.y < 50){
                this.y = 50;
            }
            this.frame = 0;
        },

        onenterframe: function() {
            if(this.age % 2 === 0){
                if(this.frame == 5){
                    this.frame = 0;
                }
                else{
                    this.frame++;
                }
            }
            //Rotating using scaleX
            
            //07 Collision Check
            if(this.intersect(player)){
                gem = new Gem();
                game.rootScene.addChild(gem);
                game.score += 100;
                game.rootScene.removeChild(this);
            }
        }
    });

    //08 Bomb Class
    Bomb = Class.create(Sprite, {
        initialize: function() {
            Sprite.call(this, 16, 16);
            this.image = game.assets[en_imgs+'icon0.png'];
            this.x = Math.random() * (stgWidth - 16);
            this.y = Math.random() * (stgHeight - 16); //Account for the bottom part
            if (this.y < 50) {
                this.y = 50;
            }

            this.frame = 24;
        },

        onenterframe: function() {
            if (this.age === 60) {
                game.rootScene.removeChild(this);
            }

            if (this.intersect(player)) {
                player.health--;
                game.rootScene.removeChild(this);
                console.log("ouch!");
            }

            if (this.intersect(fireball)) {
                game.rootScene.removeChild(this);
                game.rootScene.removeChild(fireball);
                console.log("gotcha!");
            }

            if (this.age % 10 === 0) {
                if (this.frame === 25) {
                    this.frame = 24;
                } else {
                    this.frame++;
                }
            }
        }

    });

}