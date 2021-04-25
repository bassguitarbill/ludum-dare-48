export default class MessageManager {
  readonly messageQueue: Array<Message> = [];
  currentMessage?: Message = undefined;

  messageLifetime = 0;
  sendMessage(text: string, priority: number) {
    this.messageQueue.push(new Message(text, priority));
    this.messageQueue.sort((a, b) => b.priority - a.priority);
  }

  get message() {
    return this.currentMessage?.text || '';
  }

  tick(dt: number) { // This is game jam code, you're not allowed to get mad at me for this
    if (this.currentMessage) {
      if (this.currentMessage !== this.messageQueue[0]) {
        this.currentMessage = this.messageQueue[0];
        this.messageLifetime = this.currentMessage.text.length * 150;
      } else {
        this.messageLifetime -= dt;
        if (this.messageLifetime < 0) {
          this.messageQueue.shift();
          this.currentMessage = undefined;
        }
      }
     
    } else {
      if (this.messageQueue.length) {
        this.currentMessage = this.messageQueue[0];
        this.messageLifetime = this.currentMessage.text.length * 150;
      }
    }
  }
}

class Message {
  constructor(readonly text: string, readonly priority: number) {}
}