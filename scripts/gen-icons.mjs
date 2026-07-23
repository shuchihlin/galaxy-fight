// One-off generator for public/icons/*.png — renders the player sprite
// (src/sprites.js) onto a solid background using a hand-rolled PNG encoder
// (zlib is Node's built-in) so icon generation needs no new dependency.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PLAYER_SPRITE } from '../src/sprites.js';
import { COLORS } from '../src/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function renderIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const [bgR, bgG, bgB] = hexToRgb(COLORS.bg);
  for (let i = 0; i < size * size; i++) {
    rgba[i * 4] = bgR;
    rgba[i * 4 + 1] = bgG;
    rgba[i * 4 + 2] = bgB;
    rgba[i * 4 + 3] = 255;
  }

  const { map, palette, width: sw, height: sh } = PLAYER_SPRITE;
  const scale = Math.max(1, Math.floor((size * 0.75) / sh));
  const drawW = sw * scale;
  const drawH = sh * scale;
  const offX = Math.round((size - drawW) / 2);
  const offY = Math.round((size - drawH) / 2);

  for (let row = 0; row < sh; row++) {
    const line = map[row];
    for (let col = 0; col < sw; col++) {
      const hex = palette[line[col]];
      if (!hex) continue;
      const [r, g, b] = hexToRgb(hex);
      for (let dy = 0; dy < scale; dy++) {
        const py = offY + row * scale + dy;
        if (py < 0 || py >= size) continue;
        for (let dx = 0; dx < scale; dx++) {
          const px = offX + col * scale + dx;
          if (px < 0 || px >= size) continue;
          const idx = (py * size + px) * 4;
          rgba[idx] = r;
          rgba[idx + 1] = g;
          rgba[idx + 2] = b;
          rgba[idx + 3] = 255;
        }
      }
    }
  }

  return encodePNG(size, size, rgba);
}

for (const size of [512, 192, 180, 32]) {
  const png = renderIcon(size);
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}
