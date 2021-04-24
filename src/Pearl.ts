import AABBHitbox from "./AABBHitbox.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Pearl extends Entity {
  static spritesheet: Spritesheet;
  hitbox: AABBHitbox;

  velocity = new Vector2();

  constructor(readonly game: Game, readonly position: Vector2) {
    super(game, position);
    this.hitbox = new AABBHitbox(new Vector2(1,1), new Vector2(7,7));
  }

  static async load() {
    Pearl.spritesheet = await Spritesheet.load('assets/images/pearl.png', 8, 8);
  }

  draw(ctx: CanvasRenderingContext2D) {
    Pearl.spritesheet.draw(ctx, this.x, this.y, 0, 0)
    if ((window as any).debug) this.hitbox.draw(ctx);
  }
  tick(dt: number) {
    this.hitbox.offset = this.position;
    this.velocity.y = 0.01;
    this.collide();
    this.position.y += (this.velocity.y * dt);
  }
  collide() {
    if (this.game.world.collides(this.hitbox)) this.velocity.y = 0;
  }
}