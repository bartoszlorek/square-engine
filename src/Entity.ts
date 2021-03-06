import {Sprite} from 'pixi.js';
import {Element} from './Element';
import {Trait} from './Trait';
import {TVector2} from './types';

export class Entity<
  TAddons extends {},
  TTraits extends {},
  TEvents extends string
> extends Element<TAddons, TEvents, Sprite> {
  public static EMPTY = new Entity(new Sprite(), {});
  public readonly type = 'entity';
  public readonly velocity: TVector2;
  public readonly traits: TTraits;

  /**
   * Controls whether physics affects the rigidbody.
   * - `dynamic` responds to collisions resolved by the physics engine.
   * - `kinematic` processes collisions with others without reaction.
   */
  public physics: 'dynamic' | 'kinematic' = 'dynamic';

  // processing
  private _traitsList: Trait<TAddons, TTraits, TEvents>[];

  constructor(display: Sprite, traits: TTraits) {
    super(display);
    this.velocity = [0, 0];
    this.traits = traits;

    // assign this entity to traits
    this._traitsList = Object.values(traits);
    for (let i = 0; i < this._traitsList.length; i++) {
      this._traitsList[i].entity = this;
    }
  }

  /**
   * Updates each trait and applies velocity.
   */
  public update(deltaTime: number) {
    // render an element based on the previous step
    this.updateDisplay();

    // update the position for traits, addons or renderer in the next step
    this.translateX(this.velocity[0] * deltaTime);
    this.translateY(this.velocity[1] * deltaTime);

    // call traits that may introduce changes to the entity
    // for next addons or renderer in the next step
    for (let i = 0; i < this._traitsList.length; i++) {
      this._traitsList[i].update(deltaTime);
    }
  }

  /**
   * Destroys all traits and removes the element from a parent scene.
   */
  public destroy() {
    for (let i = 0; i < this._traitsList.length; i++) {
      this._traitsList[i].destroy();
    }
    super.destroy();
  }
}
