import { makeSprite } from './sprite.js';

// Galaga-inspired player fighter: white hull, red wings, cyan cockpit.
// Original art — recognizably arcade without copying Namco's sprite.
const FIGHTER_PALETTE = {
  W: '#ffffff',
  R: '#ff3b3b',
  C: '#41d6ff',
};

export const PLAYER_SPRITE = makeSprite(
  [
    '......W......',
    '......W......',
    '.....WWW.....',
    '.....WWW.....',
    '.....WCW.....',
    '....WWWWW....',
    '..R.WWWWW.R..',
    '..R.WWWWW.R..',
    '.RRRWWWWWRRR.',
    '.RRRWWWWWRRR.',
    'RRRRWWWWWRRRR',
    'RRRRWWWWWRRRR',
    'R.RRWWWWWRR.R',
    '....WW.WW....',
    '...WW...WW...',
    '...W.....W...',
  ],
  FIGHTER_PALETTE
);

// Bee (zako): blue body, yellow wing tips, cyan antennae.
const BEE_PALETTE = {
  B: '#3b6cff',
  Y: '#ffd23f',
  C: '#41d6ff',
};

export const BEE_SPRITE = makeSprite(
  [
    '..C.....C..',
    '...C...C...',
    '....BBB....',
    '...BBBBB...',
    '.YBBBBBBBY.',
    'YYBBBBBBBYY',
    '.Y.BBBBB.Y.',
    '...B.B.B...',
    '..B..B..B..',
  ],
  BEE_PALETTE
);

// Butterfly (goei): red wings, white body core.
const BUTTERFLY_PALETTE = {
  R: '#ff3b3b',
  W: '#ffffff',
};

export const BUTTERFLY_SPRITE = makeSprite(
  [
    '.R.......R.',
    '..RR...RR..',
    '...WWWWW...',
    '..WRRRRRW..',
    '.RRRWWWRRR.',
    'RRRRWWWRRRR',
    '.RR.WWW.RR.',
    '...R.W.R...',
    '..R..R..R..',
  ],
  BUTTERFLY_PALETTE
);

// Boss Galaga: the larger, tougher enemy. Green by default; renders with
// the "hit" palette (blue) after taking its first of two hits.
const BOSS_MAP = [
  '..G.......G..',
  '...GG...GG...',
  '....GGGGG....',
  '...GWWWWWG...',
  '..GGWWWWWGG..',
  '.GGGGGGGGGGG.',
  'GGGGGGGGGGGGG',
  'GG.GGGGGGG.GG',
  '.GG.GGGGG.GG.',
  '..G..G.G..G..',
];

export const BOSS_SPRITE = makeSprite(BOSS_MAP, {
  G: '#3be86b',
  W: '#ffffff',
});

export const BOSS_HIT_SPRITE = makeSprite(BOSS_MAP, {
  G: '#41a6ff',
  W: '#ffffff',
});
