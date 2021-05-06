import Boat from "./Boat.js";
import Game from "./Game.js";
import PickableObject from "./PickableObject.js";

export default class Minimap {
  mapImage: HTMLImageElement;

  flashTimer = 500;
  flash = false;

  constructor(readonly game: Game) {
    const canvas = document.createElement('canvas');
    canvas.height = game.world.mapData.height + 2;
    canvas.width = game.world.mapData.width + 2;
    const ctx = canvas.getContext('2d')!;
    game.world.drawMinimap(ctx);
    this.mapImage = new Image();
    this.mapImage.src = ctx.canvas.toDataURL();
    //this.points = [];
  }

  tick(dt: number) {
    this.flashTimer -= dt;
    if (this.flashTimer < 0) {
      this.flashTimer += 500;
      this.flash = !this.flash;
    }
  }

  getPoints(): Array<Point> {
    const points = [];
    const { x, y } = this.game.player;
    points.push({ x, y, color: '#f00' });

    const quest = this.game.questManager.currentQuest;
    if (!quest) return points;

    switch(quest.task) {
      case 'retrieve':
        const boat = this.game.entities.filter(e => e instanceof Boat);
        boat.forEach(b => {
          const { x, y } = b;
          points.push({ x, y, color: '#fff' });
        });
        break;
      case 'obtain':
      case 'destroy':
        const items = this.game.entities.filter(e => e instanceof PickableObject && e.itemType === quest.item);
        items.forEach(i => {
          const { x, y } = i;
          points.push({ x, y, color: '#fff' });
        });
        break;
    }
    return points;
  }
}

interface Point {
  x: number,
  y: number,
  color: string,
}