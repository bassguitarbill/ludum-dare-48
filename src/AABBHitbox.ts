import { Vector2 } from "./math.js";

export default class AABBHitbox {
  offset = new Vector2();
  constructor(readonly _topLeft: Vector2, readonly _bottomRight: Vector2){};
  get topLeft(): Vector2 { return Vector2.sumOf(this._topLeft, this.offset)}
  get bottomRight(): Vector2 { return Vector2.sumOf(this._bottomRight, this.offset)}
  draw(ctx: CanvasRenderingContext2D) {
    const alpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.topLeft.x, this.topLeft.y, this.bottomRight.x - this.topLeft.x, this.bottomRight.y - this.topLeft.y)
    ctx.globalAlpha = alpha;
  }
}