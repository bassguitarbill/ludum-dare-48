import Game from "./Game.js";
import { Vector2 } from "./math.js";

export default class Entity {
  position = new Vector2();
  constructor(readonly game: Game) {}

  tick(_: number){};
  draw(_: CanvasRenderingContext2D){};
  
  get x() {
    return this.position.x;
  }
  set x(x) {
    this.position.x = x;
  }
  get y() {
    return this.position.y;
  }
  set y(y) {
    this.position.y = y;
  }
}