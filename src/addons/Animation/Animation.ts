import {Sprite} from 'pixi.js';
import {Scene} from '../../Scene';
import {TiledSpriteSheet} from '../../tiled';
import {IAddon} from '../../types';
import {TKeyframesDictionary} from './types';

type TCachedFrames<TKeys extends string> = {[K in TKeys]: number};

const DELTA_TIME_PER_FRAME = 1 / 12;

export class Animation<
  TAddons extends {},
  TEvents extends string,
  TKeys extends string
> implements IAddon {
  public readonly playing: Map<Sprite, TKeys>;
  public readonly spritesheet: TiledSpriteSheet;
  public readonly keyframes: TKeyframesDictionary<TKeys>;

  private _deltaTimePerFrame: number;
  private _accumulatedTime: number;
  private _requests: Map<Sprite, TKeys>;
  private _cachedFrames: Map<Sprite, TCachedFrames<TKeys>>;

  constructor(
    scene: Scene<TAddons, TEvents>,
    spritesheet: TiledSpriteSheet,
    keyframes: TKeyframesDictionary<TKeys>,
    deltaTimePerFrame: number = DELTA_TIME_PER_FRAME
  ) {
    this.spritesheet = spritesheet;
    this.keyframes = keyframes;
    this.playing = new Map();

    // animation may run at a different speed than app
    this._deltaTimePerFrame = deltaTimePerFrame;
    this._accumulatedTime = 0;

    // processing data
    this._requests = new Map();
    this._cachedFrames = new Map();

    scene.on('elementRemoved', elem => {
      this.removeAnimatedSprite(elem);
    });
  }

  /**
   * Automatically requests the next frame on every update.
   */
  public play<T extends Sprite>(name: TKeys, sprite: T) {
    this.playing.set(sprite, name);
  }

  /**
   * Pauses requesting the next frame.
   */
  public pause<T extends Sprite>(sprite: T) {
    this.playing.delete(sprite);
  }

  /**
   * Called on every game tick and limits animation FPS.
   */
  public update(deltaTime: number) {
    this._accumulatedTime += deltaTime;

    if (this._accumulatedTime >= this._deltaTimePerFrame) {
      this.addPlayRequests();
      this.resolveRequests();
      this._accumulatedTime = 0;
    }
  }

  /**
   * Request only one more frame of animation.
   */
  public requestFrame<T extends Sprite>(name: TKeys, sprite: T) {
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

      sprite.texture = this.spritesheet.getTexture(currentFrameGID);

      // advance frame for the next update
      spriteCachedFrames[name] += 1;

      if (currentFrameGID >= lastGID) {
        spriteCachedFrames[name] = 0;
      }
    }

    // each update has separate requests
    this._requests.clear();
  }

  protected removeAnimatedSprite<T extends Sprite>(sprite: T) {
    this._requests.delete(sprite);
    this._cachedFrames.delete(sprite);
    this.playing.delete(sprite);
  }

  /**
   * Clears all cached data.
   */
  public destroy() {
    this._requests.clear();
    this._cachedFrames.clear();
    this.playing.clear();
  }
}
