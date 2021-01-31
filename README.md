# Blöb2D Game Engine 🎮

Playable demo 💾 available here https://bartoszlorek.pl/run/blob2d \
Package 📦 for new games here https://www.npmjs.com/package/blob2d

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/13873576/106365055-4c543100-6333-11eb-8784-2c98eb845dc8.png">
</p>

## General Structure

- **Docker** is a facade for `PixiJS` application responsible for mounting and updating the `Scene` during each frame of the game cycle.

- **Scene** provides ground to initialize relationships between dynamics `Entities` and more static `Tiles`. One `Docker` can only mount one scene at a time. Unmounting the current `Scene` destroys all elements, relationships, or events belonging to it.

- **Addon** provides a way to extend `Scene` with additional functionality, like animation, physics, or updating `Traits`.

- **Entity** is a dynamic element of `Scene`, it's also known as "sprite" in other environments. Each `Entity` has its own `velocity` which can be affected by `Addons` or `Traits`.

- **Trait** provides a way to extend `Entity` with additional functionality, like movement caused by user input, or interaction with other `Entities` or `Tiles`.

- **Tile** is a static element of `Scene`. Basically always it's a group of `Tiles` on a grid with specific properties, like collision for `Entities` or purply visual aspects.

## Features [TODO] 📝

- ✅ Scene based environment fed by game cycles
- ✅ Sprites described as bounding box with `position` and `velocity`
- ✅ Traits system extending the functionality of sprites
- ✅ Tiles structure with methods to interact with them
- ✅ Custom and predefined events related to game cycles
- ✅ Sprite sheets manager
- ✅ Tiled integration
- ✅ Collisions
- ✅ Animations
- ✅ User inputs
- ❌ User interface
- ✅ Motion easings
- 🤷‍♂️ General physics
- ❌ Sound

**Notice:** this repository is under development 🚧

## Basic Usage

```ts
// types.ts

export type Addons = {entities: Entities};
export type Traits = {followMouse: FollowMouse};
export type Events = 'customEvent';
export type Keyframes = 'customName';
```

```ts
// game.ts

import {Application, Loader} from 'pixi.js';
import {Docker} from 'blob2d';
import {Level} from './Level';
...

const app = new Application();
const loader = new Loader();

loader.add('sprites', './assets/sprites.png');
loader.load(() => {
  const docker = new Docker<Addons, Events>(app);
  const level = new Level(loader.resources);

  docker.on('docker/mount', () => {
    console.log('crazy wacky cool!');
  });

  docker.mount(level);
});

document.body.appendChild(app.view);
```

```ts
// Level.ts

import {Sprite, Container} from 'pixi.js';
import {Entities, Entity, Scene} from 'blob2d';
import {FollowMouse} from './traits';
...

export class Level extends Scene<Addons, Events> {
  constructor() {
    super(Container);

    // should be called before accessing any addon
    this.registerAddons({
      entities: new Entities(this),
    });

    // create a player entity with FollowMouse trait
    const player = new Entity<Addons, Traits, Events>(
      new Sprite(texture), {followMouse: new FollowMouse()}
    );

    // add a player entity to the scene
    this.addElement(player);

    // addon updating traits of each entity
    this.addon.entities.addChild(player);
  }
}
```

## User Inputs

General utilities to build more complex interactions.

### `Keyboard`

Proxy of keyboard events handling both `keyup` and `keydown` state.

```ts
const keyboard = new Keyboard();

keyboard.on('ArrowRight', (pressed: boolean) => {
  if (pressed) player.moveRight();
});

keyboard.off('ArrowRight');
keyboard.destroy();
```

### `ScreenButton`

Simulates clicking a physical keyboard.

```ts
const $node = document.querySelector<HTMLElement>('.button');
const button = new ScreenButton('ArrowLeft', $node);

// optional: extends button behavior
button.onKeydown = node => node.classList.add('clicked');
button.onKeyup = node => node.classList.remove('clicked');

// listens to the standard key event
keyboard.on('ArrowLeft', callback);
```

## Motion Easings

https://matthewlein.com/tools/ceaser

### `Easing`

Match the best easing type for your animation.

```ts
const value = Easing.linear(t);
const value = Easing.easeInQuad(t);
const value = Easing.easeInElastic(t);

// or create an instance
const easing = new Easing(250); // milliseconds
const value = easing.easeInQuad(deltaTime);
```
