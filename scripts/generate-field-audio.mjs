import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sampleRate = 22050;
const duration = 18;
const backgroundBars = 8;
const backgroundTempo = 52;
const beatsPerBar = 4;
const backgroundDuration = backgroundBars * beatsPerBar * 60 / backgroundTempo;
const systemBackgroundBars = 8;
const systemBackgroundTempo = 48;
const systemBackgroundDuration = systemBackgroundBars * beatsPerBar * 60 / systemBackgroundTempo;
const horrorBackgroundBars = 10;
const horrorBackgroundTempo = 76;
const horrorBackgroundDuration = horrorBackgroundBars * beatsPerBar * 60 / horrorBackgroundTempo;
const outputDirectory = resolve("public/audio");
const childVoiceSourcePath = resolve(outputDirectory, "field-child-voice-source.wav");
const tracks = ["pipe", "tv", "bath", "child"];

function createSeededNoise(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function normalize(samples, target = 0.82) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak === 0) return samples;
  const scale = target / peak;
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.tanh(samples[index] * scale);
  return samples;
}

function decodeMonoPcm16Wav(buffer) {
  if (buffer.subarray(0, 4).toString() !== "RIFF" || buffer.subarray(8, 12).toString() !== "WAVE") {
    throw new Error("Child voice source must be a WAV file");
  }

  let format = null;
  let dataOffset = -1;
  let dataSize = 0;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const chunkId = buffer.subarray(offset, offset + 4).toString();
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      format = {
        encoding: buffer.readUInt16LE(chunkStart),
        channels: buffer.readUInt16LE(chunkStart + 2),
        rate: buffer.readUInt32LE(chunkStart + 4),
        bits: buffer.readUInt16LE(chunkStart + 14),
      };
    }
    if (chunkId === "data") {
      dataOffset = chunkStart;
      dataSize = Math.min(chunkSize, buffer.length - chunkStart);
      break;
    }
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!format || format.encoding !== 1 || format.channels !== 1 || format.rate !== sampleRate || format.bits !== 16 || dataOffset < 0) {
    throw new Error(`Child voice source must be mono PCM16 at ${sampleRate} Hz`);
  }

  const samples = new Float32Array(Math.floor(dataSize / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = buffer.readInt16LE(dataOffset + index * 2) / 32768;
  }
  return samples;
}

const childHummingTempo = 80;
const childHummingLeadIn = 0.72;
const littleWhiteBoatMotif = [
  { beat: 0, beats: 2, note: 66 }, { beat: 2, beats: 1, note: 66 },
  { beat: 3, beats: 2, note: 66 }, { beat: 5, beats: 1, note: 64 },
  { beat: 6, beats: 2, note: 66 }, { beat: 8, beats: 1, note: 71 },
  { beat: 9, beats: 3, note: 69 },
  { beat: 12, beats: 2, note: 66 }, { beat: 14, beats: 1, note: 64 },
  { beat: 15, beats: 2, note: 66 }, { beat: 17, beats: 1, note: 71 },
  { beat: 18, beats: 3, note: 69 },
];

