import Entity from "./Entity.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";
import Projectile from "./Projectile.js";
import SFX from "./SFX.js";
import Spritesheet from "./Spritesheet.js";

export default class Enemy extends Entity {
  static spritesheet: Spritesheet;

  static async load() {
    this.spritesheet = await Spritesheet.load('assets/images/enemy.png', 16, 16);
  }

  emergence = 0;
  lookRadiusSquared = 100 * 100;
  aggroRadiusSquared = 60 * 60;

  timer = 0;
  state = 'dormant';

  constructor(readonly game: Game, readonly position: Vector2, readonly direction: number) {
    super(game, position);
    console.log('yes;')
  }

  draw(ctx: CanvasRenderingContext2D) {
    Enemy.spritesheet.draw(ctx, this.x, this.y, this.emergence, this.direction);
  }

  tick(dt: number) {
    const distanceSquared = this.position.distanceSquared(this.game.player.position);
    this.timer -= dt;
    switch (this.state) {
      case 'dormant':
        if (this.timer < 0) {
          if (distanceSquared < this.aggroRadiusSquared) {
            this.emergence = 2;
            this.state = 'aggro';
            this.timer = 1000;
          } else if (distanceSquared < this.lookRadiusSquared) {
            this.emergence = 1;
          } else {
            this.emergence = 0;
          }
        }
        break;
      case 'aggro':
        if (distanceSquared > this.aggroRadiusSquared) {
          this.emergence = 1;
          this.state = 'dormant';
        } else {
          if (this.timer < 0) {
            this.emergence = 3;
            this.state = 'firing';
            this.timer = 400;
          }
        }
        break;
      case 'firing':
        if (this.timer < 0) {
          this.fireProjectile();
          this.state = 'retreating';
          this.timer = 200;
        }
        break;
      case 'retreating':
        if (this.timer < 0) {
          if (this.emergence <= 0) {
            this.state = 'dormant';
            this.timer = 3000;
          } else {
            this.emergence --;
          }
        }
        break;
      
    }
  }

  fireProjectile() {
    const directionVector = new Vector2(this.game.player.x - this.x, this.game.player.y - this.y).times(0.001);
    //const direction = directionVector.angle();
    new Projectile(this.game, Vector2.sumOf(this.position, new Vector2(4, 4)), directionVector);
    SFX.play('wormyell.wav');
  }
}