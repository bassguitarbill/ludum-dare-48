import Game from "./Game.js";
import { ObjectData } from "./World.js";

export default class Debug {
  warps: Array<ObjectData>;
  constructor(readonly game: Game) {
    this.warps = game.world.eventsLayer.objects.filter(o => o.type === 'warp');
    window.addEventListener('keydown', ev => {
      const warp = this.warps.find(o => o.name === ev.key);
      if (warp) {
        this.game.player.position.x = warp.x;
        this.game.player.position.y = warp.y;
      }
    });
  }
}