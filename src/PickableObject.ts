import AABBHitbox from "./AABBHitbox.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { loadSpritesheetFrom } from "./load.js";
import { Vector2 } from "./math.js";
import SFX from "./SFX.js";
import Spritesheet from "./Spritesheet.js";

export default class PickableObject extends Entity {
  @loadSpritesheetFrom('assets/images/pearl.png', 8, 8)
  static spritesheet: Spritesheet;
  hitbox: AABBHitbox;

  velocity = new Vector2();

  constructor(readonly game: Game, readonly position: Vector2, readonly itemType: number) {
    super(game, position);
    this.hitbox = new AABBHitbox(new Vector2(1,1), new Vector2(7,7));
  }

  draw(ctx: CanvasRenderingContext2D) {
    PickableObject.spritesheet.draw(ctx, this.x, this.y, this.itemType, 0)
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
  getHitbox() {
    return this.hitbox;
  }
  onPickup() {
    if (this.itemType === 2) {
      this.destroy();
      this.game.questManager.destroy(this);
      SFX.play('destroy.wav');
    }
  }
  onRelease() {
    if (!this.game.world.collides(this.hitbox)) return;
    const originalOffset = this.hitbox.offset;

    let newOffset = Vector2.sumOf(originalOffset, new Vector2(-8, 0));
    this.hitbox.offset = newOffset;
    if (!this.game.world.collides(this.hitbox)){
      this.position.x -= 8;
      this.hitbox.offset = originalOffset;
      return;
    }

    newOffset = Vector2.sumOf(originalOffset, new Vector2(8, 0));
    this.hitbox.offset = newOffset;
    if (!this.game.world.collides(this.hitbox)){
      this.position.x += 8;
      this.hitbox.offset = originalOffset;
      return;
    }

    newOffset = Vector2.sumOf(originalOffset, new Vector2(0, -8));
    this.hitbox.offset = newOffset;
    if (!this.game.world.collides(this.hitbox)){
      this.position.y -= 8;
      this.hitbox.offset = originalOffset;
      return;
    }

    newOffset = Vector2.sumOf(originalOffset, new Vector2(0, 8));
    this.hitbox.offset = newOffset;
    if (!this.game.world.collides(this.hitbox)){
      this.position.y += 8;
      this.hitbox.offset = originalOffset;
      return;
    }
  }
}