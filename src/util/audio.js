/**
 * Plays an audio file now or once it's ready (if not ready yet)
 *
 * @param {HTMLAudioElement} audio the audio element to play
 */
export function playAudio(audio) {
  if (audio.readyState === 4) {
    playLoadedAudio(audio);
  } else {
    audio.addEventListener('canplaythrough', playLoadedAudio(audio));
  }
}

/**
 * Plays an audio file, assuming it is ready
 * Removes 'canplaythrough' event listener during cleanup
 * 
 * Not for use in app logic -- use `playAudio()` instead
 * 
 * @param {HTMLAudioElement} audio the audio element to play
 */
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
