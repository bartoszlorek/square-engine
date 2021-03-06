import {BoundingBox} from '../../BoundingBox';
import {TAnyEntity, TAnyTilemap} from '../../types';
import {getTilemapSeparation} from './tilemapSeparation';
import {TCollisionStaticResponse} from './types';

// pre-allocated data
const _clone = new BoundingBox();

export function detectTilemapCollision<
  A extends TAnyEntity,
  B extends TAnyTilemap
>(
  entity: A,
  tilemap: B,
  deltaTime: number,
  response: TCollisionStaticResponse<A, B>
) {
  _clone.copy(entity);
  _clone.translateX(entity.velocity[0] * deltaTime);
  _clone.translateY(entity.velocity[1] * deltaTime);

  if (_clone.intersects(tilemap.tileBounds)) {
    const separation = getTilemapSeparation(tilemap, entity, deltaTime);

    if (separation) {
      response(entity, tilemap, separation);
    }
  }
}
