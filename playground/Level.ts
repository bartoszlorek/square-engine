import {
  Animation,
  Collisions,
  Entity,
  Scene,
  TiledMapper,
  TiledSpriteSheet,
  Tilemap,
} from '../src';
import {Sprite, IResourceDictionary, Container} from 'pixi.js';
import {Addons, Events, PlayerTraits} from './types';
import {Entities} from './addons';
import {BorderLimit, FollowMouse} from './traits';
import {tilesets, demo01Map} from './assets';

// layers/makePlayer.ts
function makePlayer(spritesheet: TiledSpriteSheet) {
  return (tileid: number, x: number, y: number) => {
    const player = new Entity<Addons, PlayerTraits, Events>(
      new Sprite(spritesheet.getTextureById(tileid)),
      {
        followMouse: new FollowMouse(10),
        borderLimit: new BorderLimit(),
      }
    );

    player.x = x;
    player.y = y;
    player.width = 32;
    player.height = 32;
    player.name = 'player';
    return player;
  };
}

// layers/makeSimpleTiles.ts
function makeSimpleTiles(spritesheet: TiledSpriteSheet) {
  return (tileids: number[], columns: number, x: number, y: number) => {
    const map = new Tilemap<Addons, Events>(new Container(), tileids, columns);

    map.fill((tileid) => new Sprite(spritesheet.getTextureById(tileid)));
    map.setPosition(x, y);
    return map;
  };
}

export class Level extends Scene<Addons, Events> {
  constructor(resources: IResourceDictionary) {
    super(Container);

    this.registerAddons({
      animation: new Animation(),
      collisions: new Collisions(this),
      entities: new Entities(this),
    });

    const spritesheet = new TiledSpriteSheet(demo01Map, tilesets, resources);
    const mapper = new TiledMapper(demo01Map);

    const player = mapper.querySprite('player', makePlayer(spritesheet));
    const ground = mapper.queryAllTiles('ground', makeSimpleTiles(spritesheet));
    const boxes = mapper.queryAllTiles('boxes', makeSimpleTiles(spritesheet));
    const front = mapper.queryAllTiles('front', makeSimpleTiles(spritesheet));

    this.addChild(...ground, ...boxes, player, ...front);
    this.addon.animation.animate();
    this.addon.entities.addChild(player);
    this.addon.collisions.addStatic(player, ground, cb);
    // this.addon.collisions.addDynamic(player, enemy, cb);
  }
}

function cb() {
  return true;
}
