import BGM from "./BGM.js";
import Boat from "./Boat.js";
import Bubble from "./Bubble.js";
import Debug from "./Debug.js";
import Enemy from "./Enemy.js";
import Entity from "./Entity.js";
import Gobo from "./Gobo.js";
import GUI from "./GUI.js";
import { Controls, isControlPressed } from "./Input.js";
import { Vector2 } from "./math.js";
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
  ctx: CanvasRenderingContext2D;
  camera = {
    scale: 3,
    x: 0,
    y: 0,
  };
  public player: Player;
  readonly entities: Array<Entity> = [];
  readonly gui: GUI;
  readonly messageManager: MessageManager;
  readonly textEventManager: TextEventManager;
  readonly questManager: QuestManager;
  readonly minimap: Minimap;

  isGameOver = false;
  enableRToRespawn = false;
  public framerate = 0;

  constructor(readonly world: World) {
    const canvas = document.querySelector('canvas')!;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.tick = this.tick.bind(this);

    this.player = new Player(this, world.getPlayerSpawnLocation())
    this.world.spawnObjects(this);

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
    await Gobo.load();
    await Boat.load();
    await Enemy.load();
    await Projectile.load();
    return new Game(world);
  }

  run() {
    this.timestamp = 0;
    requestAnimationFrame(this.tick);
  }

  tick(timestamp: number) {
    const dt = timestamp - this.timestamp;
    this.timestamp = timestamp;
    this.framerate = 1000 / dt;
    this.world.tick(dt);
    this.entities.forEach(e => e.tick(dt));
    this.player.tick(dt);
    this.messageManager.tick(dt);
    this.textEventManager.tick(dt);
    this.questManager.tick(dt);
    this.minimap.tick(dt);

    if (this.enableRToRespawn && isControlPressed(Controls.RESPAWN)) {
      this.player.destroy();
      this.player = new Player(this, new Vector2(1240, 1080));
      this.player.hasArmor = true;
      this.isGameOver = false;
    }
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

  gameOver() {
    this.isGameOver = true;
    if (this.enableRToRespawn) {
      this.messageManager.sendMessage('hit R to try again! hit r to try again! hit r to try again!', 999999999);
    }
  }
}