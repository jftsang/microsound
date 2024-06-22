// Set up the AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a SOUND
async function playSound({channel, pitch, duration, volume}) {
  return new Promise(
    resolve => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine'; // Default waveform type
      // pitch is in quarter-semitones from middle C
      const multiplier = Math.pow(2, (pitch - 53) / 48);
      oscillator.frequency.value = 256 * multiplier;
      console.log(oscillator.frequency.value)
      gainNode.gain.value = volume / 15; // BBC Micro volume is 0-15, normalize to 0-1

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 100); // Duration in 1/100th seconds
      oscillator.onended = resolve;
    }
  )
}

// Function to play an ENVELOPE
async function playEnvelope(number, attack, decay, sustain, release, peak, sustainLevel, pitch1, pitch2, pitch3) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = pitch1; // Starting pitch

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(peak / 15, now + attack / 100); // Attack
  gainNode.gain.linearRampToValueAtTime(sustainLevel / 15, now + attack / 100 + decay / 100); // Decay
  gainNode.gain.setValueAtTime(sustainLevel / 15, now + attack / 100 + decay / 100 + sustain / 100); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + attack / 100 + decay / 100 + sustain / 100 + release / 100); // Release

  oscillator.start();
  oscillator.stop(now + attack / 100 + decay / 100 + sustain / 100 + release / 100);
  oscillator.onended = resolve;
}

// // Event listeners for buttons
// document.getElementById('playSound').addEventListener('click', () => {
//   playSound({channel: 0, pitch: 440, duration: 100, volume: 15}); // Example SOUND: channel 0, pitch 440Hz, duration 1s, max volume
// });
//
// document.getElementById('playEnvelope').addEventListener('click', () => {
//   playEnvelope(0, 100, 100, 200, 100, 15, 10, 440, 0, 0); // Example ENVELOPE
// });
//
document.getElementById("playSound").addEventListener('click', async () => {
  const commands = document.getElementById("commands").value.split('\n');
  for (let i = 0; i < commands.length; i++) {
    const pitches = commands[i].split(',');
    const promises = pitches.map((pitch, i) => playSound(
      {
        channel: i, pitch: parseInt(pitch.trim()) - 60, duration: 50, volume: 15 / Math.pow(3, i)
      })
    )
    // await all the promises
    await Promise.all(promises);
    /*
    if (command.length === 4) {
      await playSound({
        channel: command[0],
        pitch: command[1],
        duration: command[2],
        volume: command[3]
      });
    } else if (command.length === 6) {
      await playEnvelope(command[0], command[1], command[2], command[3], command[4], command[5]);
    }
     */
  }
})
