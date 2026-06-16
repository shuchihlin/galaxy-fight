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
