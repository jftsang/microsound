// Set up the AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to play a SOUND
async function playSound({channel, pitch, duration, volume, waveform}) {
  return new Promise(
    resolve => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = waveform;
      // pitch is in quarter-semitones from middle C
      const multiplier = Math.pow(2, (pitch - 53) / 48);
      console.log(pitch)
      console.log(multiplier)
      oscillator.frequency.value = 256 * multiplier;
      console.log(oscillator.frequency.value)
      gainNode.gain.value = volume / 15; // BBC Micro volume is 0-15, normalize to 0-1

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 20); // Duration in 1/20th seconds
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

document.getElementById("playSound").addEventListener('click', async () => {
  const waveform = document.getElementById("waveform").value;
  const pitchShift = parseInt(document.getElementById("pitchShift").value);
  const baseDuration = parseInt(document.getElementById("baseDuration").value);

  const commands = document.getElementById("commands").value.split('\n');
  for (let i = 0; i < commands.length; i++) {
    const [duration, ...pitches] = commands[i].split(',');
    await Promise.all(
      pitches.map((pitch, i) => {
          return playSound(
            {
              channel: i,
              pitch: parseInt(pitch.trim()) + pitchShift,
              duration: baseDuration * duration,
              volume: 15 / Math.pow(4, i),
              waveform
            });
        }
      )
    )
  }
})
