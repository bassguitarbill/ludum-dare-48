import { assetsLoaded } from "./load.js";
import TitleScreen from "./TitleScreen.js";

let canvas: HTMLCanvasElement;

window.addEventListener('load', async () => {
  assetsLoaded.then(async () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    sizeCanvas();

    await TitleScreen.load();
    new TitleScreen().run();
  })
  
});

function sizeCanvas() {
  canvas!.width = window.innerWidth;
  canvas!.height = window.innerHeight;
  canvas!.getContext('2d')!.imageSmoothingEnabled = false;
}

window.addEventListener('resize', sizeCanvas)