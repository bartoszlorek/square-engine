import {ITiledTilesetDictionary, ITiledMapDictionary} from 'blob2d';

export const tilesets: ITiledTilesetDictionary = {
  sprites: require('./sprites.json'),
};

export const maps: ITiledMapDictionary = {
  demo_01: require('./demo-01.json'),
};
