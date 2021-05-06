import Boat from "./Boat.js";
import Game from "./Game.js";
import PickableObject from "./PickableObject.js";

export default class Minimap {
  mapImage: HTMLImageElement;

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

  getPoints(): Array<Point> {
    const points = [];
    const { x, y } = this.game.player;
    points.push({ x, y, color: '#37364e' });

    const quest = this.game.questManager.currentQuest;
    if (!quest) return points;
    
    switch(quest.task) {
      case 'retrieve':
        const boat = this.game.entities.filter(e => e instanceof Boat);
        boat.forEach(b => {
          const { x, y } = b;
          points.push({ x, y, color: '#f4e9d4' });
        });
        break;
      case 'obtain':
      case 'destroy':
        const items = this.game.entities.filter(e => e instanceof PickableObject && e.itemType === quest.item);
        items.forEach(i => {
          const { x, y } = i;
          points.push({ x, y, color: '#f4e9d4' });
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