// audioManager.js — handles ambient, music, voice notes, procedural soundscapes, and SFX
import { Howl, Howler } from 'howler';

class AudioManager {
  constructor() {
    this.ambient = null;
    this.music = null;
    this.voice = null;
    this.muted = false;
    this.ambientVolume = 0.35;
    this.musicVolume = 0.25;
    this.voiceVolume = 1.0;
    this._started = false;

    // Web Audio API context for procedural sounds & effects
    this.audioCtx = null;
    this.masterGain = null;
    this.synthNodes = [];
    this.synthIntervals = [];
    this.currentSceneId = null;
  }

  // Called once on first user tap — unlocks audio on iOS/Android
  start() {
    if (this._started) return;
    this._started = true;
    Howler.volume(1.0);

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  _ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Procedural Soundscapes for each scene when mp3 is not provided
  playSceneAtmosphere(sceneId) {
    this.currentSceneId = sceneId;
    this.stopSynthesizedAtmosphere();
    this._ensureContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (sceneId === 'trailhead') {
      // Soft mountain breeze
      this._createWindSound(0.18);
      // Faint dreamy piano chime every 6-9s
      const chimeInt = setInterval(() => {
        if (this.currentSceneId !== 'trailhead') return;
        this.playDreamChime([261.63, 329.63, 392.00, 493.88, 587.33]);
      }, 7000);
      this.synthIntervals.push(chimeInt);
    } else if (sceneId === 'rain-path') {
      // Soothing rain sound
      this._createRainSound(0.28);
    } else if (sceneId === 'lake') {
      // Gentle water lapping & deep serene stillness
      this._createLakeSound(0.22);
    } else if (sceneId === 'stars') {
      // Warm ethereal ambient pad (432Hz harmonic space)
      this._createCosmicPad(0.24);
    } else if (sceneId === 'cabin') {
      // Warm fireplace crackle + soft cozy hum
      this._createFireplaceSound(0.25);
    }
  }

  _createWindSound(vol = 0.2) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // LFO for swaying breeze
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.synthNodes.push(noise, lfo, gain, filter);
  }

  _createRainSound(vol = 0.3) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(900, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.synthNodes.push(noise, gain, bandpass);
  }

  _createLakeSound(vol = 0.22) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    // Low calm water tone
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(164.81, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * 0.7, ctx.currentTime + 3);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc2.start();
    this.synthNodes.push(osc, osc2, gain, filter);

