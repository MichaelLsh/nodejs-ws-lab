// This is browser code that gets transformed using Parcel/Babel
// Therefore you can now use ES6 style imports

import * as Phaser from "phaser";

interface ICoords {
  x: number;
  y: number;
}

function uuid(
  a?: any               // placeholder
): string {
  return a              // if the placeholder was passed, return
    ? (                 // a random number from 0 to 15
      a ^               // unless b is 8,
      Math.random()     // in which case
      * 16              // a random number from
      >> a / 4          // 8 to 11
    ).toString(16)      // in hexadecimal
    : (                 // or otherwise a concatenated string:
      1e7.toString() +  // 10000000 +
      -1e3 +            // -1000 +
      -4e3 +            // -4000 +
      -8e3 +            // -80000000 +
      -1e11             // -100000000000,
    ).replace(          // replacing
      /[018]/g,         // zeroes, ones, and eights with
      uuid              // random hex digits
    )
}

class GameScene extends Phaser.Scene {
  private HOST = window.location.hostname; // localhost and 127.0.0.1 handled
  private PORT = 8080; // change this if needed

  private wsClient?: WebSocket;
  private sprite?: Phaser.GameObjects.Sprite;

  private id = uuid();
  private players: {[key: string]: Phaser.GameObjects.Sprite} = {};

  constructor() { super({ key: "GameScene" }); }

  /**
   * Load the assets required by the scene
   */
  public preload() {
    this.load.image("bunny", "static/bunny.png");
  }

  /**
   * Instantiate the private variables required by the scene
   */
  public init() {
    // Initialize the websocket client
    this.wsClient = new WebSocket(`ws://${this.HOST}:${this.PORT}`);
    this.wsClient.onopen = (event) => {
      // After the websocket is open, set interactivtiy
      console.log(event);

      // Start of the drag event (mouse click down)
      this.input.on("dragstart", (
        _: Phaser.Input.Pointer,
        gObject: Phaser.GameObjects.Sprite
      ) => {
        gObject.setTint(0xff0000);
      });

      // During the drag event (mouse movement)
      this.input.on("drag", (
        _: Phaser.Input.Pointer,
        gObject: Phaser.GameObjects.Sprite,
        dragX: number,
        dragY: number
      ) => {
        gObject.x = dragX;
        gObject.y = dragY;
        this.wsClient!.send(JSON.stringify({ x: gObject.x, y: gObject.y }));
      });

      // End of the drag event (mouse click up)
      this.input.on("dragend", (
        _: Phaser.Input.Pointer,
        gObject: Phaser.GameObjects.Sprite
      ) => {
        gObject.clearTint();
        this.wsClient!.send(JSON.stringify({ x: gObject.x, y: gObject.y }));
      });
    }

    this.wsClient.onmessage = (wsMsgEvent) => {
      console.log(wsMsgEvent);
      wsMsgEvent.data;
      const actorCoordinates: ICoords = JSON.parse(wsMsgEvent.data);
      // Sprite may not have been initialized yet
      if (this.sprite) {
        this.sprite.x = actorCoordinates.x;
        this.sprite.y = actorCoordinates.y;
      }
    }
  }

  /**
   * Create the game objects required by the scene
   */
  public create() {
    // ...
    this.players[this.id] = this.physics.add.sprite(48, 48, "player", 1);
    this.physics.add.collider(this.players[this.id], layer);
    this.cameras.main.startFollow(this.players[this.id]);
  }
  
  
  // update
  public update() {
    if (this.players[this.id]) {
      const player = this.players[this.id];
      let moving = false;
  
      if (this.leftKey && this.leftKey.isDown) {
        (player.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.VELOCITY);
        player.play("left", true);
        moving = true;
      }
      // ...
      player.update();
    }
}


// Phaser configuration variables
const config: GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  scene: [GameScene]
};

class LabDemoGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.addEventListener("load", () => {
  new LabDemoGame(config);
})