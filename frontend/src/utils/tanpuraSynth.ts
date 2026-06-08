/**
 * A physical-modeling style Tanpura Drone Synthesizer using Web Audio API.
 * Synthesizes 4 strings tuned to:
 * 1. Pa (0.75 * Sa), Ma (0.67 * Sa), or Ni (0.94 * Sa)
 * 2. Sa (1.0 * Sa) - Middle octave
 * 3. Sa (1.0 * Sa) - Middle octave, slightly detuned
 * 4. Sa (0.5 * Sa) - Lower octave
 */

export class TanpuraSynth {
  private ctx: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private isRunning = false;
  private timerId: any = null;
  private nextPluckTime = 0;
  private stringIndex = 0;
  private baseFrequency = 130.81; // default C3 (Male scale)
  private droneType: "P" | "M" | "N" = "P";
  private volume = 0.5;

  // Pluck cycle constants
  private readonly PLUCK_INTERVAL = 1.2; // seconds between plucks
  private readonly LOOK_AHEAD = 0.1;     // scheduling look-ahead window
  private readonly SCHEDULE_PERIOD = 50;  // ms between ticks

  constructor() {}

  /**
   * Start the Tanpura drone.
   */
  public start(
    audioContext: AudioContext,
    tonicFrequency: number,
    droneType: "P" | "M" | "N" = "P",
    volume = 0.5
  ) {
    if (this.isRunning) {
      this.stop();
    }

    this.ctx = audioContext;
    this.baseFrequency = tonicFrequency;
    this.droneType = droneType;
    this.volume = volume;

    // Create main volume node
    this.outputNode = this.ctx.createGain();
    this.outputNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.outputNode.connect(this.ctx.destination);

    this.isRunning = true;
    this.nextPluckTime = this.ctx.currentTime;
    this.stringIndex = 0;

    // Start scheduling loop
    this.scheduler();
  }

  /**
   * Stop the Tanpura drone and clear active nodes.
   */
  public stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.outputNode) {
      try {
        this.outputNode.disconnect();
      } catch (e) {
        // Already disconnected
      }
      this.outputNode = null;
    }
    this.ctx = null;
  }

  /**
   * Dynamically adjust volume.
   */
  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.outputNode && this.ctx) {
      this.outputNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Dynamically update the base frequency (tonic).
   */
  public setTonic(frequency: number) {
    if (frequency > 0) {
      this.baseFrequency = frequency;
    }
  }

  /**
   * Dynamically update drone tuning type.
   */
  public setDroneType(type: "P" | "M" | "N") {
    this.droneType = type;
  }

  /**
   * Background scheduler loop.
   */
  private scheduler() {
    if (!this.isRunning || !this.ctx) return;

    // Schedule any plucks that fall within our look-ahead window
    while (this.nextPluckTime < this.ctx.currentTime + this.LOOK_AHEAD) {
      this.schedulePluck(this.stringIndex, this.nextPluckTime);
      this.nextPluckTime += this.PLUCK_INTERVAL;
      this.stringIndex = (this.stringIndex + 1) % 4;
    }

    this.timerId = setTimeout(() => this.scheduler(), this.SCHEDULE_PERIOD);
  }

  /**
   * Schedule a pluck for a specific string at a specific time.
   */
  private schedulePluck(stringNum: number, time: number) {
    if (!this.ctx || !this.outputNode) return;

    // 1. Determine frequency of the string
    let freqMultiplier = 1.0;
    let detune = 0; // cents

    switch (stringNum) {
      case 0:
        // String 1: Pa (0.75 * Sa), Ma (0.667 * Sa), or Ni (0.944 * Sa)
        if (this.droneType === "P") freqMultiplier = 0.75; // Mandra Pa
        else if (this.droneType === "M") freqMultiplier = 0.6667; // Mandra Ma
        else freqMultiplier = 0.9438; // Mandra Ni (Kakali Ni)
        break;
      case 1:
        // String 2: Sa (1.0 * Sa)
        freqMultiplier = 1.0;
        detune = -2.5; // slightly flat
        break;
      case 2:
        // String 3: Sa (1.0 * Sa)
        freqMultiplier = 1.0;
        detune = 2.5; // slightly sharp (creates rich chorus/beating effect)
        break;
      case 3:
        // String 4: Mandra Sa (0.5 * Sa)
        freqMultiplier = 0.5;
        break;
    }

    const freq = this.baseFrequency * freqMultiplier;

    // 2. Synthesize the pluck
    this.synthesizeString(freq, detune, time);
  }

  /**
   * Creates nodes and plays a single string pluck at the given time.
   */
  private synthesizeString(freq: number, detuneCents: number, time: number) {
    if (!this.ctx || !this.outputNode) return;

    const pluckGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.connect(pluckGain);
    pluckGain.connect(this.outputNode);

    // Multi-harmonic additive synthesis to model a rich, metallic string tone (Javari)
    // We blend a fundamental with several harmonics, decaying them progressively faster.
    const harmonics = [1, 2, 3, 4, 5, 6, 7];
    const harmonicWeights = [1.0, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

    harmonics.forEach((h, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // We use a combination of triangle and sawtooth to get rich string dynamics
      osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
      
      const targetFreq = freq * h;
      osc.frequency.setValueAtTime(targetFreq, time);
      
      if (detuneCents !== 0) {
        osc.detune.setValueAtTime(detuneCents, time);
      }

      // Javari effect: add subtle low-frequency frequency modulation (vibrato)
      // to model the string grazing against the cotton thread on the bridge.
      if (index > 0) {
        const fm = this.ctx.createOscillator();
        const fmGain = this.ctx.createGain();
        fm.frequency.value = 6 + Math.random() * 4; // 6-10 Hz buzz
        fmGain.gain.value = targetFreq * 0.005; // very subtle frequency wobble
        
        fm.connect(fmGain);
        fmGain.connect(osc.frequency);
        fm.start(time);
        fm.stop(time + 4.5);
      }

      // Envelope for this harmonic: higher harmonics decay MUCH faster
      const decayTime = 4.0 / Math.pow(h, 0.8);
      oscGain.gain.setValueAtTime(harmonicWeights[index] * 0.15, time);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, time + decayTime);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(time);
      osc.stop(time + decayTime + 0.5);
    });

    // Subtly open and close lowpass filter on pluck
    filter.type = "lowpass";
    filter.Q.setValueAtTime(4, time);
    filter.frequency.setValueAtTime(freq * 12, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 2.0, time + 2.0);

    // Pluck amplitude envelope
    pluckGain.gain.setValueAtTime(0, time);
    pluckGain.gain.linearRampToValueAtTime(0.35, time + 0.08); // soft pluck attack
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, time + 4.5); // long decay resonance
  }
}
export const tanpura = new TanpuraSynth();
export default TanpuraSynth;
