import Game from "./Game.js";

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
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = ((depth - minDepth) / (maxDepth - minDepth)) * 0.8;
    ctx.drawImage(Gobo.image, 0 ,0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = alpha;
  }
}