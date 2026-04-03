import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });

const src = './src/assets/logo.png';
const sizes = [72, 96, 128, 192, 512];

for (const size of sizes) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: '#f4ede0' })
    .png()
    .toFile('./public/icons/icon-' + size + '.png');
  console.log('done: icon-' + size + '.png');
}

await sharp(src)
  .resize(340, 340, { fit: 'contain', background: '#f4ede0' })
  .extend({ top: 86, bottom: 86, left: 86, right: 86, background: '#f4ede0' })
  .resize(512, 512)
  .png()
  .toFile('./public/icons/icon-512-maskable.png');

console.log('done: icon-512-maskable.png');
console.log('All icons generated!');
