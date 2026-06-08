/**
 * High-performance autocorrelation pitch detection with parabolic interpolation.
 */

export interface PitchMapping {
  frequency: number;
  cents: number;
  centsInOctave: number;
  swaraKey: string;     // e.g., "R2", "G3"
  swaraName: string;    // e.g., "Chathushruti Rishabham"
  centsDev: number;     // deviation from target swara pitch in cents (-50 to +50)
  octave: number;       // relative octave (0 = middle, 1 = upper, -1 = lower)
}

// Map swara keys to their relative cents values in the 12-tone scale
export const SWARA_CENTS_MAP: Record<string, number> = {
  S: 0,
  R1: 100,
  R2: 200,
  G1: 200,
  R3: 300,
  G2: 300,
  G3: 400,
  M1: 500,
  M2: 600,
  P: 700,
  D1: 800,
  D2: 900,
  N1: 900,
  D3: 1000,
  N2: 1000,
  N3: 1100,
  "S'": 1200,
};

// Map swara keys to human-readable Carnatic names
export const SWARA_NAMES_MAP: Record<string, string> = {
  S: "Shadjam (Sa)",
  R1: "Shuddha Rishabham (Ri1)",
  R2: "Chathushruti Rishabham (Ri2)",
  G1: "Shuddha Gandharam (Ga1)",
  R3: "Shatshruti Rishabham (Ri3)",
  G2: "Sadharana Gandharam (Ga2)",
  G3: "Antara Gandharam (Ga3)",
  M1: "Shuddha Madhyamam (Ma1)",
  M2: "Prati Madhyamam (Ma2)",
  P: "Panchamam (Pa)",
  D1: "Shuddha Dhaivatham (Dha1)",
  D2: "Chathushruti Dhaivatham (Dha2)",
  N1: "Shuddha Nishadham (Ni1)",
  D3: "Shatshruti Dhaivatham (Dha3)",
  N2: "Kaisiki Nishadham (Ni2)",
  N3: "Kakali Nishadham (Ni3)",
  "S'": "Tara Shadjam (Sa')",
};

/**
 * Detects the fundamental frequency (f0) of a buffer of audio samples using Autocorrelation.
 * @param buffer Time-domain audio buffer (Float32Array)
 * @param sampleRate Audio sampling rate in Hz
 * @param silenceThreshold Minimum RMS amplitude to process audio
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  silenceThreshold = 0.008
): number {
  // 1. Calculate Root Mean Square (RMS) to threshold signal presence
  let sumSquare = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquare += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquare / buffer.length);
  if (rms < silenceThreshold) {
    return -1; // Silent or unvoiced frame
  }

  // 2. Define search range (human vocal range for Carnatic singing is roughly 50 Hz to 1200 Hz)
  const minFreq = 50;
  const maxFreq = 1200;
  const maxLag = Math.ceil(sampleRate / minFreq); // e.g., 44100 / 50 = 882
  const minLag = Math.floor(sampleRate / maxFreq); // e.g., 44100 / 1200 = 36

  const size = buffer.length;
  const r = new Float32Array(maxLag + 1);

  // 3. Compute autocorrelation for relevant lags
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    const limit = size - lag;
    for (let i = 0; i < limit; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    r[lag] = sum;
  }

  // 4. Find the first peak after the initial zero-lag energy drop
  // We locate where autocorrelation drops below zero or reaches a local minimum.
  let searchStartIndex = minLag;
  for (let i = 1; i < maxLag; i++) {
    if (r[i] < 0 || (r[i] < r[i - 1] && r[i] < r[i + 1])) {
      searchStartIndex = Math.max(minLag, i);
      break;
    }
  }

  let bestLag = -1;
  let maxVal = -1;

  for (let lag = searchStartIndex; lag <= maxLag; lag++) {
    // Check if it's a local maximum
    if (r[lag] > r[lag - 1] && r[lag] > r[lag + 1]) {
      if (r[lag] > maxVal) {
        maxVal = r[lag];
        bestLag = lag;
      }
    }
  }

  // 5. Apply parabolic interpolation for sub-Hertz accuracy
  if (bestLag !== -1 && bestLag > 0 && bestLag < maxLag) {
    const alpha = r[bestLag - 1];
    const beta = r[bestLag];
    const gamma = r[bestLag + 1];

    const denom = alpha - 2 * beta + gamma;
    if (Math.abs(denom) > 1e-5) {
      const p = (alpha - gamma) / (2 * denom);
      const exactLag = bestLag + p;
      return sampleRate / exactLag;
    }
    return sampleRate / bestLag;
  }

  return -1;
}

/**
 * Maps a frequency in Hz to a detailed pitch profile based on the tonic frequency.
 * @param frequency Sung frequency in Hz
 * @param tonicFrequency Calibrated tonic 'Sa' frequency in Hz
 * @param allowedSwaras List of allowed swara keys in the current raga (e.g. ["S", "R2", "G3", "P", "D2", "S'"])
 */
export function mapFrequencyToSwara(
  frequency: number,
  tonicFrequency: number,
  allowedSwaras: string[] = []
): PitchMapping | null {
  if (frequency <= 0 || tonicFrequency <= 0) return null;

  // 1. Calculate relative cents from the tonic
  const cents = 1200 * Math.log2(frequency / tonicFrequency);
  const octave = Math.floor(cents / 1200);
  const centsInOctave = ((cents % 1200) + 1200) % 1200;

  // 2. Determine search set (either raga-specific or all 12 semitones)
  const searchSwaras =
    allowedSwaras.length > 0
      ? allowedSwaras
      : ["S", "R1", "R2", "G2", "G3", "M1", "M2", "P", "D1", "D2", "N2", "N3", "S'"];

  let bestSwara = "S";
  let minDiff = 9999;

  for (const swara of searchSwaras) {
    const targetCents = SWARA_CENTS_MAP[swara];
    if (targetCents === undefined) continue;

    let diff = centsInOctave - targetCents;
    // Handle wrap-around for octaves (e.g. comparing 1150 cents to 0 cents / S)
    if (diff > 600) diff -= 1200;
    if (diff < -600) diff += 1200;

    if (Math.abs(diff) < Math.abs(minDiff)) {
      minDiff = diff;
      bestSwara = swara;
    }
  }

  // Handle upper octave edge case (if mapped to S' or S with +1 octave)
  let finalSwara = bestSwara;
  let finalOctave = octave;
  if (finalSwara === "S'") {
    finalSwara = "S";
    finalOctave += 1;
  }

  return {
    frequency,
    cents,
    centsInOctave,
    swaraKey: finalSwara,
    swaraName: SWARA_NAMES_MAP[finalSwara] || finalSwara,
    centsDev: minDiff,
    octave: finalOctave,
  };
}
