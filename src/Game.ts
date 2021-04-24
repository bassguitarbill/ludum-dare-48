import Player from "./Player.js";
import World from "./World.js";

export default class Game {
  timestamp: number = 0;
  ctx: CanvasRenderingContext2D;
  camera = {
    scale: 4,
    x: 0,
    y: 0,
  };
  readonly player: Player;

  constructor(readonly world: World) {
    const canvas = document.querySelector('canvas')!;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.tick = this.tick.bind(this);

    this.player = new Player(this, world.getPlayerSpawnLocation())
  }

  static async load(): Promise<Game> {
    const world = await World.loadInstance('maps/test-map.json');
    await Player.load();
    return new Game(world);
  }

  run() {
    this.timestamp = 0;
    requestAnimationFrame(this.tick);
  }

  tick(timestamp: number) {
    const dt = timestamp - this.timestamp;
    this.timestamp = timestamp;
    this.world.tick(dt);
    this.player.tick(dt);
    
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.setTransform(this.camera.scale, 0, 0, this.camera.scale, this.camera.x, this.camera.y);
    this.world.draw(this.ctx);
    this.player.draw(this.ctx);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    requestAnimationFrame(this.tick);
  }
}