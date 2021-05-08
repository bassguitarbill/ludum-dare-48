import BGM from "./BGM.js";
import Boat from "./Boat.js";
import Bubble from "./Bubble.js";
import Camera from "./Camera.js";
import Debug from "./Debug.js";
import Enemy from "./Enemy.js";
import Entity from "./Entity.js";
import GUI from "./GUI.js";
import { Controls, isControlPressed } from "./Input.js";
import MessageManager from "./MessageManager.js";
import Minimap from "./Minimap.js";
import PickableObject from "./PickableObject.js";
import Player from "./Player.js";
import Projectile from "./Projectile.js";
import QuestManager from "./QuestManager.js";
import SFX from "./SFX.js";
import Text from "./Text.js";
import TextEventManager from "./TextEventManager.js";
import World from "./World.js";

export default class Game {
  timestamp: number = 0;
  initialTimestamp: number = 0;
  ctx: CanvasRenderingContext2D;
  public player: Player;
  readonly entities: Array<Entity> = [];
  readonly camera: Camera;
  readonly gui: GUI;
  readonly messageManager: MessageManager;
  readonly textEventManager: TextEventManager;
  readonly questManager: QuestManager;
  readonly minimap: Minimap;

  isGameOver = false;
  enableRToRespawn = false;
  public framerate = 0;

  public speedrunTimer = 0;
  public speedrunTimerStopped = false;

  constructor(readonly world: World) {
    const canvas = document.querySelector('canvas')!;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.tick = this.tick.bind(this);

    this.player = new Player(this, world.getPlayerSpawnLocation())
    this.world.spawnObjects(this);

    this.camera = new Camera(this);
    this.gui = new GUI(this);
    new Debug(this);
    this.messageManager = new MessageManager();

    this.textEventManager = new TextEventManager(this);

    this.questManager = new QuestManager(this);

    this.minimap = new Minimap(this);
  }

  static async load(): Promise<Game> {
    const world = await World.loadInstance('maps/map1.json');
    await Player.load();
    await Bubble.load();
    await PickableObject.load();
    await GUI.load();
    await BGM.load('assets/audio/bgm.ogg');
    await SFX.load();
    await Text.load();
    await Boat.load();
    await Enemy.load();
    await Projectile.load();
    return new Game(world);
  }

  run() {
    requestAnimationFrame(this.tick);
  }

  tick(timestamp: number) {
    if(this.initialTimestamp === 0) this.initialTimestamp = timestamp;
    let dt = timestamp - this.timestamp;
    if (dt > 500) dt = 500; // clamp this to keep everything from falling through the floor!
    this.timestamp = timestamp;
    if (!this.speedrunTimerStopped) this.speedrunTimer = this.timestamp - this.initialTimestamp;
    this.framerate = 1000 / dt;
    this.world.tick(dt);
    this.entities.forEach(e => e.tick(dt));
    this.player.tick(dt);
    this.messageManager.tick(dt);
    this.textEventManager.tick(dt);
    this.questManager.tick(dt);
    this.minimap.tick(dt);

    if (isControlPressed(Controls.RESPAWN)) {
      this.player.destroy();
      const { hasArmor } = this.player;
      this.player = new Player(this, this.world.getPlayerSpawnLocation());
      this.player.hasArmor = hasArmor;
      this.isGameOver = false;
    }
    this.camera.moveCamera(this.ctx);
    
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.camera.scaleCanvas(this.ctx);
    this.world.draw(this.ctx);
    this.entities.forEach(e => e.draw(this.ctx));
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.gui.draw(this.ctx);
    requestAnimationFrame(this.tick);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity) {
    const index = this.entities.findIndex(e => e === entity)
    if (index > -1) this.entities.splice(index, 1);
  }

  gameOver() {
    this.isGameOver = true;
    if (this.enableRToRespawn) {
      this.messageManager.sendMessage('hit R to try again! hit r to try again! hit r to try again!', 999999999);
    }
  }
}