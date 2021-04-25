import AABBHitbox from "./AABBHitbox.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";
import SFX from "./SFX.js";
import Spritesheet from "./Spritesheet.js";

export default class Projectile extends Entity {
  static spritesheet: Spritesheet;
  static async load() {
    this.spritesheet = await Spritesheet.load('assets/images/projectile.png', 16, 16);
  }


  lifespan = 2000;
  hitbox: AABBHitbox;
  constructor(readonly game:Game, readonly position: Vector2, readonly velocity: Vector2) {
    super(game, position);
    this.hitbox = new AABBHitbox(new Vector2(4, 4), new Vector2(12, 12));
  }

  tick(dt: number) {
    this.lifespan -= dt;
    if (this.lifespan < 0) return this.destroy();
    this.position.x += (this.velocity.x * dt);
    this.position.y += (this.velocity.y * dt);
    this.hitbox.offset = this.position;

    if(this.hitbox.collides(this.game.player.getCurrentSubHitbox())) {
      this.destroy();
      this.game.player.healthPercentage -= .2;
      SFX.play('crash.wav');
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    Projectile.spritesheet.draw(ctx, this.x, this.y, 0, 0);
    this.hitbox.draw(ctx)
  }
}