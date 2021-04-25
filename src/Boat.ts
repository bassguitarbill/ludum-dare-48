import Entity from "./Entity.js";

export default class Boat extends Entity {
  static image: HTMLImageElement;
  static async load() {
    Boat.image = new Image();
    await new Promise(res => {
      Boat.image.src = 'assets/images/boat.png';
      Boat.image.addEventListener('load', res);
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(Boat.image, this.x, this.y);
  }
}