    // Subtle gentle water lapping
    this._createWindSound(vol * 0.4);
  }

  _createCosmicPad(vol = 0.25) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    // Fmaj7 / A min cosmic frequencies (432Hz tuned warmth)
    const freqs = [172.8, 216.0, 259.2, 324.0, 432.0];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 0.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime((vol / freqs.length) * (1.2 - idx * 0.15), ctx.currentTime + 3 + idx);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.synthNodes.push(osc, gain);
    });
  }

  _createFireplaceSound(vol = 0.25) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    // Warm low drone
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65.4, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol * 0.8, ctx.currentTime + 2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.synthNodes.push(osc, gain, filter);

    // Subtle crackle pulses
    const crackleInterval = setInterval(() => {
      if (this.currentSceneId !== 'cabin' || !this.audioCtx || this.muted) return;
      if (Math.random() > 0.4) {
        this.playSoftPop();
      }
    }, 400);
    this.synthIntervals.push(crackleInterval);
  }

  playSoftPop() {
    if (!this.audioCtx || this.muted) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(Math.random() * 600 + 400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  playDreamChime(scaleNotes = [329.63, 392.00, 493.88, 587.33, 659.25]) {
    if (!this.audioCtx || this.muted) return;
    const ctx = this.audioCtx;
    const note = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 3.6);
  }

  playFootstep() {
    if (!this.audioCtx || this.muted) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 20, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  playStarChime(freq = 659.25) {
    if (!this.audioCtx || this.muted) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }

  playCandleBlow() {
    if (!this.audioCtx || this.muted) return;
    const ctx = this.audioCtx;
    // Whoosh / soft puff
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  stopSynthesizedAtmosphere() {
    this.synthIntervals.forEach(clearInterval);
    this.synthIntervals = [];

    if (this.synthNodes.length > 0 && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.synthNodes.forEach(node => {
        try {
          if (node.gain) {
            node.gain.linearRampToValueAtTime(0, now + 1.2);
          } else if (node.stop) {
            setTimeout(() => { try { node.stop(); } catch(e){} }, 1300);
          }
        } catch (e) {}
      });
      setTimeout(() => { this.synthNodes = []; }, 1500);
    }
  }

  // Play ambient loop for a scene (Howler MP3)
  playAmbient(src) {
    if (!src) return;
    if (this.ambient) {
      this.ambient.fade(this.ambientVolume, 0, 1000);
      setTimeout(() => { this.ambient.stop(); this.ambient.unload(); }, 1100);
    }
    this.ambient = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        console.log('Audio ambient file not found, procedural ambience running');
      }
    });
    this.ambient.play();
    this.ambient.fade(0, this.ambientVolume, 2000);
  }

  // Play background music (Howler MP3)
  playMusic(src) {
    if (!src) return;
    if (this.music) {
      this.music.fade(this.musicVolume, 0, 2000);
      setTimeout(() => { this.music.stop(); this.music.unload(); }, 2100);
    }
    this.music = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        console.log('Music file not found, procedural score active');
      }
    });
    this.music.play();
    this.music.fade(0, this.musicVolume, 2000);
  }

  _normalizeSource(src) {
    if (!src) return [];
    const list = Array.isArray(src) ? src : [src];
    const base = import.meta.env.BASE_URL || './';
    return list.map(item => {
      if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('blob:') || item.startsWith('data:')) {
        return item;
      }
      if (item.startsWith('/')) {
        return (base.endsWith('/') ? base : base + '/') + item.slice(1);
      }
      return item;
    });
  }

  // Play voice note — ducks ambience while playing
  playVoice(src, onEnd) {
    if (!src) { if (onEnd) onEnd(); return; }
    if (this.voice) {
      try { this.voice.stop(); this.voice.unload(); } catch(e){}
    }

    const sources = this._normalizeSource(src);

    // Duck ambient & procedural
    if (this.ambient) this.ambient.fade(this.ambientVolume, 0.05, 500);
    if (this.music) this.music.fade(this.musicVolume, 0.05, 500);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    }

    let ended = false;
    const safeEnd = () => {
      if (ended) return;
      ended = true;
      if (this.ambient) this.ambient.fade(0.05, this.ambientVolume, 1000);
      if (this.music) this.music.fade(0.05, this.musicVolume, 1000);
      if (this.masterGain && this.audioCtx && !this.muted) {
        this.masterGain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
      }
      if (onEnd) onEnd();
    };

    this.voice = new Howl({
      src: sources,
      volume: this.voiceVolume,
      html5: true,
      onend: safeEnd,
      onloaderror: (id, err) => {
        console.warn('Voice note failed to load:', sources, err);
        safeEnd();
      },
      onplayerror: (id, err) => {
        console.warn('Voice note playback error:', err);
        safeEnd();
      }
    });
    this.voice.play();
  }

  // Toggle voice playback: returns boolean isPlaying
  toggleVoice(src, onEnd, onStateChange) {
    if (this.voice && this.voice.playing()) {
      this.voice.pause();
      if (onStateChange) onStateChange(false);
      return false;
    } else if (this.voice && this.voice.state() === 'loaded') {
      this.voice.play();
      if (onStateChange) onStateChange(true);
      return true;
    } else {
      this.playVoice(src, () => {
        if (onStateChange) onStateChange(false);
        if (onEnd) onEnd();
      });
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  isPlayingVoice() {
    return Boolean(this.voice && this.voice.playing());
  }

  // Stop current voice
  stopVoice() {
    if (this.voice) {
      this.voice.fade(1, 0, 500);
      setTimeout(() => { try { this.voice.stop(); } catch(e){} }, 600);
    }
    if (this.ambient) this.ambient.fade(this.ambient.volume(), this.ambientVolume, 1000);
    if (this.music) this.music.fade(this.music.volume(), this.musicVolume, 1000);
    if (this.masterGain && this.audioCtx && !this.muted) {
      this.masterGain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
    }
  }

  // Crossfade to new scene
  crossfade(sceneId, nextAmbient, nextMusic) {
    if (this.ambient) { this.ambient.fade(this.ambientVolume, 0, 2000); setTimeout(() => this.ambient?.stop(), 2100); }
    if (this.music) { this.music.fade(this.musicVolume, 0, 2000); setTimeout(() => this.music?.stop(), 2100); }

    setTimeout(() => {
      this.ambient = null; this.music = null;
      if (nextAmbient) this.playAmbient(nextAmbient);
      if (nextMusic) this.playMusic(nextMusic);
      this.playSceneAtmosphere(sceneId);
    }, 1000);
  }

  toggle() {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.audioCtx.currentTime);
    }
    return this.muted;
  }

  isMuted() { return this.muted; }
}

export const audioManager = new AudioManager();

