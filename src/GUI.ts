import Game from "./Game.js";
import Gobo from "./Gobo.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";
import Text from './Text.js';

export default class GUI {
  static pressureGaugeSpritesheet: Spritesheet;
  static upgradesSpritesheet: Spritesheet;
  static controlsImage: HTMLImageElement;

  commsText? : Text;

  gobo: Gobo;
  constructor(readonly game: Game){
    this.gobo = new Gobo(game);
  }

  static async load() {
    GUI.pressureGaugeSpritesheet = await Spritesheet.load('assets/images/pressure-gauge.png', 128, 128);
    GUI.upgradesSpritesheet = await Spritesheet.load('assets/images/upgrades.png', 128, 128);
    await new Promise(res => { GUI.controlsImage = new Image(); GUI.controlsImage.src = 'assets/images/controls.png'; GUI.controlsImage.addEventListener('load', res)});
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.gobo.draw(ctx);
    this.drawHealthBar(ctx);
    this.drawPressureGauge(ctx);
    // this.drawUpgrades(ctx);
    this.drawComms(ctx);
    this.drawControls(ctx);
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    const health = this.game.player.healthPercentage;
    const canvasWidth = ctx.canvas.width;
    const leftEdgeOfBar = canvasWidth * 0.03;
    const rightEdgeOfBar = canvasWidth * 0.5;
    const barLength = (rightEdgeOfBar - leftEdgeOfBar) * health;
    ctx.fillStyle = '#37364e';
    ctx.fillRect(leftEdgeOfBar - 5, 25, rightEdgeOfBar - leftEdgeOfBar + 10, 40);
    ctx.fillStyle = '#5b4a68';
    ctx.fillRect(leftEdgeOfBar, 30, rightEdgeOfBar - leftEdgeOfBar, 30);
    ctx.fillStyle = health > .5 ? '#6aae9d' : health > .25 ? '#f4e9d4' : '#ba4e7c';
    ctx.fillRect(leftEdgeOfBar, 30, barLength, 30);
  }

  drawPressureGauge(ctx: CanvasRenderingContext2D) {
    const pressure = this.game.player.pressurePercentage;
    const hasArmor = this.game.player.hasArmor;
    const pressureStage = this.getPressureStage(pressure);
    GUI.pressureGaugeSpritesheet.draw(ctx, ctx.canvas.width * 0.8, 10, pressureStage, hasArmor ? 1 : 0)
  }

  getPressureStage(pressure: number) {
    return  pressure < 0.06 ? 0 :
            pressure < 0.12 ? 1 :
            pressure < 0.18 ? 2 :
            pressure < 0.24 ? 3 :
            pressure < 0.32 ? 4 :
            pressure < 0.40 ? 5 :
            pressure < 0.50 ? 6 : 7;
  }

  drawUpgrades(ctx: CanvasRenderingContext2D) {
    const hasClaw = this.game.player.hasClaw;
    const hasArmor = this.game.player.hasArmor;
    const hasFlashlight = this.game.player.hasFlashlight;
    GUI.upgradesSpritesheet.draw(ctx, ctx.canvas.width * 0.63, ctx.canvas.height - 200, 0, hasClaw ? 1 : 0)
    GUI.upgradesSpritesheet.draw(ctx, ctx.canvas.width * 0.74, ctx.canvas.height - 200, 1, hasArmor ? 1 : 0)
    GUI.upgradesSpritesheet.draw(ctx, ctx.canvas.width * 0.85, ctx.canvas.height - 200, 2, hasFlashlight ? 1 : 0)
  }

  drawComms(ctx: CanvasRenderingContext2D) {
    const message = this.game.messageManager.currentMessage?.text;
    if (!message) return;

    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = .9;
    ctx.fillStyle = '#f4e9d4';
    ctx.fillRect((ctx.canvas.width * 0.02) - 10, ctx.canvas.height - 110, 500, 90);
    this.commsText ||= new Text(new Vector2(ctx.canvas.width * 0.02, ctx.canvas.height - 100), 30, message);
    this.commsText.message = message;
    this.commsText.draw(ctx);
    ctx.globalAlpha = alpha;
  }

  drawControls(ctx: CanvasRenderingContext2D) {
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = .8;
    ctx.drawImage(GUI.controlsImage, ctx.canvas.width - 256, ctx.canvas.height - 64);
    ctx.globalAlpha = alpha;
  }
}