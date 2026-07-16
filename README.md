# Flow Field

An interactive generative-art toy where thousands of particles drift through a living vector field.

## What it is

Flow Field is a browser-based generative-art experiment built with Vite and React 19. Thousands of particles are pushed through an animated vector field derived from 3D Perlin noise. Because the field's third axis is time, the whole structure slowly morphs, and fading trails turn the particle paths into flowing ribbons of light. Move your pointer across the canvas to inject a swirl and watch the field react beneath your cursor.

## Features

- Thousands of particles flowing through a time-evolving Perlin-noise vector field
- Fading trails that render particle paths as glowing ribbons
- Pointer-driven swirl that lets you stir the field interactively
- Five color palettes: Aurora, Ember, Ocean, Mono, and Candy
- Adjustable particle count
- Clear the canvas and pause / play the animation at any time
- Zero runtime dependencies beyond React, the noise and color code are fully self-contained

## Getting started

Requires a recent version of Node.js.

```bash
# Install dependencies
npm install

# Start the dev server (with hot module replacement)
npm run dev

# Create a production build
npm run build

# Preview the production build locally
npm run preview
```

## How it works

At the heart of the toy is a **vector field**: for any point on the canvas the field defines a direction to travel. That direction comes from **3D Perlin noise**. Given a particle at `(x, y)`, the engine samples `perlin3(x, y, time)` and maps the result to an angle. The particle then steps along that angle using `cos(angle)` and `sin(angle)` as its velocity. Because the noise is sampled with `time` as the third coordinate, the field is not static, it drifts and reshapes itself continuously as time advances.

When the pointer is active, particles within a radius of the cursor receive an additional **tangential push** (a vector perpendicular to their direction from the cursor), which bends their paths into a swirl that orbits the pointer, with the effect falling off toward the edge of the radius.

Rather than clearing the canvas each frame, the renderer paints the background with a **low alpha** on every frame. Old strokes fade gradually instead of disappearing, and the accumulated particle steps read as smooth, flowing **trails**. Particle color is sampled from the active palette based on local speed, so faster ribbons glow hotter.

## Project structure

- `src/noise.js` — self-contained 3D Perlin noise implementation
- `src/palettes.js` — color palettes and color-sampling helpers
- `src/FlowField.js` — the particle engine (field sampling, pointer swirl, trail rendering)
- `src/App.jsx` — the React UI and controls (palette, particle count, clear, pause / play)
