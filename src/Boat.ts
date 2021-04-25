import AABBHitbox from "./AABBHitbox.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";

export default class Boat extends Entity {
  static image: HTMLImageElement;
  static async load() {
    Boat.image = new Image();
    await new Promise(res => {
      Boat.image.src = 'assets/images/boat.png';
      Boat.image.addEventListener('load', res);
    })
  }

  readonly hitbox: AABBHitbox;
  playerIsColliding = false;

  constructor(readonly game: Game, readonly position: Vector2) {
    super(game, position);
    this.hitbox = new AABBHitbox(Vector2.sumOf(position, new Vector2(5, 24)), Vector2.sumOf(position, new Vector2(42, 30)))
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(Boat.image, this.x, this.y);
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
  }
}