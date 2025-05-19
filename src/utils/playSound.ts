export function playCoinSound(sound: string = 'win-sound.mp3') {
  const audio = new Audio(`/Music/${sound}`);
  audio.play();
} 