function createChildVoiceTrack(voiceSamples) {
  const samples = new Float32Array(sampleRate * duration);
  const dryVoice = new Float32Array(samples.length);
  const noise = createSeededNoise(811);
  const beatDuration = 60 / childHummingTempo;
  let roomTone = 0;

  for (let index = 0; index < samples.length; index += 1) {
    roomTone += 0.003 * (noise() * 2 - 1 - roomTone);
    samples[index] = roomTone * 0.0009;
  }

  littleWhiteBoatMotif.forEach((event, noteIndex) => {
    const start = childHummingLeadIn + event.beat * beatDuration;
    const noteDuration = event.beats * beatDuration - 0.045;
    const startIndex = Math.round(start * sampleRate);
    const noteSamples = Math.round(noteDuration * sampleRate);
    const frequency = midiToFrequency(event.note);
    let phase = noteIndex * 0.37;
    let sourceEnvelope = 0;

    for (let offset = 0; offset < noteSamples && startIndex + offset < dryVoice.length; offset += 1) {
      const age = offset / sampleRate;
      const remaining = noteDuration - age;
      const attack = Math.min(1, age / 0.075);
      const release = Math.min(1, remaining / (event.beats >= 3 ? 0.42 : 0.19));
      const envelope = Math.sin(Math.PI * 0.5 * attack) * Math.sin(Math.PI * 0.5 * release);
      const sourceIndex = (offset + Math.round(noteIndex * sampleRate * 0.31)) % voiceSamples.length;
      sourceEnvelope += 0.014 * (Math.abs(voiceSamples[sourceIndex]) - sourceEnvelope);
      const humanPulse = 0.86 + Math.min(0.14, sourceEnvelope * 1.8);
      const vibratoSemitones = 0.075 * Math.sin(Math.PI * 2 * 5.15 * age + noteIndex * 0.43)
        + 0.025 * Math.sin(Math.PI * 2 * 2.1 * age);
      phase += Math.PI * 2 * frequency * 2 ** (vibratoSemitones / 12) / sampleRate;
      const hum = Math.sin(phase) + 0.24 * Math.sin(phase * 2 + 0.18) + 0.075 * Math.sin(phase * 3 + 0.62);
      const breath = (noise() * 2 - 1) * (0.013 + 0.026 * Math.exp(-age * 7.5));
      dryVoice[startIndex + offset] += (hum * 0.49 * humanPulse + breath) * envelope;
    }
  });

  const reflections = [
    { delay: 0, gain: 1 },
    { delay: 0.094, gain: 0.13 },
    { delay: 0.217, gain: 0.065 },
  ];
  for (const reflection of reflections) {
    const delaySamples = Math.round(reflection.delay * sampleRate);
    for (let index = delaySamples; index < samples.length; index += 1) {
      samples[index] += dryVoice[index - delaySamples] * reflection.gain;
    }
  }

  return normalize(samples, 0.74);
}

function createTrack(track) {
  const samples = new Float32Array(sampleRate * duration);
  const noise = createSeededNoise(track === "pipe" ? 71 : track === "tv" ? 203 : track === "bath" ? 419 : 811);
  let filteredNoise = 0;

  if (track === "pipe") {
    for (let index = 0; index < samples.length; index += 1) {
      const time = index / sampleRate;
      filteredNoise += 0.008 * (noise() * 2 - 1 - filteredNoise);
      const impactAge = (time + 0.35) % 3.05;
      const impact = impactAge < 0.48
        ? Math.exp(-impactAge * 9) * (Math.sin(Math.PI * 2 * 174 * time) + 0.55 * Math.sin(Math.PI * 2 * 262 * time))
        : 0;
      samples[index] = 0.12 * Math.sin(Math.PI * 2 * 54 * time)
        + 0.07 * Math.sin(Math.PI * 2 * 83 * time + 0.7)
        + 0.2 * filteredNoise
        + 0.13 * impact;
    }
  }

  if (track === "tv") {
    for (let index = 0; index < samples.length; index += 1) {
      const time = index / sampleRate;
      filteredNoise += 0.025 * (noise() * 2 - 1 - filteredNoise);
      const phrase = Math.max(0, Math.sin(Math.PI * 2 * 1.72 * time + 0.4 * Math.sin(time * 0.7)));
      const syllable = phrase * phrase * (0.58 + 0.42 * Math.sin(Math.PI * 2 * 4.1 * time) ** 2);
      const pitch = 108 + 17 * Math.sin(time * 0.91) + 8 * Math.sin(time * 2.17);
      const voice = Math.sin(Math.PI * 2 * pitch * time)
        + 0.48 * Math.sin(Math.PI * 2 * pitch * 2 * time)
        + 0.2 * Math.sin(Math.PI * 2 * pitch * 3 * time);
      samples[index] = syllable * (0.13 * voice + 0.055 * filteredNoise) + 0.018 * filteredNoise;
    }
  }

  if (track === "bath") {
    for (let index = 0; index < samples.length; index += 1) {
      const time = index / sampleRate;
      filteredNoise += 0.004 * (noise() * 2 - 1 - filteredNoise);
      samples[index] = filteredNoise * 0.018 + Math.sin(Math.PI * 2 * 72 * time) * 0.006;
    }
    const dropTimes = [0.62, 2.06, 3.54, 4.94, 6.48, 7.89, 9.43, 10.87, 12.37, 13.82, 15.3, 16.72];
    for (const start of dropTimes) {
      const dropDuration = Math.floor(sampleRate * 0.52);
      for (let offset = 0; offset < dropDuration; offset += 1) {
        const age = offset / sampleRate;
        const envelope = Math.exp(-age * 13);
        const phase = Math.PI * 2 * (930 * age - 310 * age * age);
        const sample = envelope * (Math.sin(phase) + 0.32 * Math.sin(phase * 1.83));
        const dryIndex = Math.floor(start * sampleRate) + offset;
        const echoIndex = dryIndex + Math.floor(sampleRate * 0.112);
        if (dryIndex < samples.length) samples[dryIndex] += sample * 0.42;
        if (echoIndex < samples.length) samples[echoIndex] += sample * 0.16;
      }
    }
  }

  return normalize(samples);
}

