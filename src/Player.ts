import Bubble from "./Bubble.js";
import Entity from "./Entity.js";
import { Controls, isControlPressed } from "./Input.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Player extends Entity {
  static spritesheet: Spritesheet;
  bubbleOffsets = [
    new Vector2(1, 7),
    new Vector2(4, 7),
    new Vector2(8, 7),
    new Vector2(10, 7),
    new Vector2(12, 7),
    new Vector2(15, 7),
    new Vector2(18, 7),
  ]

  animationTimer = 0;

  velocity = new Vector2();
  VELOCITY = 0.00010;
  thrustDirection = 1;
  thrustTarget = 1;
  thrustDirectionChangeSpeed = 0.003;
  thrusting = false;

  static async load() {
    Player.spritesheet = await Spritesheet.load('assets/images/bathysphere.png', 20, 32);
  }

  tick(dt: number) {
    this.animationTimer += dt;

    this.processInput();
    this.changeThrustDirection(dt);

    this.move(dt);
  }

  processInput() {
      this.thrusting = isControlPressed(Controls.THRUST);

      if (isControlPressed(Controls.LEFT)) this.thrustTarget = -1;
      if (isControlPressed(Controls.RIGHT)) this.thrustTarget = 1;
    
  }

  changeThrustDirection(dt: number) {
    if (this.thrustDirection === this.thrustTarget) return;

    const dir = Math.sign(this.thrustTarget);
    this.thrustDirection += (dir * dt * this.thrustDirectionChangeSpeed);

    if (Math.abs(this.thrustDirection) > Math.abs(this.thrustTarget)) this.thrustDirection = this.thrustTarget;
  }

  move(dt: number) {
    if (this.thrusting) {
      this.velocity.x += (this.thrustDirection * dt * this.VELOCITY);
      if (Math.random() > 0.9) new Bubble(this.game, Vector2.sumOf(this.position, this.bubbleOffsets[this.getSprite()]));
    }

    this.position.x += this.velocity.x;
  }

  draw(ctx: CanvasRenderingContext2D) {
    Player.spritesheet.draw(ctx, this.x, this.y, this.getSprite(), 0);
  }

  getSprite() {
    if (this.thrustDirection >  0.8) return 0;
    if (this.thrustDirection >  0.5) return 1;
    if (this.thrustDirection >  0.2) return 2;
    if (this.thrustDirection > -0.2) return 3;
    if (this.thrustDirection > -0.5) return 4;
    if (this.thrustDirection > -0.8) return 5;
    return 6;
  }
}