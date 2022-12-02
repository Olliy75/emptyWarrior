import Phaser from "phaser";

let character;
let inputKeys;
let audio_jump;
let audio_win;
let platforms;
let camera;
let score = 0
let exit = false
let gameText;
let gameOverText;
let hasJumped;


const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 500,
    height: 500,
    render: {pixelArt: true},
    physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 500 },
          debug: false
      }
  },
    scene: {
        preload(){
          //Set up code and loading assets goes here
          this.load.image('background', '../assets/images/background.png');
          this.load.spritesheet('knight', '../assets/knight.png', {frameWidth: 32, frameHeight: 32})
            this.load.audio('jump', '../assets/jump.wav')
            this.load.audio('win', '../assets/win.wav')
            this.load.image('tiles', '../assets/tilesets/platformPack_tilesheet.png');
            this.load.image('spike', '../assets/images/spike.png');
            this.load.image('gems', '../assets/images/Gems.png');
            this.load.image('key', '../assets/images/Key.png');
            this.load.image('door', '../assets/images/Door.png');
            this.load.tilemapTiledJSON('map', '../assets/tilemaps/level5.json');
            
        },
        create(){
          //Creating objects for the game and setting up game logic goes here
          const backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0);
          backgroundImage.setScale(10, 10);
          gameOverText = this.add.text(6200, 5500, gameText, {fontSize: '64px', color: '#FA0808', fontWeight: 'bold'})

          character = this.physics.add.sprite(300, 6000, 'idle',0).setSize(13,30).setOffset(10,0)
          character.setScale(1.8)
          character.setBounce(0)  
          character.setCollideWorldBounds(false)
          

          const map = this.make.tilemap({ key: 'map' });
          const tileset = map.addTilesetImage('platformPack_tilesheet', 'tiles');
          platforms = map.createStaticLayer('Platforms', tileset);
          platforms.setCollisionByExclusion(-1, true);
          this.physics.add.collider(character, platforms);


          const spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
          });
          map.getObjectLayer('Spikes').objects.forEach((spike) => {
            const spikeSprite = spikes.create(spike.x, spike.y - 32, 'spike');
            spikeSprite.body.setSize(spike.width * 2, spike.height);
          });
          this.physics.add.collider(character, spikes, playerHitSpike, null, this);

          const gems = this.physics.add.group({
            allowGravity: false,
            immovable: true
          });
          map.getObjectLayer('Gems').objects.forEach((gem) => {
            const gemSprite = gems.create(gem.x, gem.y, 'gems');
            gemSprite.body.setSize(gem.width, gem.height);
          });
          this.physics.add.collider(character, gems, playerHitGem, null, this);

          const doors = this.physics.add.group({
            allowGravity: false,
            immovable: true
          });
          map.getObjectLayer('Doors').objects.forEach((door) => {
            const doorSprite = doors.create(door.x + 32, door.y - 64, 'door');
            doorSprite.body.setSize(door.door * 2, door.height);
          });
          this.physics.add.collider(character, doors, playerHitDoor, null, this);

          const keys = this.physics.add.group({
            allowGravity: false,
            immovable: true
          });
          map.getObjectLayer('Keys').objects.forEach((key) => {
            const keySprite = keys.create(key.x + 32, key.y - 20, 'key');
            keySprite.body.setSize(key.width * 2, key.height);
          });
          this.physics.add.collider(character, keys, playerHitKey, null, this);


          inputKeys = this.input.keyboard.createCursorKeys();
          audio_jump = this.sound.add('jump')
          audio_win = this.sound.add('win')
      
          this.anims.create({
              key: 'left',
              frameRate: 35,
              repeat: -1,
              frames: this.anims.generateFrameNumbers('knight', { start:10, end: 14 })
          })

          this.anims.create({
              key: 'right',
              frameRate: 35,
              repeat: -1,
              frames: this.anims.generateFrameNumbers('knight', { start:15, end: 19 })
          })

          this.anims.create({
              key: 'idle',
              frameRate: 10,
              repeat: -1,
              frames: this.anims.generateFrameNumbers('knight', { start: 0, end: 0 })
          })

            this.anims.create({
              key: 'jump',
              frameRate: 35,
              repeat: -1,
              frames: this.anims.generateFrameNumbers('knight', { start: 1, end: 4 })
          })

             this.anims.create({
              key: 'downStrike',
              frameRate: 15,
              repeat: -1,
              frames: this.anims.generateFrameNumbers('knight', { start: 20, end: 24 })
          })

          this.anims.create({
            key: 'upStrike',
            frameRate: 15,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('knight', { start: 25, end: 29 })
        })

        this.anims.create({
          key: 'leftStrike',
          frameRate: 15,
          repeat: -1,
          frames: this.anims.generateFrameNumbers('knight', { start: 30, end: 34 })
      })

      this.anims.create({
        key: 'rightStrike',
        frameRate: 15,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('knight', { start: 35, end: 39 })
    })

    camera = this.cameras.main;
    camera.setBounds(0, 0, 6400, 6400);
    camera.startFollow(character, true, 0.05, 0.05);
        },
        update(){
          //Any logic that needs to update continously goes here
          //Update runs every frame of the browser
  // Control the player with left or right keys
  if (inputKeys.left.isDown) {
    character.setVelocityX(-200);
    if (character.body.onFloor()) {
      character.play('left', true);
    }
  } else if (inputKeys.right.isDown) {
    character.setVelocityX(200);
    if (character.body.onFloor()) {
      character.play('right', true);
    }
  } else {
    // If no keys are pressed, the player keeps still
    character.setVelocityX(0);
    // Only show the idle animation if the player is footed
    // If this is not included, the player would look idle while jumping
    if (character.body.onFloor()) {
      if(inputKeys.space.isDown){
        character.play("upStrike", true)
      }
      else{
        character.play('idle', true);
      }
      hasJumped = 0
    }
  }

  if (inputKeys.space.isDown){
    character.play("upStrike", true)
  }

  if (inputKeys.up.isDown && Phaser.Input.Keyboard.JustDown(inputKeys.up)&&(hasJumped < 2)){
    character.setVelocityY(-380);
    if (hasJumped === 0){
      character.play('jump', true);
    }
    if (hasJumped === 1){
      character.play('jump', true);
    }
    audio_jump.play()
    hasJumped++
}

  // if (character.body.velocity.x > 0) {
  //   character.setFlipX(false);
  // } else if (character.body.velocity.x < 0) {
  //   // otherwise, make them face the other side
  //   character.setFlipX(true);
  // }
  
        // if(isRunning && !audio_feet.isPlaying) {
        //     audio_feet.play()
        // }

        // if(!isRunning && audio_feet.isPlaying) {
        //     audio_feet.stop()
        // }
        }
    }
});

function playerHitSpike(character, spike) {
  // Set velocity back to 0
  character.setVelocity(0, 0);
  // Put the player back in its original position
  character.setX(300);
  character.setY(6000);
  // Use the default `idle` animation
  character.play('idle', true);
  // Set the visibility to 0 i.e. hide the player
  character.setAlpha(0);
  // Add a tween that 'blinks' until the player is gradually visible
  let tw = this.tweens.add({
    targets: character,
    alpha: 1,
    duration: 100,
    ease: 'Linear',
    repeat: 5,
  });
}

function playerHitGem(character, gem) {
  score++
  gem.destroy()
}

function playerHitKey(character, key) {
  exit = true
  key.destroy()
  }

function playerHitDoor(character, door) {
    if (exit){
      console.log("you win i guess")
      gameText =  "GG WP"
    gameOverText.setText(gameText)
    audio_win.play()
    }
    }