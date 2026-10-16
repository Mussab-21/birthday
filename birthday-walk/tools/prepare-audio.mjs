import ffmpegPath from 'ffmpeg-static';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const voiceSrc = path.resolve('../voice');
const publicAudio = path.resolve('./public/audio');
const srcAudio = path.resolve('./src/assets/audio');

fs.mkdirSync(publicAudio, { recursive: true });
fs.mkdirSync(srcAudio, { recursive: true });

for (let i = 1; i <= 5; i++) {
  const oggName = `conv-0${i}.ogg`;
  const inOgg = path.join(voiceSrc, oggName);
  
  if (!fs.existsSync(inOgg)) {
    console.error('File not found:', inOgg);
    continue;
  }
  
  const tempMp3 = path.join(voiceSrc, `temp-0${i}.mp3`);
  execFileSync(ffmpegPath, ['-y', '-i', inOgg, '-codec:a', 'libmp3lame', '-b:a', '128k', tempMp3]);
  
  for (const dir of [publicAudio, srcAudio]) {
    fs.copyFileSync(inOgg, path.join(dir, `conv-0${i}.ogg`));
    fs.copyFileSync(inOgg, path.join(dir, `voice-0${i}.ogg`));
    fs.copyFileSync(tempMp3, path.join(dir, `conv-0${i}.mp3`));
    fs.copyFileSync(tempMp3, path.join(dir, `voice-0${i}.mp3`));
  }
  if (fs.existsSync(tempMp3)) {
    fs.unlinkSync(tempMp3);
  }
  console.log(`Processed scene ${i} audio successfully!`);
}
console.log('All audio processing complete!');
