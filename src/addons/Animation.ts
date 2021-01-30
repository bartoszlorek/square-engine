import {ISprite} from '../_pixijs';
import {IAddon, IKeyframesDictionary} from '../_types';
import {TiledSpriteSheet} from '../tiled';
import {Scene} from '../Scene';

type TCachedFrames<TKeys extends string> = {[K in TKeys]: number};

const DELTA_TIME_PER_FRAME = 1 / 12;

export class Animation<
  TAddons extends {},
  TEvents extends string,
  TKeys extends string
> implements IAddon {
  public readonly deltaTimePerFrame: number;
  public readonly playing: Map<ISprite, TKeys>;
  public spritesheet: TiledSpriteSheet;
  public keyframes: IKeyframesDictionary<TKeys>;

  private accumulatedTime: number;
  private _requests: Map<ISprite, TKeys>;
  private _cachedFrames: Map<ISprite, TCachedFrames<TKeys>>;

  constructor(
    scene: Scene<TAddons, TEvents>,
    spritesheet: TiledSpriteSheet,
    keyframes: IKeyframesDictionary<TKeys>,
    deltaTimePerFrame: number = DELTA_TIME_PER_FRAME
  ) {
    this.spritesheet = spritesheet;
    this.keyframes = keyframes;
    this.playing = new Map();

    // animation may run at a different speed than app
    this.deltaTimePerFrame = deltaTimePerFrame;
    this.accumulatedTime = 0;

    // processing
    this._requests = new Map();
    this._cachedFrames = new Map();

    scene.on('scene/removeChild', (child) => {
      this.removeAnimatedSprite(child);
    });
  }

  public play(name: TKeys, sprite: ISprite) {
    this.playing.set(sprite, name);
  }

  public pause(sprite: ISprite) {
    this.playing.delete(sprite);
  }

  public update(deltaTime: number) {
    this.accumulatedTime += deltaTime;

    if (this.accumulatedTime >= this.deltaTimePerFrame) {
      this.addPlayRequests();
      this.resolveRequests();
      this.accumulatedTime = 0;
    }
  }

  public requestFrame(name: TKeys, sprite: ISprite) {
    this._requests.set(sprite, name);

    if (this._cachedFrames.has(sprite)) {
      const spriteCachedFrames = this._cachedFrames.get(
        sprite
      ) as TCachedFrames<TKeys>;

      // initialize a cached frame for the specified keyframe name
      if (spriteCachedFrames[name] === undefined) {
        spriteCachedFrames[name] = 0;
      }
    } else {
      // initialize cached frames for the sprite
      const initialCachedFrames = {[name]: 0} as TCachedFrames<TKeys>;
      this._cachedFrames.set(sprite, initialCachedFrames);
    }
  }

  protected addPlayRequests() {
    for (let [sprite, name] of this.playing) {
      this.requestFrame(name, sprite);
    }
  }

  protected resolveRequests() {
    for (let [sprite, name] of this._requests) {
      const spriteCachedFrames = this._cachedFrames.get(
        sprite
      ) as TCachedFrames<TKeys>;

      const {firstGID, lastGID} = this.keyframes[name];
      const currentFrameGID = firstGID + spriteCachedFrames[name];

      sprite.texture = this.spritesheet.getTextureByGID(currentFrameGID);

      // advance frame for the next update
      spriteCachedFrames[name] += 1;

      if (currentFrameGID >= lastGID) {
        spriteCachedFrames[name] = 0;
      }
    }

    // each update has separate requests
    this._requests.clear();
  }

  protected removeAnimatedSprite(sprite: ISprite) {
    this._requests.delete(sprite);
    this._cachedFrames.delete(sprite);
    this.playing.delete(sprite);
  }

  public destroy() {
    this._requests.clear();
    this._cachedFrames.clear();
    this.playing.clear();
  }
}
