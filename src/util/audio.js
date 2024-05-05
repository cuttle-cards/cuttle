export function playAudio(audio) {
  if (audio.readyState === 4) {
    playLoadedAudio(audio);
  } else {
    audio.addEventListener('canplaythrough', playLoadedAudio(audio));
  }
}

async function playLoadedAudio(audio) {
  try {
    await audio.play();
  } catch (err) {
    console.warn('Cuttle Warn: Error playing audio', {
      url: audio.src,
      err,
    });
  } finally {
    audio.removeEventListener('canplaythrough', playLoadedAudio);
  }
}
