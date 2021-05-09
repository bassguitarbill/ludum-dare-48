import AABBHitbox from "./AABBHitbox.js";
import Bubble from "./Bubble.js";
import Entity from "./Entity.js";
import Game from "./Game.js";
import { Controls, isControlPressed } from "./Input.js";
import { loadSpritesheetFrom } from "./load.js";
import { Vector2 } from "./math.js";
import PickableObject from "./PickableObject.js";
import SFX from "./SFX.js";
import Spritesheet from "./Spritesheet.js";

export default class Player extends Entity {

  @loadSpritesheetFrom('assets/images/bathysphere.png', 20, 32)
  static spritesheet: Spritesheet;
  @loadSpritesheetFrom('assets/images/claw.png', 7, 12)
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
    [1, 3, 15, 12],
    [3, 3, 15, 12],
    [5, 3, 15, 12],
    [5, 3, 15, 12],
    [5, 3, 15, 12],
    [5, 3, 15, 12],
    [5, 3, 15, 12],
  ];
  subHitboxes: Array<AABBHitbox>;
  clawHitbox: AABBHitbox;

  animationTimer = 0;

  velocity = new Vector2();
  acceleration = 0.00018;

  thrustDirection = 1;
  thrustTarget = 1;
  thrustDirectionChangeSpeed = 0.003;
  thrusting = false;

  vertical = 0;

  clawPosition = 0;
  clawTarget = 0;
  clawPositionChangeSpeed = 0.01;

  clawOpen = true;
  holdingClawReleaseKey = false;

  currentlyGrapsedItem: PickableObject | null = null;

  healthPercentage = 1.0;
  pressurePercentage = 0.0;
  dangerousPressure = 0.40;
  pressureDamageFactor = 0.003;

  hasClaw = true;
  hasArmor = false;
  hasFlashlight = true;

  depth = 10;
  maxDepth = 100;

  constructor(readonly game: Game, readonly position: Vector2) {
    super(game, position);
    this.subHitboxes = this.generateSubHitboxes();
    this.clawHitbox = new AABBHitbox(new Vector2(0, 0), new Vector2(4, 4))
  }

  tick(dt: number) {
    if (this.game.isGameOver) return;
    if (this.healthPercentage < 0) {
      SFX.play('explosion.wav');
      this.game.gameOver();
      return;
    }
    this.animationTimer += dt;

    this.setPressurePercentage();
    this.dealPressureDamage();

    this.processInput();
    this.changeThrustDirection(dt);
    this.changeClawPosition(dt);

    const currentHitbox = this.getCurrentSubHitbox();
    currentHitbox.offset = this.position;
    this.setClawHitboxOffset();

    this.checkClawTerrainCollision();

    this.checkCollision();
    this.move(dt);
    currentHitbox.offset = this.position;

    this.moveCurrentlyGraspedItem();
  }

  setPressurePercentage() {
    const maxDepth = this.game.world.mapData.height * this.game.world.mapData.tileheight;
    const minDepth = this.game.world.waterLevel;
    const depth = this.position.y;
    const depthRange = maxDepth - minDepth;
    this.pressurePercentage = (depth - minDepth) / depthRange;
  }

  dealPressureDamage() {
    if (this.hasArmor) return;
    const howUnsafe = this.pressurePercentage - this.dangerousPressure;
    if (howUnsafe < 0) return;
    this.healthPercentage -= howUnsafe * this.pressureDamageFactor;
  }

  setClawHitboxOffset() {
    this.clawHitbox.offset = Vector2.sumOf(this.position, new Vector2(7.5, 10 + this.clawPosition))
  }

  processInput() {
      this.thrusting = isControlPressed(Controls.THRUST);

      if (isControlPressed(Controls.LEFT)) this.thrustTarget = -1;
      if (isControlPressed(Controls.RIGHT)) this.thrustTarget = 1;

      if (isControlPressed(Controls.UP)) this.vertical = -1;
      else if (isControlPressed(Controls.DOWN)) this.vertical = 1;
      else this.vertical = 0;

      if (isControlPressed(Controls.CLAW_EXTEND)) {
        if (this.clawPosition === this.clawTarget) this.clawTarget = 12 - this.clawTarget;
      }

      if (isControlPressed(Controls.CLAW_RELEASE)) {
        if (!this.holdingClawReleaseKey) {
          if(this.clawOpen) this.closeClaw();
          else this.openClaw();
        }
        this.holdingClawReleaseKey = true;
      } else {
        this.holdingClawReleaseKey = false;
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

    if (this.position.y < this.game.world.waterLevel - 10) {
      this.velocity.y += .07;
    }

    this.velocity = this.velocity.times(0.993);
  }

  moveCurrentlyGraspedItem() {
    const cgi = this.currentlyGrapsedItem;
    if (!cgi) return;
    const newPosition = Vector2.sumOf(new Vector2(), this.clawHitbox.offset);
    cgi.position.x = newPosition.x;
    cgi.position.y = newPosition.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawClaw(ctx);
    Player.spritesheet.draw(ctx, this.x, this.y, this.getTurnIndex(), 0);
    if ((window as any).debug) {
      this.subHitboxes[this.getTurnIndex()].draw(ctx);
    }
  }

  drawClaw(ctx: CanvasRenderingContext2D) {
    Player.clawSpritesheet.draw(ctx, this.x + 6, this.y + 2 + this.clawPosition, this.clawOpen ? 0 : 1, 0);
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

  checkClawTerrainCollision() {
    if (this.clawPosition === 0) return;
    const collides = this.game.world.collides(this.clawHitbox);
    if (collides) {
      this.openClaw();
      this.clawTarget = 0;
    } 
  }

  checkCollision() {
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
    const cos = Math.cos(this.velocity.angle() - normal.angle());
    if (cos < -0.01) {// Stop driving into the rocks
      this.healthPercentage += cos * 0.03;
      SFX.play('crash.wav');
      this.velocity = normal.times(0.15);
    }
  }

  openClaw() {
    this.currentlyGrapsedItem?.onRelease();
    this.currentlyGrapsedItem = null;
    this.clawOpen = true;
  }

  closeClaw() {
    this.clawOpen = false;
    for (let i=0; i<this.game.entities.length; i++) {
      const entity = this.game.entities[i];
      if (entity instanceof Player) continue;
      if (!(entity instanceof PickableObject)) continue;
      const entityHitbox = entity.getHitbox();
      if (!entityHitbox) continue;
      if (entityHitbox.collides(this.clawHitbox)) {
        this.currentlyGrapsedItem = (entity as PickableObject);
        this.currentlyGrapsedItem.onPickup();
        this.game.questManager.obtain(this.currentlyGrapsedItem);
        break;
      }
    }
  }

  getHitbox() {
    return this.getCurrentSubHitbox();
  }
}