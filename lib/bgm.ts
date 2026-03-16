// BGM player using HTML Audio element with public/bgm.mp3

let audio: HTMLAudioElement | null = null;

export function startBGM() {
  if (audio) return;

  audio = new Audio("/bgm.mp3");
  audio.loop = true;
  audio.volume = 0;
  audio.play();

  // Fade in over 3 seconds
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol += 0.02;
    if (vol >= 0.6) {
      vol = 0.6;
      clearInterval(fadeIn);
    }
    if (audio) audio.volume = vol;
  }, 60);
}

export function stopBGM() {
  if (!audio) return;

  const a = audio;
  // Fade out over 2 seconds
  const fadeOut = setInterval(() => {
    const next = a.volume - 0.03;
    if (next <= 0) {
      a.volume = 0;
      a.pause();
      a.src = "";
      clearInterval(fadeOut);
      audio = null;
    } else {
      a.volume = next;
    }
  }, 60);
}
