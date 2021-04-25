import Game from "./Game.js";
import { Vector2 } from "./math.js";

export default class Gobo {
  static image: HTMLImageElement;
  static async load() {
    Gobo.image = new Image();
    await new Promise(res => {
      Gobo.image.src = 'assets/images/gobo.png';
      Gobo.image.addEventListener('load', res);
    })
  }

  constructor(readonly game: Game){}

  draw(ctx: CanvasRenderingContext2D) {
    const minDepth = this.game.world.darknessLevel;
    const maxDepth = this.game.world.maxDarknessLevel;
    const depth = this.game.player.y;
    if(depth < minDepth) return;

    new Vector2(1500, 900);
    const alpha = ctx.globalAlpha;
    if (this.game.player.x > 1500 && this.game.player.y > 900) {
      ctx.globalAlpha = 0.5;
      this.game.enableRToRespawn = true;
    } else {
      let alphaFactor = 0.8
      if (this.game.player.currentlyGrapsedItem?.itemType === 0) {
        alphaFactor = 0.5
      }
      ctx.globalAlpha = ((depth - minDepth) / (maxDepth - minDepth)) * alphaFactor;
      if (ctx.globalAlpha > alphaFactor) ctx.globalAlpha = alphaFactor;
    }

   
    ctx.drawImage(Gobo.image, 0 ,0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = alpha;
  }
}