import { addAudioContextCallback } from "./Audio.js";

export default class BGM {
  static async load(path: string) {
    addAudioContextCallback((audioCtx: AudioContext) => {
      const source = audioCtx.createMediaElementSource(audioElement);
      const gainNode = audioCtx.createGain();
      source.connect(gainNode).connect(audioCtx.destination);
      audioElement.play();
      audioElement.loop = true;
    })
    const audioElement = new Audio();
    audioElement.src = path;
  }
}