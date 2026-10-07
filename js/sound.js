/**
 * Deutsch-LernOS - 8-Bit Mono Web Audio Synthesizer
 * 100% Offline, DSGVO-konform (keine externen Mediendateien oder CDNs)
 */

class RetroSound {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('deutschos_muted') === 'true';
    this.initAudio = this.initAudio.bind(this);
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('deutschos_muted', this.isMuted);
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  /**
   * Mono-Klick-Sound (kurzer 8-Bit Square-Wave-Impuls)
   */
  playClick() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      // Tonhöhe springt kurz von 750 Hz auf 350 Hz für echten Retro-Klick
      osc.frequency.setValueAtTime(750, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.audioCtx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio fallback silent
    }
  }

  /**
   * Fenster öffnen Sound (freundlicher kleiner 8-Bit Arpeggio-Aufstieg)
   */
  playWinOpen() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.04);
      osc.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.setValueAtTime(0.07, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  /**
   * Fenster schließen Sound (sanfter Abstieg)
   */
  playWinClose() {
    if (this.isMuted) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }
}

window.retroSound = new RetroSound();

// Globaler Klick-Listener für Mono-Sounds auf interaktiven Elementen
document.addEventListener('pointerdown', (e) => {
  const target = e.target.closest('button, .desktop-icon, .menu-item, .win-btn, .task-tab, .tray-btn');
  if (target) {
    window.retroSound.playClick();
  }
}, { passive: true });
