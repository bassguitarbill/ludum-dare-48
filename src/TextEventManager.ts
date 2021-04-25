import AABBHitbox from "./AABBHitbox.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";
import { ObjectData } from "./World.js";

export default class TextEventManager {
  readonly textEvents: Array<TextEvent>;
  constructor(readonly game: Game) {
    this.textEvents = game.world.eventsLayer.objects.filter(o => o.type === 'text').map(o => new TextEvent(game, o));
  }

  tick(dt: number) {
    this.textEvents.filter(e => !e.fired).forEach(e => e.tick(dt))
  }
}

class TextEvent {
  hitbox: AABBHitbox;
  fired = false;
  message: string;
  constructor(readonly game: Game, readonly obj: ObjectData) {
    this.hitbox = new AABBHitbox(new Vector2(obj.x, obj.y), new Vector2(obj.x + obj.width, obj.y + obj.height))
    this.message = textEventMap[obj.name];
  }

  tick(_: number) {
    if (this.game.player.getHitbox()?.collides(this.hitbox)) {
      this.fired = true;
      this.game.messageManager.sendMessage(this.message, 6);
    }
  }
}

const textEventMap: { [key in string]: string} = {
  pressureText1: 'I don\'t know if I\'d go much farther down, that\'s a lot of water pressure!',
  pressureText2: 'I don\'t know if I\'d go much farther down, that\'s a lot of water pressure!',
  pressureText3: 'I don\'t know if I\'d go much farther down, that\'s a lot of water pressure!',
  treasureText1: 'I know the pressure is high, but we need to get that chest down there. Stay as high as you can!',
  treasureText2: 'It looks like it might have fallen down that hole!',
  bossApproachText: 'Be careful in there!',
}