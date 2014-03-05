enchant();

//Stage Variables
var moveSpeed = 4;
var health = 5;
var stgWidth = 640;
var stgHeight = 480;

// Paths variables
var en_imgs = '../static/images/';
var en_path = '../static/js/enchant.js-builds-0.8.0-fix/';

//02 Player Class
Player = Class.create(Sprite, {
    initialize: function() {
        this.name = "{{username}}";
        Sprite.call(this, 16, 16);

        // 2 - Access to the game singleton instance
        game = Game.instance;

        this.image = game.assets[en_imgs+'icon0.png'];
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
        if(game.input.left && !game.input.right){
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
        }
        
        //04 Mouse Update
        /*this.x += (this.tx - this.x)/4;
        this.y += (this.ty - this.y)/4;*/
    }
});

Spell = Class.create(Sprite, {
    initialize: function() {
        Sprite.call(this, 16, 16);

        game = Game.instance;
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
        game = Game.instance;
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

//Begin game code
window.onload = function(){
    var game = new Game(stgWidth, stgHeight);
    
    //Preload images
    //Any resources not preloaded will not appear
    game.preload(en_imgs+'icon0.png', en_imgs+'diamond-sheet.png', en_imgs+'bg.png', en_imgs+'fireball16.png');

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
        game.rootScene.addEventListener('enterframe', function() {
            //08 Game Over
            if(player.health <= 0){
                game.end();
            }
            //08 Make Bomb Generator
            if(player.age % 30 === 0){
                bomb = new Bomb();
                game.rootScene.addChild(bomb);
            }
        });
    };
    game.start();
};