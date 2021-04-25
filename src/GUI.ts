import Game from "./Game.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";
import Text from './Text.js';

export default class GUI {
  static pressureGaugeSpritesheet: Spritesheet;
  static upgradesSpritesheet: Spritesheet;

  commsText? : Text;
  constructor(readonly game: Game){}

  static async load() {
    GUI.pressureGaugeSpritesheet = await Spritesheet.load('assets/images/pressure-gauge.png', 128, 128);
    GUI.upgradesSpritesheet = await Spritesheet.load('assets/images/upgrades.png', 128, 128);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawHealthBar(ctx);
    this.drawPressureGauge(ctx);
    this.drawUpgrades(ctx);
    this.drawComms(ctx);
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    const health = this.game.player.healthPercentage;
    const canvasWidth = ctx.canvas.width;
    const leftEdgeOfBar = canvasWidth * 0.03;
    const rightEdgeOfBar = canvasWidth * 0.5;
    const barLength = (rightEdgeOfBar - leftEdgeOfBar) * health;
    ctx.fillStyle = 'grey';
    ctx.fillRect(leftEdgeOfBar - 5, 5, rightEdgeOfBar - leftEdgeOfBar + 10, 20);
    ctx.fillStyle = 'darkgrey';
    ctx.fillRect(leftEdgeOfBar, 10, rightEdgeOfBar - leftEdgeOfBar, 11);
    ctx.fillStyle = health > .5 ? 'lightgreen' : health > .2 ? 'yellow' : 'red';
    ctx.fillRect(leftEdgeOfBar, 10, barLength, 10);
  }

  drawPressureGauge(ctx: CanvasRenderingContext2D) {
    const pressure = this.game.player.pressurePercentage;
    const hasArmor = this.game.player.hasArmor;
    GUI.pressureGaugeSpritesheet.draw(ctx, ctx.canvas.width * 0.8, 10, Math.floor(pressure * 8), hasArmor ? 1 : 0)
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
    const message = this.game.textToDisplay;
    if (!message) return;

    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = .9;
    ctx.fillStyle = '#f4e9d4';
    ctx.fillRect((ctx.canvas.width * 0.1) - 10, ctx.canvas.height - 110, 500, 90);
    this.commsText ||= new Text(new Vector2(ctx.canvas.width * 0.1, ctx.canvas.height - 100), 30, message);
    this.commsText.message = message;
    this.commsText.draw(ctx);
    ctx.globalAlpha = alpha;
  }
}