function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function addBackgroundTone(samples, start, toneDuration, note, amplitude, options = {}) {
  const attack = options.attack ?? 0.08;
  const release = options.release ?? 0.9;
  const overtone = options.overtone ?? 0.22;
  const frequency = midiToFrequency(note);
  const startIndex = Math.round(start * sampleRate);
  const toneSamples = Math.round(toneDuration * sampleRate);

  for (let offset = 0; offset < toneSamples; offset += 1) {
    const age = offset / sampleRate;
    const remaining = toneDuration - age;
    const envelope = Math.min(1, age / attack) * Math.min(1, remaining / release);
    if (envelope <= 0) continue;
    const phase = Math.PI * 2 * frequency * age;
    const tone = Math.sin(phase)
      + overtone * Math.sin(phase * 2 + 0.18)
      + overtone * 0.26 * Math.sin(phase * 3 + 0.47);
    const index = (startIndex + offset) % samples.length;
    samples[index] += tone * envelope * amplitude;
  }
}

function createBackgroundMusic() {
  const samples = new Float32Array(Math.round(sampleRate * backgroundDuration));
  const noise = createSeededNoise(1404);
  const beatDuration = 60 / backgroundTempo;
  const barDuration = beatDuration * beatsPerBar;
  const roots = [38, 34, 41, 36, 38, 43, 34, 45];
  const chords = [
    [50, 53, 57, 62],
    [46, 50, 53, 58],
    [41, 45, 48, 53],
    [48, 52, 55, 60],
    [50, 53, 57, 62],
    [43, 46, 50, 55],
    [46, 50, 53, 58],
    [45, 49, 52, 57],
  ];
  const melody = [
    [62, 57],
    [65, 62],
    [69, 67],
    [64, 67],
    [65, 64],
    [62, 58],
    [60, 62],
    [61, 57],
  ];

  let roomTone = 0;
  for (let index = 0; index < samples.length; index += 1) {
    roomTone += 0.0015 * (noise() * 2 - 1 - roomTone);
    const time = index / sampleRate;
    samples[index] = roomTone * 0.012
      + 0.003 * Math.sin(Math.PI * 2 * 31 * time)
      + 0.002 * Math.sin(Math.PI * 2 * 47 * time + 0.8);
  }

  for (let bar = 0; bar < backgroundBars; bar += 1) {
    const start = bar * barDuration;
    const root = roots[bar];
    addBackgroundTone(samples, start, barDuration + 1.2, root, 0.12, { attack: 1.15, release: 1.45, overtone: 0.12 });
    addBackgroundTone(samples, start + 0.14, barDuration, root + 7, 0.048, { attack: 1.6, release: 1.8, overtone: 0.08 });

    for (const note of chords[bar]) {
      addBackgroundTone(samples, start + 0.08, beatDuration * 2.8, note, 0.044, { release: 2.15, overtone: 0.28 });
      addBackgroundTone(samples, start + beatDuration * 2.06, beatDuration * 1.75, note, 0.024, { attack: 0.16, release: 1.35, overtone: 0.18 });
    }

    addBackgroundTone(samples, start + beatDuration * 0.92, beatDuration * 1.72, melody[bar][0], 0.052, { attack: 0.34, release: 0.96, overtone: 0.13 });
    addBackgroundTone(samples, start + beatDuration * 2.92, beatDuration * 1.72, melody[bar][1], 0.045, { attack: 0.36, release: 1.05, overtone: 0.1 });
  }

  const dry = samples.slice();
  const echoes = [
    { delay: 0.31, level: 0.16 },
    { delay: 0.73, level: 0.09 },
    { delay: 1.37, level: 0.045 },
  ];
  for (const { delay, level } of echoes) {
    const delaySamples = Math.round(delay * sampleRate);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] += dry[(index - delaySamples + samples.length) % samples.length] * level;
    }
  }

  const seamSamples = Math.round(sampleRate * 0.9);
  for (let offset = 0; offset < seamSamples; offset += 1) {
    const mix = (offset + 1) / seamSamples;
    const endIndex = samples.length - seamSamples + offset;
    samples[endIndex] = samples[endIndex] * (1 - mix) + samples[offset] * mix;
  }
  samples[samples.length - 1] = samples[0];

  return normalize(samples, 0.72);
}

