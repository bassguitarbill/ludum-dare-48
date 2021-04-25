import Game from "./Game.js";

let canvas: HTMLCanvasElement;

window.addEventListener('load', async () => {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  sizeCanvas();

  const game = await Game.load();
  (window as any).game = game;
  game.run();
});

function sizeCanvas() {
  canvas!.width = window.innerWidth;
  canvas!.height = window.innerHeight;
  canvas!.getContext('2d')!.imageSmoothingEnabled = false;
}

window.addEventListener('resize', sizeCanvas)