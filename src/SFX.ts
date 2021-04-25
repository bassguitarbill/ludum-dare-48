import { addAudioContextCallback } from "./Audio.js";

export default class SFX {
  static audioElements: { [key in string]: HTMLAudioElement} = {};
  static audioSources: { [key in string]: MediaElementAudioSourceNode} = {};
  static async load() {
    ['crash.wav', 'pickup.wav', 'destroy.wav', 'wormyell.wav' ].forEach(filename => {
      const audioElement = new Audio();
      audioElement.src = `assets/audio/${filename}`;
      this.audioElements[filename] = audioElement;
    });
    addAudioContextCallback((audioCtx: AudioContext) => {
      const gainNode = audioCtx.createGain();
      for(const el in this.audioElements) {
        this.audioSources[el] = audioCtx.createMediaElementSource(this.audioElements[el]);
        this.audioSources[el].connect(gainNode);
      }
      gainNode.connect(audioCtx.destination);
    });
  }
  static play(fileName: string) {
    this.stopAllSounds();
    this.audioElements[fileName].play();
  }
  static stopAllSounds() {
    for(const el in this.audioElements) {
      this.audioElements[el].pause();
    }
  }
}