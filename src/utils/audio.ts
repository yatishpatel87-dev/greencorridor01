/**
 * Audio and Web Speech synthesizer for 108 Emergency Green Corridor Simulator
 * Uses native Web Audio API oscillators and Web Speech API (zero external mp3 dependencies)
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenLfo: OscillatorNode | null = null;
  private isSirenPlaying = false;
  private soundEnabled = true;
  private voiceEnabled = true;
  private currentLanguage: 'en' | 'gu' = 'en';
  private lastAnnouncedPhrase = '';

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled && this.isSirenPlaying) {
      this.stopSiren();
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public setLanguage(lang: 'en' | 'gu') {
    this.currentLanguage = lang;
  }

  // --- AMBULANCE SIREN ---
  public startSiren() {
    if (!this.soundEnabled || this.isSirenPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Main carrier oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, this.ctx.currentTime);

      // Low Frequency Oscillator for the wail modulation
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.7, this.ctx.currentTime); // 0.7 Hz wail cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(260, this.ctx.currentTime); // modulate ±260Hz (from 420Hz to 940Hz)

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Output gain
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.3); // soft comfortable volume

      // Low pass filter to make the siren sound warm and realistic
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      lfo.start();

      this.sirenOsc = osc;
      this.sirenLfo = lfo;
      this.sirenGain = gain;
      this.isSirenPlaying = true;
    } catch (e) {
      console.warn('AudioContext siren failed:', e);
    }
  }

  public stopSiren() {
    if (!this.isSirenPlaying || !this.sirenGain || !this.ctx) {
      this.isSirenPlaying = false;
      return;
    }
    try {
      const now = this.ctx.currentTime;
      this.sirenGain.gain.setValueAtTime(this.sirenGain.gain.value, now);
      this.sirenGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      setTimeout(() => {
        try {
          this.sirenOsc?.stop();
          this.sirenLfo?.stop();
          this.sirenOsc?.disconnect();
          this.sirenLfo?.disconnect();
          this.sirenGain?.disconnect();
        } catch {
          // ignore
        }
        this.sirenOsc = null;
        this.sirenLfo = null;
        this.sirenGain = null;
        this.isSirenPlaying = false;
      }, 220);
    } catch {
      this.isSirenPlaying = false;
    }
  }

  // --- DISPATCH ALERT CHIME ---
  public playDispatchAlert() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(784, now); // G5
      osc.frequency.setValueAtTime(1046, now + 0.12); // C6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  // --- SIGNAL PREEMPTION CHIME ---
  public playSignalPrioritySound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  // --- HOSPITAL PAGER BEEP ---
  public playHospitalAlertSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.14, 0.28].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987, now + offset); // B5
        gain.gain.setValueAtTime(0.09, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.09);
      });
    } catch {
      // ignore
    }
  }

  // --- MISSION COMPLETED FANFARE ---
  public playMissionCompleteSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.55);
      });
    } catch {
      // ignore
    }
  }

  // --- VOICE ANNOUNCEMENTS (WEB SPEECH API) ---
  public speakAnnouncement(key: 'ambulance_approaching' | 'corridor_activated' | 'signal_prioritized' | 'hospital_approaching' | 'mission_completed', param?: string | number) {
    if (!this.voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const phrases = {
      en: {
        ambulance_approaching: 'Attention. Emergency 108 ambulance is approaching. Please yield way.',
        corridor_activated: 'Green corridor active. Traffic signals prioritized.',
        signal_prioritized: `Traffic signal ${param || ''} has been preempted to green.`,
        hospital_approaching: 'Emergency ambulance approaching hospital trauma center.',
        mission_completed: 'Emergency mission completed. Patient safely admitted.',
      },
      gu: {
        ambulance_approaching: 'ધ્યાન આપો. ઇમરજન્સી ૧૦૮ એમ્બ્યુલન્સ આવી રહી છે.',
        corridor_activated: 'ગ્રીન કોરિડોર સક્રિય કરવામાં આવ્યો છે.',
        signal_prioritized: `ટ્રાફિક સિગ્નલ ${param || ''} ને એમ્બ્યુલન્સ માટે પ્રાથમિકતા આપવામાં આવી છે.`,
        hospital_approaching: 'એમ્બ્યુલન્સ હોસ્પિટલ તરફ પહોંચી રહી છે.',
        mission_completed: 'ઇમરજન્સી મિશન સફળતાપૂર્વક પૂર્ણ થયું છે.',
      }
    };

    const phrase = phrases[this.currentLanguage][key];
    if (!phrase || phrase === this.lastAnnouncedPhrase) return;

    this.lastAnnouncedPhrase = phrase;
    setTimeout(() => {
      this.lastAnnouncedPhrase = '';
    }, 4000);

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try selecting an appropriate voice
      const voices = window.speechSynthesis.getVoices();
      if (this.currentLanguage === 'gu') {
        const guVoice = voices.find(v => v.lang.startsWith('gu') || v.lang.includes('IN'));
        if (guVoice) utterance.voice = guVoice;
      } else {
        const enVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }
}

export const soundController = new SoundController();
