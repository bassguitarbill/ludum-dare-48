import AABBHitbox from "./AABBHitbox.js";
import Bubble from "./Bubble.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { Controls, isControlPressed } from "./Input.js";
import { Vector2 } from "./math.js";
import Spritesheet from "./Spritesheet.js";

export default class Player extends Entity {
  static spritesheet: Spritesheet;
  static clawSpritesheet: Spritesheet;
  bubbleOffsets = [
    new Vector2(1, 7),
    new Vector2(4, 7),
    new Vector2(8, 7),
    new Vector2(10, 7),
    new Vector2(12, 7),
    new Vector2(15, 7),
    new Vector2(18, 7),
  ];
  subHitboxBounds = [
    [0, 2, 16, 13],
    [2, 2, 16, 13],
    [4, 2, 16, 13],
    [4, 2, 16, 13],
    [4, 2, 16, 13],
    [4, 2, 16, 13],
    [4, 2, 16, 13],
  ];
  subHitboxes: Array<AABBHitbox>;
  clawHitbox: AABBHitbox;

  animationTimer = 0;

  velocity = new Vector2();
  acceleration = 0.00010;

  thrustDirection = 1;
  thrustTarget = 1;
  thrustDirectionChangeSpeed = 0.003;
  thrusting = false;

  vertical = 0;

  clawPosition = 0;
  clawTarget = 0;
  clawPositionChangeSpeed = 0.01;

  collisionNormal = new Vector2();

  constructor(readonly game: Game, readonly position: Vector2) {
    super(game, position);
    this.subHitboxes = this.generateSubHitboxes();
    this.clawHitbox = new AABBHitbox(new Vector2(0, 0), new Vector2(4, 4))
  }

  static async load() {
    Player.spritesheet = await Spritesheet.load('assets/images/bathysphere.png', 20, 32);
    Player.clawSpritesheet = await Spritesheet.load('assets/images/claw.png', 7, 12);
  }

  tick(dt: number) {
    this.animationTimer += dt;

    this.processInput();
    this.changeThrustDirection(dt);
    this.changeClawPosition(dt);

    const currentHitbox = this.getCurrentSubHitbox();
    currentHitbox.offset = this.position;
    this.setClawHitboxOffset();

    this.checkClawCollision();

    this.checkCollision();
    this.move(dt);
    currentHitbox.offset = this.position;
  }

  setClawHitboxOffset() {
    this.clawHitbox.offset = Vector2.sumOf(this.position, new Vector2(7.5, 8 + this.clawPosition))
  }

  processInput() {
      this.thrusting = isControlPressed(Controls.THRUST);

      if (isControlPressed(Controls.LEFT)) this.thrustTarget = -1;
      if (isControlPressed(Controls.RIGHT)) this.thrustTarget = 1;

      if (isControlPressed(Controls.UP)) this.vertical = -0.4;
      else if (isControlPressed(Controls.DOWN)) this.vertical = 0.4;
      else this.vertical = 0;

      if (isControlPressed(Controls.CLAW_EXTEND)) {
        if (this.clawPosition === this.clawTarget) this.clawTarget = 12 - this.clawTarget;
      } 
  }

  changeThrustDirection(dt: number) {
    if (this.thrustDirection === this.thrustTarget) return;

    const dir = Math.sign(this.thrustTarget);
    this.thrustDirection += (dir * dt * this.thrustDirectionChangeSpeed);

    if (Math.abs(this.thrustDirection) > Math.abs(this.thrustTarget)) this.thrustDirection = this.thrustTarget;
  }

  changeClawPosition(dt: number) {
    if (this.clawPosition === this.clawTarget) return;
    const dir = Math.sign(this.clawTarget - this.clawPosition);
    this.clawPosition += (dir * dt * this.clawPositionChangeSpeed);

    if (this.clawPosition < 0) this.clawPosition = 0;
    if (this.clawPosition > 12) this.clawPosition = 12;
  }

  move(dt: number) {
    if (this.thrusting) {
      this.velocity.x += (this.thrustDirection * dt * this.acceleration);
      if (Math.random() > 0.9) new Bubble(this.game, Vector2.sumOf(this.position, this.bubbleOffsets[this.getTurnIndex()]));
    }

    if (this.vertical > 0) if (Math.random() > 0.88) new Bubble(this.game, Vector2.sumOf(this.position, new Vector2((Math.random() * 5) + 3.5, 10)));
    this.velocity.y += (this.vertical * dt * this.acceleration);

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity = this.velocity.times(0.993);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawClaw(ctx);
    Player.spritesheet.draw(ctx, this.x, this.y, this.getTurnIndex(), 0);
    if ((window as any).debug) {
      this.subHitboxes[this.getTurnIndex()].draw(ctx);
      if (!this.collisionNormal.isZeroVector()) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.collisionNormal.times(20).x + this.x, this.collisionNormal.times(20).y + this.y);
        ctx.stroke();
      }
    }
  }

  drawClaw(ctx: CanvasRenderingContext2D) {
    Player.clawSpritesheet.draw(ctx, this.x + 6, this.y + 2 + this.clawPosition, 0, 0);
    if ((window as any).debug) this.clawHitbox.draw(ctx);
  }

  getTurnIndex() {
    if (this.thrustDirection >  0.8) return 0;
    if (this.thrustDirection >  0.5) return 1;
    if (this.thrustDirection >  0.2) return 2;
    if (this.thrustDirection > -0.2) return 3;
    if (this.thrustDirection > -0.5) return 4;
    if (this.thrustDirection > -0.8) return 5;
    return 6;
  }

  generateSubHitboxes(): Array<AABBHitbox> {
    return this.subHitboxBounds.map(b => new AABBHitbox(new Vector2(b[0], b[1]), new Vector2(b[2], b[3])));
  }

  getCurrentSubHitbox(): AABBHitbox {
    return this.subHitboxes[this.getTurnIndex()];
  }

  checkClawCollision() {
    if (this.clawPosition === 0) return;
    const collides = this.game.world.collides(this.clawHitbox);
    if (collides) {
      //open claw
      this.clawTarget = 0;
    } 
  }

  checkCollision() {
    this.collisionNormal = new Vector2();
    const collides = this.game.world.collides(this.getCurrentSubHitbox());
    if (!collides) return;
    const collisionData = this.game.world.colliderData;
    const centerX = (collisionData[0].length / 2) - 0.5;
    const centerY = (collisionData.length / 2) - 0.5;
    const normal = new Vector2();
    for (let x=0; x<collisionData.length; x++) {
      for (let y=0; y<collisionData[x].length; y++) {
        if (collisionData[x][y]) {
          const direction = new Vector2(centerX - x, centerY - y).normalize(); // Add a vector pointing from the center AWAY from the colliding tile
          normal.add(direction.x, direction.y);
        }
      }
    }
    this.collisionNormal = normal;
    const cos = Math.cos(this.velocity.angle() - normal.angle());
    if (cos < -0.01) this.velocity = new Vector2();
  }
}