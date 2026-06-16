// Chunky pixel-art sprites defined as a list of row strings plus a
// palette mapping each character to a color. Any character missing from
// the palette (e.g. '.') is treated as transparent.

export function makeSprite(map, palette) {
  return {
    map,
    palette,
    width: map[0].length,
    height: map.length,
  };
}

// Draws a sprite with its top-left corner at (x, y) in virtual pixels.
export function drawSprite(ctx, sprite, x, y) {
  const { map, palette } = sprite;
  for (let row = 0; row < map.length; row++) {
    const line = map[row];
    for (let col = 0; col < line.length; col++) {
      const color = palette[line[col]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col, y + row, 1, 1);
    }
  }
}
