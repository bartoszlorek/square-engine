import {Container, Sprite} from 'pixi.js';
import {BoundingBox} from './BoundingBox';
import {Element} from './Element';
import {TVector2} from './types';

export class Tilemap<
  TAddons extends {},
  TEvents extends string
> extends Element<TAddons, TEvents, Container> {
  public readonly type = 'tilemap';
  public readonly values: number[];
  public readonly columns: number;
  public readonly tileSize: number;

  protected children: Map<number, Sprite>;

  // processing
  private _tileBounds: BoundingBox;
  private _tileBoundsDirty: boolean = true;
  private _closestArray: number[];
  private _point: TVector2;

  constructor(
    display: Container,
    values: number[],
    columns: number = 8,
    tileSize: number = 32
  ) {
    super(display);

    this.values = values;
    this.columns = columns;
    this.tileSize = tileSize;
    this.children = new Map();

    this.width = columns * tileSize;
    this.height = Math.ceil(values.length / columns) * tileSize;

    // pre-allocated data
    this._tileBounds = new BoundingBox();
    this._closestArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this._point = [0, 0];

    // perform calculations after the change
    this.onTransformChange = () => {
      this._tileBoundsDirty = true;
      this.updateDisplay();
    };
  }

  get tileBounds() {
    if (this._tileBoundsDirty) {
      this.calculateTileBounds();
      this._tileBoundsDirty = false;
    }

    return this._tileBounds;
  }

  /**
   * Iterates over the linear array of values
   * and map them with returned sprite.
   */
  public assign<T extends Sprite>(
    iteratee: (value: number, col: number, row: number) => T
  ) {
    this.children.clear();
    this.display.removeChildren();

    for (let index = 0; index < this.values.length; index++) {
      const value = this.values[index];

      if (value > 0) {
        const [col, row] = this.getPoint(index);
        const child = iteratee(value, col, row);
        child.x = col * this.tileSize;
        child.y = row * this.tileSize;

        this.children.set(index, child);
        this.display.addChild(child);
      }
    }

    this.updateCache();
  }

  /**
   * Deletes value and assigned sprite for the given index.
   */
  public delete(index: number) {
    const value = this.values[index];
    const child = this.children.get(index);

    // removes from a linear array
    if (value !== 0) {
      this.values[index] = 0;
      this.calculateTileBounds();
    }

    // removes from a renderer
    if (child !== undefined) {
      this.children.delete(index);
      this.display.removeChild(child);
      this.updateCache();
    }
  }

  /**
   * Returns column and row tuple for the given
   * index of value from a linear array.
   */
  public getPoint(index: number): TVector2 {
    this._point[0] = index % this.columns;
    this._point[1] = Math.floor(index / this.columns);
    return this._point;
  }

  /**
   * Returns index of value from a linear array
   * for the given column and row.
   */
  public getIndex(col: number, row: number): number {
    return col + this.columns * row;
  }

  /**
   * Returns array of nearest values.
   */
  public closest(col: number, row: number): number[] {
    const arr = this._closestArray;

    const start0 = this.getIndex(col - 1, row - 1);
    const start1 = this.getIndex(col - 1, row);
    const start2 = this.getIndex(col - 1, row + 1);

    const row0 = row - 1 >= 0;
    const row1 = row >= 0;
    const row2 = row + 1 >= 0;

    const col0 = !(col - 1 < 0 || col - 1 >= this.columns);
    const col1 = !(col < 0 || col >= this.columns);
    const col2 = !(col + 1 < 0 || col + 1 >= this.columns);

    arr[0] = row0 && col0 ? this.values[start0] || 0 : 0;
    arr[1] = row0 && col1 ? this.values[start0 + 1] || 0 : 0;
    arr[2] = row0 && col2 ? this.values[start0 + 2] || 0 : 0;

    arr[3] = row1 && col0 ? this.values[start1] || 0 : 0;
    arr[4] = row1 && col1 ? this.values[start1 + 1] || 0 : 0;
    arr[5] = row1 && col2 ? this.values[start1 + 2] || 0 : 0;

    arr[6] = row2 && col0 ? this.values[start2] || 0 : 0;
    arr[7] = row2 && col1 ? this.values[start2 + 1] || 0 : 0;
    arr[8] = row2 && col2 ? this.values[start2 + 2] || 0 : 0;

    return arr;
  }

  /**
   * Returns distance between two points A and B.
   * Returns a negative value as the distance to
   * the obstacle between A and B.
   *
   * based on Bresenham’s Line Generation Algorithm
   */
  public raytrace(
    col0: number,
    row0: number,
    col1: number,
    row1: number
  ): number {
    const deltaX = Math.abs(col1 - col0);
    const deltaY = Math.abs(row1 - row0);
    const directionX = col0 < col1 ? 1 : -1;
    const directionY = row0 < row1 ? 1 : -1;

    let error = deltaX - deltaY;
    let length = 0;
    let col = col0;
    let row = row0;

    while (true) {
      if (col === col1 && row === row1) {
        return length;
      }

      if (this.values[this.getIndex(col, row)] > 0) {
        return -length || 0;
      }

      const error2 = 2 * error;
      length += 1;

      if (error2 > -deltaY) {
        error -= deltaY;
        col += directionX;
      }

      if (error2 < deltaX) {
        error += deltaX;
        row += directionY;
      }
    }
  }

  /**
   * This method exists for optimization and should be
   * called whenever the Tilemap changes general position.
   */
  protected calculateTileBounds() {
    if (this.values.length === 0) {
      this._tileBounds.width = 0;
      this._tileBounds.height = 0;
      return;
    }

    let top = 0,
      bottom = 0,
      left = 0,
      right = 0;

    // search in a direction from top to bottom
    for (let index = 0; index < this.values.length; index++) {
      if (this.values[index] > 0) {
        top = Math.floor(index / this.columns);
        break;
      }
    }

    // search in a direction from bottom to top
    for (let index = this.values.length - 1; index >= 0; index--) {
      if (this.values[index] > 0) {
        bottom = Math.floor(index / this.columns);
        break;
      }
    }

    const rowsAmount = Math.ceil(this.values.length / this.columns);
    let col = 0;
    let row = 0;

    // search in a direction from left to right
    for (let index = 0; index < this.values.length; index++) {
      if (this.values[row * this.columns + col] > 0) {
        left = col;
        break;
      }

      if (++row === rowsAmount) {
        col += 1;
        row = 0;
      }
    }

    col = this.columns - 1;
    row = 0;

    // search in a direction from right to left
    for (let index = 0; index < this.values.length; index++) {
      if (this.values[row * this.columns + col] > 0) {
        right = col;
        break;
      }

      if (++row === rowsAmount) {
        col -= 1;
        row = 0;
      }
    }

    this._tileBounds.min[0] = this.min[0] + left * this.tileSize;
    this._tileBounds.min[1] = this.min[1] + top * this.tileSize;
    this._tileBounds.width = (right - left + 1) * this.tileSize;
    this._tileBounds.height = (bottom - top + 1) * this.tileSize;
  }

  /**
   * Important! Caching requires preloaded assets.
   */
  protected updateCache() {
    this.display.cacheAsBitmap = false;
    this.display.cacheAsBitmap = true;
  }

  /**
   * Clears all children and remove
   * the element from a parent scene.
   */
  public destroy() {
    this.children.clear();
    super.destroy();
  }
}
