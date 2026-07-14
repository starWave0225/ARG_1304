import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sampleRate = 22050;
const duration = 18;
const outputDirectory = resolve("public/audio");
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

  if (track === "child") {
    const notes = [220, 247, 262, 247, 220, 196, 0, 196, 220, 247, 220, 0];
    const noteLength = duration / notes.length;
    let voicePhase = 0;
    for (let index = 0; index < samples.length; index += 1) {
      const time = index / sampleRate;
      const noteIndex = Math.min(notes.length - 1, Math.floor(time / noteLength));
      const frequency = notes[noteIndex];
      const localTime = time - noteIndex * noteLength;
      const attack = Math.min(1, localTime / 0.28);
      const release = Math.min(1, (noteLength - localTime) / 0.4);
      const envelope = Math.max(0, Math.sin(Math.PI * 0.5 * attack) * Math.sin(Math.PI * 0.5 * release));
      const vibrato = 1
        + 0.0035 * Math.sin(Math.PI * 2 * 4.8 * time)
        + 0.0012 * Math.sin(Math.PI * 2 * 0.57 * time);
      filteredNoise += 0.006 * (noise() * 2 - 1 - filteredNoise);

      if (frequency > 0) voicePhase += Math.PI * 2 * frequency * vibrato / sampleRate;
      const hum = 0.23 * Math.sin(voicePhase)
        + 0.028 * Math.sin(voicePhase * 2 + 0.22)
        + 0.007 * Math.sin(voicePhase * 3 + 0.6);
      const roomTone = filteredNoise * 0.0015;
      samples[index] = frequency === 0
        ? roomTone
        : envelope * (hum + filteredNoise * 0.0025) + roomTone;
    }
  }

  return normalize(samples);
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
for (const track of tracks) {
  const target = resolve(outputDirectory, `field-${track}.wav`);
  if (dirname(target) !== outputDirectory) throw new Error("Unexpected audio output path");
  await writeFile(target, encodeWav(createTrack(track)));
}
