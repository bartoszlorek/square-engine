import {TVector2} from '../_types';
import {Entity} from '../Entity';
import {Tilemap} from '../Tilemap';

interface ICollisionStaticGroup<A, T, E extends string> {
  readonly type: 'static';
  readonly entities: Entity<A, T, E>[];
  readonly tilemaps: Tilemap<A, E>[];
  callback(
    entity: Entity<A, T, E>,
    tilemap: Tilemap<A, E>,
    separation: TVector2
  ): void;
}

interface ICollisionDynamicGroup<A, T, E extends string> {
  readonly type: 'dynamic';
  readonly entitiesA: Entity<A, T, E>[];
  readonly entitiesB: Entity<A, T, E>[];
  callback(
    entityA: Entity<A, T, E>,
    entityB: Entity<A, T, E>,
    separation: TSeparation
  ): void;
}

interface ICollisionSelfDynamicGroup<A, T, E extends string> {
  readonly type: 'self_dynamic';
  readonly entities: Entity<A, T, E>[];
  callback(
    entityA: Entity<A, T, E>,
    entityB: Entity<A, T, E>,
    separation: TSeparation
  ): void;
}

export type ICollisionGroup<A, T, E extends string> =
  | ICollisionStaticGroup<A, T, E>
  | ICollisionDynamicGroup<A, T, E>
  | ICollisionSelfDynamicGroup<A, T, E>;

export type TSeparation = {
  length: number;
  normal: TVector2;
};
