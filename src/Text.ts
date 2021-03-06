import { loadSpritesheetFrom } from "./load.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Text {

  @loadSpritesheetFrom('assets/images/alphabet.png', 16, 16)
  static fontSpritesheet: Spritesheet;
  static fontMap: {[key in string]: number} = {
    a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9, j:10,
    k:11, l:12, m:13, n:14, o:15, p:16, q:17, r:18,
    s:19, t:20, u:21, v:22, w:23, x:24, y:25, z:26,
    '!':27, '?': 28, '\'': 29, ',': 30, '.': 31, ' ': 0
  }

  static textImages: {[key in string]: HTMLImageElement} = {};

  constructor(readonly position: Vector2, readonly columns: number, public message: string) {};

  draw(ctx: CanvasRenderingContext2D) {
    let savedImage = Text.textImages[this.message];
    if (!savedImage) {
      
      const canvas = document.createElement('canvas');
      canvas.width = this.columns * 16;
      canvas.height = (Math.floor(this.message.length / this.columns) + 1) * 18;
      const ctx = canvas.getContext('2d')!;

      for (let i = 0; i < this.message.length; i++) {
        const char = this.message.charAt(i).toLowerCase();
        const charIndex = Text.fontMap[char];
        if(!charIndex) continue;
        const charPositionX = (i % this.columns) * 16;
        const charPositionY = Math.floor(i / this.columns) * 18;
        Text.fontSpritesheet.draw(ctx, charPositionX, charPositionY, charIndex, 0);
      }

      savedImage = new Image();
      savedImage.src = canvas.toDataURL();
      Text.textImages[this.message] = savedImage;
    }
    ctx.drawImage(savedImage, this.position.x, this.position.y);
  }
}