import Game from "./Game.js";
import { Vector2 } from "./math.js";

export default class Gobo {
  readonly innerWidth = 60;
  readonly outerWidth = 100;

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

    ctx.fillStyle = this.createRadialGradient(ctx);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.globalAlpha = alpha;
  }

  createRadialGradient(ctx: CanvasRenderingContext2D) {
    const centerX = (ctx.canvas.width / 2) + (8 * this.game.camera.scale) + (this.game.camera.cameraOffsetX * this.game.camera.scale);
    const centerY = (ctx.canvas.height / 2) + (8 * this.game.camera.scale) + (this.game.camera.cameraOffsetY * this.game.camera.scale);
    const gradient = ctx.createRadialGradient(centerX, centerY, this.innerWidth, centerX, centerY, this.outerWidth);
    gradient.addColorStop(1, 'black');
    gradient.addColorStop(0, 'transparent');
    return gradient;
  }
}