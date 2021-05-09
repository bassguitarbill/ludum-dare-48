import Entity from "./Entity.js";
import Game from "./Game.js";
import { loadSpritesheetFrom } from "./load.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Bubble extends Entity {
  bubbleSize: number;

  riseSpeed = 0.003;
  jitter = .3;

  lifetime: number;

  @loadSpritesheetFrom('assets/images/bubble.png', 4, 4)
  static spritesheet: Spritesheet;

  constructor(game: Game, position: Vector2) {
    super(game, position);
    this.bubbleSize = Math.floor(Math.random() * Bubble.spritesheet.columns);
    this.lifetime = 1500 + (Math.random() * 1500);
  }

  tick(dt: number) {
    this.lifetime -= dt;
    if (this.lifetime < 0) return this.destroy();

    this.position.y -= (this.riseSpeed * dt);
    this.position.x += ((Math.random() - 0.5) * this.jitter);
  }

  draw(ctx: CanvasRenderingContext2D) {
    Bubble.spritesheet.draw(ctx, this.x, this.y, this.bubbleSize, 0);
  }
}