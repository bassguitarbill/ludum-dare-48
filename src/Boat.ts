import AABBHitbox from "./AABBHitbox.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { loadImageFrom } from "./load.js";
import { Vector2 } from "./math.js";

export default class Boat extends Entity {
  @loadImageFrom('assets/images/boat.png')
  static image: HTMLImageElement;

  readonly hitbox: AABBHitbox;
  readonly itemDeliveryHitbox: AABBHitbox;
  playerIsColliding = false;

  constructor(readonly game: Game, readonly position: Vector2) {
    super(game, position);
    this.hitbox = new AABBHitbox(Vector2.sumOf(position, new Vector2(5, 24)), Vector2.sumOf(position, new Vector2(42, 30)))
    this.itemDeliveryHitbox = new AABBHitbox(Vector2.sumOf(position, new Vector2(-15, 0)), Vector2.sumOf(position, new Vector2(80, 50)))
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(Boat.image, this.x, this.y);
    this.itemDeliveryHitbox.draw(ctx);
    this.hitbox.draw(ctx);
  }

  tick(_: number) {
    if (this.game.player.getHitbox()?.collides(this.hitbox)) {
      if (!this.playerIsColliding) {
        this.playerIsColliding = true;
        this.game.messageManager.sendMessage('Augh, my boat!', 15);
      }
    } else {
      this.playerIsColliding = false;
    }
    if (this.game.player.getCurrentSubHitbox().collides(this.itemDeliveryHitbox)) {
      this.game.player.healthPercentage = 1.0;
      if (this.game.player.currentlyGrapsedItem) {
        this.game.questManager.retrieve(this.game.player.currentlyGrapsedItem);
      }
    }
   
  }

}