import Entity from "./Entity.js";
import Spritesheet from "./Spritesheet.js";

export default class Player extends Entity {
  animationTimer = 0;
  constructor(readonly spritesheet: Spritesheet) {
    super();
  }

  static async load() {
    const spritesheet = await Spritesheet.load('assets/images/bathysphere.png', 16, 32);
    return new Player(spritesheet);
  }

  tick(dt: number) {
    this.animationTimer += dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.spritesheet.draw(ctx, this.x, this.y, 0, 0);
  }
}