function addReverseBell(samples, start, note, amplitude) {
  const toneDuration = 4.6;
  const frequency = midiToFrequency(note);
  const startIndex = Math.round(start * sampleRate);
  const toneSamples = Math.round(toneDuration * sampleRate);

  for (let offset = 0; offset < toneSamples; offset += 1) {
    const age = offset / sampleRate;
    const attack = Math.min(1, age / 3.35) ** 2;
    const release = Math.min(1, (toneDuration - age) / 0.42);
    const phase = Math.PI * 2 * frequency * age;
    const tone = Math.sin(phase)
      + 0.27 * Math.sin(phase * 2.01 + 0.36)
      + 0.08 * Math.sin(phase * 4.03 + 0.82);
    const index = (startIndex + offset) % samples.length;
    samples[index] += tone * attack * release * amplitude;
  }
}

function createSystemBackgroundMusic() {
  const samples = new Float32Array(Math.round(sampleRate * systemBackgroundDuration));
  const noise = createSeededNoise(713);
  const beatDuration = 60 / systemBackgroundTempo;
  const barDuration = beatDuration * beatsPerBar;
  const roots = [38, 38, 36, 38, 41, 38, 36, 37];
  const upperIntervals = [7, 7, 7, 6, 7, 6, 7, 6];
  const pulsePatterns = [
    [0, 1, 3],
    [0, 2],
    [0, 1, 3],
    [0, 3],
    [0, 1, 2],
    [0, 2, 3],
    [0, 1],
    [0, 3],
  ];

  let roomTone = 0;
  for (let index = 0; index < samples.length; index += 1) {
    roomTone += 0.0009 * (noise() * 2 - 1 - roomTone);
    const time = index / sampleRate;
    const ventilation = 0.5 + 0.5 * Math.sin(Math.PI * 2 * 0.041 * time + 0.7);
    samples[index] = roomTone * (0.007 + ventilation * 0.003)
      + 0.0028 * Math.sin(Math.PI * 2 * 29 * time)
      + 0.0018 * Math.sin(Math.PI * 2 * 43 * time + 1.1);
  }

  for (let bar = 0; bar < systemBackgroundBars; bar += 1) {
    const start = bar * barDuration;
    const root = roots[bar];
    addBackgroundTone(samples, start, barDuration + 1.7, root, 0.078, { attack: 2.1, release: 2.25, overtone: 0.07 });
    addBackgroundTone(samples, start + 0.21, barDuration, root + upperIntervals[bar], 0.026, { attack: 2.65, release: 2.4, overtone: 0.05 });
    addBackgroundTone(samples, start + beatDuration * 0.18, beatDuration * 3.15, root + 12, 0.015, { attack: 1.7, release: 1.9, overtone: 0.08 });

    for (const beat of pulsePatterns[bar]) {
      addBackgroundTone(samples, start + beat * beatDuration, beatDuration * 0.48, root - 12, 0.018, { attack: 0.13, release: 0.44, overtone: 0.04 });
    }

    if ([2, 5, 7].includes(bar)) {
      const tensionStart = start + beatDuration * 2.52;
      const tensionNote = root + 23;
      addBackgroundTone(samples, tensionStart, beatDuration * 1.36, tensionNote, 0.011, { attack: 0.72, release: 1.18, overtone: 0.05 });
      addBackgroundTone(samples, tensionStart + 0.08, beatDuration * 1.24, tensionNote + 1, 0.009, { attack: 0.84, release: 1.04, overtone: 0.03 });
    }
  }

  addReverseBell(samples, barDuration * 1 + beatDuration * 2.8, 74, 0.012);
  addReverseBell(samples, barDuration * 4 + beatDuration * 3.12, 73, 0.011);
  addReverseBell(samples, barDuration * 7 + beatDuration * 2.72, 70, 0.009);

  const dry = samples.slice();
  for (const { delay, level } of [{ delay: 0.47, level: 0.11 }, { delay: 1.13, level: 0.055 }, { delay: 2.41, level: 0.025 }]) {
    const delaySamples = Math.round(delay * sampleRate);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] += dry[(index - delaySamples + samples.length) % samples.length] * level;
    }
  }

  const seamSamples = Math.round(sampleRate * 1.35);
  for (let offset = 0; offset < seamSamples; offset += 1) {
    const mix = (offset + 1) / seamSamples;
    const endIndex = samples.length - seamSamples + offset;
    samples[endIndex] = samples[endIndex] * (1 - mix) + samples[offset] * mix;
  }
  samples[samples.length - 1] = samples[0];

  return normalize(samples, 0.56);
}

