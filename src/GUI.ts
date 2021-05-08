import Game from "./Game.js";
import Gobo from "./Gobo.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";
import Text from './Text.js';

export default class GUI {
  static pressureGaugeSpritesheet: Spritesheet;
  static upgradesSpritesheet: Spritesheet;
  static controlsImage: HTMLImageElement;
  static gameOverImage: HTMLImageElement;
  static respawnText: Spritesheet;

  commsText? : Text;

  gobo: Gobo;
  constructor(readonly game: Game){
    this.gobo = new Gobo(game);
  }

  static async load() {
    GUI.pressureGaugeSpritesheet = await Spritesheet.load('assets/images/pressure-gauge.png', 128, 128);
    GUI.upgradesSpritesheet = await Spritesheet.load('assets/images/upgrades.png', 128, 128);
    await new Promise(res => { GUI.controlsImage = new Image(); GUI.controlsImage.src = 'assets/images/controls.png'; GUI.controlsImage.addEventListener('load', res)});
    await new Promise(res => { GUI.gameOverImage = new Image(); GUI.gameOverImage.src = 'assets/images/gameover.png'; GUI.gameOverImage.addEventListener('load', res)});
    GUI.respawnText = await Spritesheet.load('assets/images/respawn-text.png', 252, 44);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.gobo.draw(ctx);
    this.drawHealthBar(ctx);
    this.drawPressureGauge(ctx);
    // this.drawUpgrades(ctx);
    this.drawComms(ctx);
    this.drawControls(ctx);
    this.drawGameOver(ctx);
    this.drawFrameRate(ctx);
    this.drawMinimap(ctx);
    this.drawSpeedrunTimer(ctx);
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
    ctx.fillStyle = this.game.messageManager.messageFlash ? '#9e8e91' : '#f4e9d4';
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
  
  drawGameOver(ctx: CanvasRenderingContext2D) {
    if (!this.game.isGameOver) return;
    const { gameOverImage, respawnText } = GUI;
    ctx.drawImage(gameOverImage, (ctx.canvas.width / 2) - (gameOverImage.width / 2) , (ctx.canvas.height / 2) - (gameOverImage.height / 2));
    respawnText.draw(ctx, (ctx.canvas.width / 2) - (respawnText.width / 2) , (ctx.canvas.height / 2) + (gameOverImage.height / 2) + 50, 0, Math.floor(this.game.timestamp / 700) % 2);
  }

  drawFrameRate(ctx: CanvasRenderingContext2D) {
    if (!(window as any).debug) return;
    ctx.fillStyle = 'black';
    ctx.fillText(String(this.game.framerate), 20, 20)
  }

  drawMinimap(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = .8;

    ctx.translate(25, ctx.canvas.height * 0.1);
    ctx.scale(3, 3);

    const { minimap } = this.game;
    const { width, height } = minimap.mapImage;
    ctx.drawImage(minimap.mapImage, 0,0, width, height);

    if(minimap.flash) {
      minimap.getPoints().forEach(p => {
        const { x, y } = p;
        ctx.fillStyle = p.color;
        ctx.fillRect((x / 16), (y / 16), 2, 2);
      });
    }

    ctx.restore();
  }
  
  drawSpeedrunTimer(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.fillText(new Date(this.game.speedrunTimer).toISOString().slice(14, -2), 3 * ctx.canvas.width / 5, 40);
  }
}