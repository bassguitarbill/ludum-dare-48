import Game from "./Game.js";
import { Vector2 } from "./math.js";

export default class Camera {

  readonly position: Vector2 = new Vector2();
  readonly scale: number = 3;

  cameraOffsetX: number = 0;
  cameraOffsetY: number = 0;
  constructor(readonly game: Game) {}

  moveCamera(ctx: CanvasRenderingContext2D) {
    const player = this.game.player;
    const lowerBoundX = 0;
    const upperBoundX = -((this.game.world.mapData.width * this.game.world.mapData.tilewidth) - (ctx.canvas.width / this.scale));

    const lowerBoundY = 0;
    const upperBoundY = -((this.game.world.mapData.height * this.game.world.mapData.tileheight) - (ctx.canvas.height / this.scale));
    
    this.position.x = Math.max(Math.min(((ctx.canvas.width/2)/this.scale)-player.x, lowerBoundX), upperBoundX);
    this.position.y = Math.max(Math.min(((ctx.canvas.height/2)/this.scale)-player.y, lowerBoundY), upperBoundY);

    this.cameraOffsetX = this.position.x - (((ctx.canvas.width/2)/this.scale)-player.x);
    this.cameraOffsetY = this.position.y - (((ctx.canvas.height/2)/this.scale)-player.y);
  }

  scaleCanvas(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.position.x * this.scale, this.position.y * this.scale);
  }

}