function addMetallicStrike(samples, start, amplitude, seed) {
  const strikeDuration = 2.4;
  const startIndex = Math.round(start * sampleRate);
  const strikeSamples = Math.round(strikeDuration * sampleRate);
  const noise = createSeededNoise(seed);
  let filteredNoise = 0;

  for (let offset = 0; offset < strikeSamples; offset += 1) {
    const age = offset / sampleRate;
    const envelope = Math.exp(-age * 2.35);
    filteredNoise += 0.12 * (noise() * 2 - 1 - filteredNoise);
    const metal = Math.sin(Math.PI * 2 * 173 * age)
      + 0.71 * Math.sin(Math.PI * 2 * 281.7 * age + 0.4)
      + 0.38 * Math.sin(Math.PI * 2 * 619.3 * age + 1.1);
    const index = (startIndex + offset) % samples.length;
    samples[index] += (metal * 0.72 + filteredNoise * 0.28) * envelope * amplitude;
  }
}

function addNoiseRiser(samples, start, riserDuration, amplitude, seed) {
  const startIndex = Math.round(start * sampleRate);
  const riserSamples = Math.round(riserDuration * sampleRate);
  const noise = createSeededNoise(seed);
  let filteredNoise = 0;
  let phase = 0;

  for (let offset = 0; offset < riserSamples; offset += 1) {
    const age = offset / sampleRate;
    const progress = age / riserDuration;
    const envelope = progress ** 2 * Math.min(1, (riserDuration - age) / 0.12);
    filteredNoise += (0.018 + progress * 0.08) * (noise() * 2 - 1 - filteredNoise);
    phase += Math.PI * 2 * (82 + progress ** 2 * 270) / sampleRate;
    const index = (startIndex + offset) % samples.length;
    samples[index] += (filteredNoise * 0.62 + Math.sin(phase) * 0.38) * envelope * amplitude;
  }
}

