import Bubble from "./Bubble.js";
import Entity from "./Entity.js";
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
  readonly entities: Array<Entity> = [];

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
    await Bubble.load();
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
    this.entities.forEach(e => e.tick(dt));
    this.player.tick(dt);
    
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.setTransform(this.camera.scale, 0, 0, this.camera.scale, this.camera.x, this.camera.y);
    this.world.draw(this.ctx);
    this.entities.forEach(e => e.draw(this.ctx));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    requestAnimationFrame(this.tick);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity) {
    const index = this.entities.findIndex(e => e === entity)
    if (index > -1) this.entities.splice(index, 1);
  }
}