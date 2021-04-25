import BGM from "./BGM.js";
import Bubble from "./Bubble.js";
import Entity from "./Entity.js";
import GUI from "./GUI.js";
import Pearl from "./Pearl.js";
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
  readonly gui: GUI;

  constructor(readonly world: World) {
    const canvas = document.querySelector('canvas')!;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.tick = this.tick.bind(this);

    this.player = new Player(this, world.getPlayerSpawnLocation())
    this.world.spawnObjects(this);

    this.gui = new GUI(this);
  }

  static async load(): Promise<Game> {
    const world = await World.loadInstance('maps/test-map.json');
    await Player.load();
    await Bubble.load();
    await Pearl.load();
    await GUI.load();
    await BGM.load('assets/audio/bgm.ogg');
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

    this.scaleCamera();
    
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.setTransform(this.camera.scale, 0, 0, this.camera.scale, this.camera.x * this.camera.scale, this.camera.y * this.camera.scale);
    this.world.draw(this.ctx);
    this.entities.forEach(e => e.draw(this.ctx));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.gui.draw(this.ctx);
    requestAnimationFrame(this.tick);
  }

  scaleCamera() {
    this.camera.x = ((this.ctx.canvas.width/2)/this.camera.scale)-this.player.x;
    this.camera.y = ((this.ctx.canvas.height/2)/this.camera.scale)-this.player.y;
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity) {
    const index = this.entities.findIndex(e => e === entity)
    if (index > -1) this.entities.splice(index, 1);
  }
}