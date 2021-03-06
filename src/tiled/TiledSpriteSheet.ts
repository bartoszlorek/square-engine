import {BaseTexture, Rectangle, Texture} from 'pixi.js';
import {ISpriteSheet, IResourceDictionary} from '../types';
import {ITiledMapJSON, ITiledTilesetDictionary} from './types';

interface SourceTileset {
  readonly baseTexture: BaseTexture;
  readonly columns: number;
  readonly tileSize: number;
  readonly firstGID: number;
  readonly lastGID: number;
}

export class TiledSpriteSheet<TResources extends IResourceDictionary<Texture>>
  implements ISpriteSheet<Texture> {
  protected cachedTextures: Map<number, Texture>;
  protected sourceTilesets: SourceTileset[];

  constructor(
    map: ITiledMapJSON,
    tilesets: ITiledTilesetDictionary,
    resources: TResources
  ) {
    this.cachedTextures = new Map();

    // format all tilesets of the given map to sources
    this.sourceTilesets = map.tilesets.map(mapTileset => {
      const name = mapTileset.source.replace('.json', '');

      if (tilesets[name] === undefined) {
        throw new Error(`The "${name}" is not defined tileset.`);
      }

      if (resources[name] === undefined) {
        throw new Error(`The "${name}" is not loaded resource.`);
      }

      return {
        baseTexture: resources[name].texture.baseTexture,
        columns: tilesets[name].columns,
        tileSize: tilesets[name].tilewidth,
        firstGID: mapTileset.firstgid,
        lastGID: mapTileset.firstgid + tilesets[name].tilecount - 1,
      };
    });
  }

  public getTexture(tileGID: number): Texture {
    if (this.cachedTextures.has(tileGID)) {
      return this.cachedTextures.get(tileGID) as Texture;
    }

    for (let i = 0; i < this.sourceTilesets.length; i++) {
      const tileset = this.sourceTilesets[i];

      if (tileset.firstGID <= tileGID && tileset.lastGID >= tileGID) {
        return this.getTextureFromTileset(tileGID, tileset);
      }
    }

    throw new Error(`missing texture with tileGID:${tileGID}`);
  }

  protected getTextureFromTileset(
    tileGID: number,
    tileset: SourceTileset
  ): Texture {
    const {baseTexture, columns, tileSize, firstGID} = tileset;

    const index = tileGID - firstGID;
    const col = index % columns;
    const row = Math.floor(index / columns);

    const rect = new Rectangle(
      col * tileSize,
      row * tileSize,
      tileSize,
      tileSize
    );

    const texture = new Texture(baseTexture, rect);
    this.cachedTextures.set(tileGID, texture);

    return texture;
  }

  public destroy() {
    this.cachedTextures.clear();
    this.sourceTilesets.length = 0;
  }
}
