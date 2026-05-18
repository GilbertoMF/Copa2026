export const playSound = (type: 'hover' | 'click' | 'rip' | 'pop' | 'legendary' | 'coins') => {
  try {
    const soundSetting = localStorage.getItem('world_cup_sound');
    if (soundSetting === 'false') return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playOscillator = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    };

    switch (type) {
      case 'hover':
        playOscillator(400, 'sine', 0.1, 0.05);
        break;
      case 'click':
        playOscillator(600, 'square', 0.1, 0.05);
        break;
      case 'rip': // Sound of tearing the pack
        playOscillator(150, 'sawtooth', 0.3, 0.1);
        setTimeout(() => playOscillator(200, 'sawtooth', 0.2, 0.05), 100);
        break;
      case 'pop': // Revealing a normal sticker
        playOscillator(800, 'sine', 0.15, 0.1);
        break;
      case 'legendary': // Revealing a shiny sticker
        playOscillator(600, 'sine', 0.1, 0.1);
        setTimeout(() => playOscillator(800, 'sine', 0.1, 0.1), 100);
        setTimeout(() => playOscillator(1200, 'sine', 0.2, 0.1), 200);
        setTimeout(() => playOscillator(1600, 'sine', 0.5, 0.2), 300);
        break;
      case 'coins':
        playOscillator(1200, 'square', 0.1, 0.05);
        setTimeout(() => playOscillator(1600, 'square', 0.1, 0.05), 50);
        setTimeout(() => playOscillator(2000, 'square', 0.2, 0.05), 100);
        break;
    }
  } catch (e) {
    // Ignore audio context errors
  }
};
