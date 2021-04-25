import Boat from "./Boat.js";
import Game from "./Game.js";
import { Vector2 } from "./math.js";
import PickableObject from "./PickableObject.js";
import SFX from "./SFX.js";

export default class QuestManager {
  timeUntilReminder = 30000;

  constructor(readonly game: Game){
    this.game.messageManager.sendMessage(this.currentQuest?.message || '', 5);
  }

  tick(dt: number) {
    if (!this.currentQuest) return;
    this.timeUntilReminder -= dt;
    if (this.timeUntilReminder < 0) {
      this.game.messageManager.sendMessage(this.currentQuest.reminder, 5);
      this.timeUntilReminder = 45000;
    }
  }

  retrieve(item: PickableObject) {
    if (this.currentQuest.task !== 'retrieve') return;
    if (this.currentQuest.item === item.itemType) this.completeQuest();
  }

  obtain(item: PickableObject) {
    if (this.currentQuest.task !== 'obtain') return;
    if (this.currentQuest.item === item.itemType) this.completeQuest();
  }

  destroy(item: PickableObject) {
    if (this.currentQuest.task !== 'destroy') return;
    if (this.currentQuest.item !== item.itemType) return;
    if (!(this.game.entities.filter(e => e instanceof PickableObject) as Array<PickableObject>).find(o => o.itemType === item.itemType)) this.completeQuest();
  }

  completeQuest() {
    this.currentQuest.onComplete(this.game);
    questSteps.shift();
    this.game.messageManager.sendMessage(this.currentQuest?.message || '', 5);
    this.timeUntilReminder = 30000;
  }

  get currentQuest() {
    return questSteps[0];
  }
}

const questSteps = [
  { task: 'obtain', item: 1, message: 'Can you take the sub down and find my luggage? I dropped it overboard',
    reminder: 'The luggage should be right under the boat. If you can\'t find it, look deeper!',
    onComplete: (game: Game) => {
      game.entities.find(e => e instanceof Boat)?.destroy();
      new Boat(game, new Vector2(800, 60));
    }},
  { task: 'retrieve', item: 1, message: 'You\'ve got it! I\'ll meet you over to the right of this tunnel, up at the surface!',
    reminder: 'Bring it back to the boat, please! Middle of the map, and at the surface!',
    onComplete: (game: Game) => {
      SFX.play('pickup.wav');
      game.player.currentlyGrapsedItem?.destroy();
      game.player.currentlyGrapsedItem = null;
    }},
  { task: 'destroy', item: 2, message: 'I know there is a chest with gold bars inside it. Bring them to me and I will upgrade your hull!',
    reminder: 'The gold should be in a chest at the right edge of the map',
    onComplete: (game: Game) => {
      new PickableObject(game, Vector2.sumOf(game.player.position, new Vector2(0, 12)), 3);
    }},
  { task: 'retrieve', item: 3, message: 'You found them! Bring them back to the boat and I\ll upgrade your armor',
    reminder: 'Where\'d you go with that gold? I\'m in about the center of the map',
    onComplete: (game: Game) => {
      SFX.play('pickup.wav');
      game.player.currentlyGrapsedItem?.destroy();
      game.player.currentlyGrapsedItem = null;
      game.player.hasArmor = true;
      game.messageManager.sendMessage('Thanks! I\'m installing armor on your sub now! You\'ll be able to handle high pressures!', 8);
    }},
  { task: 'obtain', item: 0, message: 'Okay, time to look for the last piece of treasure! It\'s the Light Orb! It\'s pretty deep down, probably on the right side of the map.',
    reminder: 'You should be able to see a little bit out of your sub, even in the darkness! Head to the bottom right of the map!',
    onComplete: (_: Game) => {}},
  { task: 'retrieve', item: 0, message: 'Are you okay? Wow, that thing was gigantic! Bring the pearl back up and I\'ll fix your sub!',
    reminder: 'You\'re almost done! Just bring that Light orb back to the boat, okay?',
    onComplete: (game: Game) => {
      SFX.play('pickup.wav');
      game.player.currentlyGrapsedItem?.destroy();
      game.player.currentlyGrapsedItem = null;
      game.messageManager.sendMessage('Thank you for playing my game, I hope you enjoyed it! Feel free to keep exploring!', 8);
    }},
]