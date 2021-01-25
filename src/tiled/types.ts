interface ITiledProperty {
  name: string;
  type: string;
  value: number | string | boolean;
}

export interface ITiledFiniteTileLayer {
  chunks?: void; // to discriminating unions
  data: number[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  properties?: ITiledProperty[];
  type: 'tilelayer';
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

export interface ITiledInfiniteTileLayer {
  data?: void; // to discriminating unions
  chunks: {
    data: number[];
    height: number;
    width: number;
    x: number;
    y: number;
  }[];
  height: number;
  id: number;
  name: string;
  opacity: number;
  properties?: ITiledProperty[];
  startx: number;
  starty: number;
  type: 'tilelayer';
  visible: boolean;
  width: number;
  x: number;
  y: number;
}

// unsupported layer
interface ITiledObjectLayer {
  type: 'objectgroup';
}

// unsupported layer
interface ITiledImageLayer {
  type: 'imagelayer';
}

// unsupported layer
interface ITiledGroupLayer {
  type: 'group';
}

export interface ITiledMapJSON {
  backgroundcolor: string;
  compressionlevel: number;
  editorsettings: {
    chunksize?: {
      height: number;
      width: number;
    };
    export: {
      format?: 'json';
      target?: string;
    };
  };
  height: number;
  infinite: boolean;
  layers: (
    | ITiledFiniteTileLayer
    | ITiledInfiniteTileLayer
    | ITiledObjectLayer
    | ITiledImageLayer
    | ITiledGroupLayer
  )[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
  properties?: ITiledProperty[];
  renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up';
  tiledversion: string;
  tileheight: number;
  tilesets: {
    firstgid: number;
    source: string;
  }[];
  tilewidth: number;
  type: 'map';
  version: number;
  width: number;
}

export interface ITiledTilesetJSON {
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  type: 'tileset';
  version: number;
}

export interface ITiledTilesetDictionary {
  [name: string]: ITiledTilesetJSON;
}
