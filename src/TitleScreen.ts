import Game from "./Game.js";

export default class TitleScreen {
  static titleImage: HTMLImageElement;
  static clickAnywhereImage: HTMLImageElement;
  static createdByImage: HTMLImageElement;
  static async load() {
    await new Promise(res => { TitleScreen.titleImage = new Image(); TitleScreen.titleImage.src = 'assets/images/title.png'; TitleScreen.titleImage.addEventListener('load', res) });
    await new Promise(res => { TitleScreen.createdByImage = new Image(); TitleScreen.createdByImage.src = 'assets/images/created-by.png'; TitleScreen.createdByImage.addEventListener('load', res) });
    await new Promise(res => { TitleScreen.clickAnywhereImage = new Image(); TitleScreen.clickAnywhereImage.src = 'assets/images/click-anywhere.png'; TitleScreen.clickAnywhereImage.addEventListener('load', res) });
  }

  readonly ctx: CanvasRenderingContext2D;
  gameLoaded = false;
  gameStarted = false;

  game?: Game;

  titleProgress = 0;
  clickAnywhereProgress = 0;

  constructor() {
    this.ctx = (document.querySelector('canvas') as HTMLCanvasElement).getContext('2d')!;
    this.tick = this.tick.bind(this);

    new Promise(async () => {
      this.game = await Game.load();
      (window as any).game = this.game;
      this.gameLoaded = true;
      const onClick = () => {
        this.gameStarted = true;
        this.game!.run();
        console.log('Starting game now')
        this.ctx.canvas.removeEventListener('click', onClick);
      };
      this.ctx.canvas.addEventListener('click', onClick);
    })
  }

  tick(timestamp: number) {

    this.titleProgress = Math.max(Math.min((timestamp / 800) - 1, 1), 0)

    const waterHeight = this.ctx.canvas.height * 0.76;
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, waterHeight)
    this.ctx.fillStyle = 'darkblue';
    this.ctx.fillRect(0, waterHeight, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.drawImage(TitleScreen.createdByImage, 5, 5);

    const { titleImage, clickAnywhereImage } = TitleScreen;
    const titleStartPos = (this.ctx.canvas.height * 0.5) - titleImage.height/2;
    const titleEndPos = (this.ctx.canvas.height * 0.4) - titleImage.height/2;
    const titleDistance = titleEndPos - titleStartPos;
    const titleHeight = titleStartPos + (titleDistance * this.titleProgress);

    this.ctx.globalAlpha = this.titleProgress;
    this.ctx.drawImage(titleImage, this.ctx.canvas.width/2 - titleImage.width/2, titleHeight);
    
    this.ctx.globalAlpha = 1.0;
    if (this.gameLoaded && this.titleProgress === 1) this.ctx.drawImage(clickAnywhereImage, this.ctx.canvas.width/2 - clickAnywhereImage.width/2, (this.ctx.canvas.height * 0.9) - clickAnywhereImage.height/2);
    if (!this.gameStarted) window.requestAnimationFrame(this.tick);
  }

  run() {
    this.tick(0);
  }
}