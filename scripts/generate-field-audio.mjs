import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sampleRate = 22050;
const backgroundBars = 8;
const backgroundTempo = 52;
const beatsPerBar = 4;
const backgroundDuration = backgroundBars * beatsPerBar * 60 / backgroundTempo;
const outputDirectory = resolve("public/audio");

// Field recordings and the system scores are curated licensed assets; this script regenerates the opening/ending music bed.

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
const backgroundTarget = resolve(outputDirectory, "background-sorrow.wav");
if (dirname(backgroundTarget) !== outputDirectory) throw new Error("Unexpected audio output path");
await writeFile(backgroundTarget, encodeWav(createBackgroundMusic()));