function createHorrorBackgroundMusic() {
  const samples = new Float32Array(Math.round(sampleRate * horrorBackgroundDuration));
  const noise = createSeededNoise(11044217);
  const beatDuration = 60 / horrorBackgroundTempo;
  const barDuration = beatDuration * beatsPerBar;
  const roots = [30, 30, 31, 27, 30, 29, 31, 26, 30, 29];
  const pulsePatterns = [
    [0, 0.46, 2.14],
    [0, 0.42, 2.72],
    [0, 0.48, 1.86, 3.15],
    [0, 0.39, 2.48],
    [0, 0.45, 1.63, 3.08],
    [0, 0.37, 2.29],
    [0, 0.49, 1.42, 2.93],
    [0, 0.35, 2.57],
    [0, 0.44, 1.71, 3.2],
    [0, 0.33, 1.24, 2.18, 3.06],
  ];

  let roomTone = 0;
  for (let index = 0; index < samples.length; index += 1) {
    roomTone += 0.0024 * (noise() * 2 - 1 - roomTone);
    const time = index / sampleRate;
    const pressure = 0.62 + 0.38 * Math.sin(Math.PI * 2 * 0.083 * time + 0.3);
    samples[index] = roomTone * (0.012 + pressure * 0.009)
      + 0.006 * Math.sin(Math.PI * 2 * 27 * time)
      + 0.0038 * Math.sin(Math.PI * 2 * 40.5 * time + 0.8);
  }

  for (let bar = 0; bar < horrorBackgroundBars; bar += 1) {
    const start = bar * barDuration;
    const root = roots[bar];
    addBackgroundTone(samples, start, barDuration + 0.8, root, 0.095, { attack: 0.72, release: 1.1, overtone: 0.16 });
    addBackgroundTone(samples, start + beatDuration * 0.12, barDuration * 0.92, root + 18, 0.024, { attack: 1.45, release: 1.2, overtone: 0.28 });
    addBackgroundTone(samples, start + beatDuration * 1.52, beatDuration * 2.15, root + 13, 0.018, { attack: 0.84, release: 1.15, overtone: 0.21 });

    for (const beat of pulsePatterns[bar]) {
      addBackgroundTone(samples, start + beat * beatDuration, beatDuration * 0.31, root - 12, 0.062, { attack: 0.018, release: 0.23, overtone: 0.05 });
      addBackgroundTone(samples, start + beat * beatDuration + 0.035, beatDuration * 0.16, root + 12, 0.018, { attack: 0.012, release: 0.11, overtone: 0.12 });
    }
  }

  addNoiseRiser(samples, barDuration * 1.2, barDuration * 1.55, 0.052, 71);
  addNoiseRiser(samples, barDuration * 5.4, barDuration * 1.9, 0.061, 404);
  addNoiseRiser(samples, barDuration * 8.25, barDuration * 1.55, 0.067, 713);
  addMetallicStrike(samples, barDuration * 2.76, 0.078, 1304);
  addMetallicStrike(samples, barDuration * 7.31, 0.085, 1404);
  addMetallicStrike(samples, barDuration * 9.78, 0.071, 602);

  const dry = samples.slice();
  for (const { delay, level } of [{ delay: 0.17, level: 0.15 }, { delay: 0.39, level: 0.09 }, { delay: 0.91, level: 0.04 }]) {
    const delaySamples = Math.round(delay * sampleRate);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] += dry[(index - delaySamples + samples.length) % samples.length] * level;
    }
  }

  const seamSamples = Math.round(sampleRate * 0.72);
  for (let offset = 0; offset < seamSamples; offset += 1) {
    const mix = (offset + 1) / seamSamples;
    const endIndex = samples.length - seamSamples + offset;
    samples[endIndex] = samples[endIndex] * (1 - mix) + samples[offset] * mix;
  }
  samples[samples.length - 1] = samples[0];

  return normalize(samples, 0.68);
}

function encodeWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(sample * (sample < 0 ? 32768 : 32767)), 44 + index * 2);
  }
  return buffer;
}

await mkdir(outputDirectory, { recursive: true });
if (dirname(childVoiceSourcePath) !== outputDirectory) throw new Error("Unexpected child voice source path");
const childVoiceSamples = decodeMonoPcm16Wav(await readFile(childVoiceSourcePath));
for (const track of tracks) {
  const target = resolve(outputDirectory, `field-${track}.wav`);
  if (dirname(target) !== outputDirectory) throw new Error("Unexpected audio output path");
  await writeFile(target, encodeWav(track === "child" ? createChildVoiceTrack(childVoiceSamples) : createTrack(track)));
}

const backgroundTarget = resolve(outputDirectory, "background-sorrow.wav");
if (dirname(backgroundTarget) !== outputDirectory) throw new Error("Unexpected audio output path");
await writeFile(backgroundTarget, encodeWav(createBackgroundMusic()));

const systemBackgroundTarget = resolve(outputDirectory, "background-system-uncanny.wav");
if (dirname(systemBackgroundTarget) !== outputDirectory) throw new Error("Unexpected audio output path");
await writeFile(systemBackgroundTarget, encodeWav(createSystemBackgroundMusic()));

const horrorBackgroundTarget = resolve(outputDirectory, "background-horror-alert.wav");
if (dirname(horrorBackgroundTarget) !== outputDirectory) throw new Error("Unexpected audio output path");
await writeFile(horrorBackgroundTarget, encodeWav(createHorrorBackgroundMusic()));
