export default class BGM {
  static async load(path: string) {
    const audioElement = new Audio();
    //await new Promise((res, _) => {
      audioElement.src = path;
    //  audioElement.addEventListener('load', res);
    //});
    const somebodyClicked = () => {
      window.removeEventListener('click', somebodyClicked);
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audioElement);
      const gainNode = audioCtx.createGain();
      source.connect(gainNode).connect(audioCtx.destination);
      audioElement.play();
      audioElement.loop = true;
    }
    window.addEventListener('click', somebodyClicked);
  }
}