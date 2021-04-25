let audioCtx: AudioContext;
const audioContextCallbacks: Array<Function> = [];

const somebodyClicked = () => {
  window.removeEventListener('click', somebodyClicked);
  audioCtx = new AudioContext();
  audioContextCallbacks.forEach(cb => cb(audioCtx));
}

function addAudioContextCallback(f: Function) {
  audioContextCallbacks.push(f);
}
window.addEventListener('click', somebodyClicked);

export { audioCtx, addAudioContextCallback }