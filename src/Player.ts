import Entity from "./Entity.js";
import Game from "./Game.js";
import { Controls, isControlPressed } from "./Input.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Player extends Entity {
  static spritesheet: Spritesheet;

  animationTimer = 0;

  velocity = new Vector2();
  VELOCITY = 0.00012;
  thrustDirection = 1;
  thrustTarget = 1;
  thrustDirectionChangeSpeed = 0.003;
  thrusting = false;
  constructor(readonly game: Game, readonly position: Vector2) {
    super(game);
  }

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
      this.velocity.x += (this.thrustDirection * dt * this.VELOCITY)
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