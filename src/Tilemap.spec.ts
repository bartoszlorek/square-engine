import {Container} from 'pixi.js';
import {Tilemap} from './Tilemap';

describe('class Tilemap', () => {
  it('creates from array of values', () => {
    const map = new Tilemap(new Container(), [1, 0, 1], 3);
    expect(map.values).toEqual([1, 0, 1]);
  });

  it('returns index of value', () => {
    const map = new Tilemap(new Container(), [1, 0, 1, 1], 2);
    expect(map.getIndex(1, 1)).toBe(3);
  });

  it('removes value by index', () => {
    const map = new Tilemap(new Container(), [1, 0, 1], 3);

    map.delete(2);
    expect(map.values).toEqual([1, 0, 0]);
  });

  it('calculates bounds', () => {
    // prettier-ignore
    const map = new Tilemap(new Container(), [
      0, 0, 1, 1,
      1, 1, 1, 0,
      0, 1, 1, 0
    ], 4);

    expect(map.min).toEqual([0, 0]);
    expect(map.max).toEqual([128, 96]);
  });

  it('calculates tile bounds', () => {
    // prettier-ignore
    const map = new Tilemap(new Container(), [
      0, 0, 1, 1,
      1, 1, 1, 0,
      0, 1, 1, 0
    ], 4);

    expect(map.tileBounds.min).toEqual([0, 0]);
    expect(map.tileBounds.max).toEqual([128, 96]);
  });

  it('excludes empty tiles on edges in the calculation', () => {
    // prettier-ignore
    const map = new Tilemap(new Container(), [
      0, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 0
    ], 4);

    expect(map.tileBounds.min).toEqual([64, 32]);
    expect(map.tileBounds.max).toEqual([96, 64]);
  });

  describe('closest()', () => {
    // prettier-ignore
    const values3 = [
      1, 2, 3,
      4, 5, 6,
      7, 8, 9
    ];

    // prettier-ignore
    test.each([
      [ // middle
        [1, 1], [1, 2, 3, 
                 4, 5, 6,
                 7, 8, 9]
      ],
      [ // top-left
        [0, 0], [0, 0, 0,
                 0, 1, 2,
                 0, 4, 5]
      ],
      [ // top-left (shifted)
        [-1, -1], [0, 0, 0,
                   0, 0, 0,
                   0, 0, 1]
      ],
      [ // top-right
        [2, 0], [0, 0, 0,
                 2, 3, 0,
                 5, 6, 0]
      ],
      [ // top-right (shifted)
        [3, -1], [0, 0, 0,
                  0, 0, 0,
                  3, 0, 0]
      ],
      [ // bottom-right
        [2, 2], [5, 6, 0,
                 8, 9, 0,
                 0, 0, 0]
      ],
      [ // bottom-right (shifted)
        [3, 3], [9, 0, 0,
                 0, 0, 0,
                 0, 0, 0]
      ],
      [ // bottom-left
        [0, 2], [0, 4, 5,
                 0, 7, 8,
                 0, 0, 0]
      ],
      [ // bottom-left (shifted)
        [-1, 3], [0, 0, 7,
                  0, 0, 0,
                  0, 0, 0]
      ],
      [ // far shifted
        [10, 3], [0, 0, 0,
                  0, 0, 0,
                  0, 0, 0]
      ],
    ])('returns closest values from 3×3 grid for %p', ([x, y], result) => {
      const map = new Tilemap(new Container(), values3, 3);
      expect(map.closest(x, y)).toEqual(result);
    });

    // prettier-ignore
    const values4 = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 1, 2, 3,
      4, 5, 6, 7
    ];

    // prettier-ignore
    test.each([
      [ // top-left
        [1, 1], [1, 2, 3,
                 5, 6, 7,
                 9, 1, 2]
        ],
      [ // bottom-right
        [2, 2], [6, 7, 8,
                 1, 2, 3,
                 5, 6, 7]
      ],
    ])('returns closest values from 4×4 grid for %p', ([x, y], result) => {
      const map = new Tilemap(new Container(), values4, 4);
      expect(map.closest(x, y)).toEqual(result);
    });

    it('returns closest values for vertical grid', () => {
      // prettier-ignore
      const map = new Tilemap(new Container(), [
        1,
        2,
        3,
        4,
        5
      ], 1);

      // prettier-ignore
      expect(map.closest(0, 0)).toEqual([
        0, 0, 0,
        0, 1, 0,
        0, 2, 0
      ]);
    });

    it('returns closest values for horizontal grid', () => {
      const map = new Tilemap(new Container(), [1, 2, 3, 4, 5], 5);

      // prettier-ignore
      expect(map.closest(0, 0)).toEqual([
        0, 0, 0,
        0, 1, 2,
        0, 0, 0
      ]);
    });
  });

  describe('raytrace()', () => {
    // prettier-ignore
    const emptyValues = [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ];

    test.each`
      a         | b         | length
      ${[0, 0]} | ${[3, 0]} | ${3}
      ${[0, 0]} | ${[2, 1]} | ${2}
      ${[0, 0]} | ${[3, 3]} | ${3}
      ${[0, 0]} | ${[1, 2]} | ${2}
      ${[0, 0]} | ${[0, 3]} | ${3}
      ${[3, 3]} | ${[0, 0]} | ${3}
      ${[3, 3]} | ${[1, 1]} | ${2}
    `(
      'returns $length as traversed length between $a and $b in empty space',
      ({a: [ax, ay], b: [bx, by], length}) => {
        const map = new Tilemap(new Container(), emptyValues, 4);
        expect(map.raytrace(ax, ay, bx, by)).toBe(length);
      }
    );

    // prettier-ignore
    const filledValues = [
      1, 1, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 1, 1, 1
    ];

    test.each`
      a         | b         | length
      ${[0, 1]} | ${[3, 1]} | ${-2}
      ${[0, 3]} | ${[3, 0]} | ${-2}
      ${[1, 2]} | ${[3, 0]} | ${-1}
    `(
      'returns $length as negative length to obstacle between $a and $b',
      ({a: [ax, ay], b: [bx, by], length}) => {
        const map = new Tilemap(new Container(), filledValues, 4);
        expect(map.raytrace(ax, ay, bx, by)).toBe(length);
      }
    );

    it('returns 0 when starting tile is the same as target', () => {
      const map = new Tilemap(new Container(), [0, 0], 2);
      expect(map.raytrace(0, 0, 0, 0)).toBe(0);
    });

    it('returns 0 when starting tile is fulfilled', () => {
      const map = new Tilemap(new Container(), [1, 1], 2);
      expect(map.raytrace(0, 0, 1, 0)).toBe(0);
    });

    it('returns positive length when target tile is fulfilled', () => {
      const map = new Tilemap(new Container(), [0, 0, 1], 3);
      expect(map.raytrace(0, 0, 2, 0)).toBe(2);
    });
  });
});
