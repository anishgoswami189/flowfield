// The flow-field particle engine. Thousands of particles are pushed through a
// vector field derived from 3D Perlin noise (the third dimension is time, so
// the field slowly morphs). The pointer injects a swirl so the field reacts to
// the user. Rendering is additive trails on a canvas whose background is
// painted with a low alpha each frame, leaving fading ribbons behind.

import { perlin3 } from "./noise.js";
import { sampleColor } from "./palettes.js";

const TWO_PI = Math.PI * 2;

export class FlowField {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.particleCount = options.particleCount ?? 1400;
    this.noiseScale = options.noiseScale ?? 0.0016; // spatial frequency of field
    this.timeScale = options.timeScale ?? 0.00016; // how fast the field morphs
    this.speed = options.speed ?? 1.9; // particle step size
    this.palette = options.palette;

    this.particles = [];
    this.pointer = { x: 0, y: 0, active: false, radius: 180, strength: 3.2 };
    this.time = 0;
    this.running = false;
    this._raf = 0;
    this._lastFrame = 0;

    this.resize();
  }

  // Match the drawing buffer to the CSS size and device pixel ratio, then
  // (re)seed particles across the new area.
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = this.canvas;
    this.width = clientWidth;
    this.height = clientHeight;
    this.canvas.width = Math.floor(clientWidth * dpr);
    this.canvas.height = Math.floor(clientHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.fillStyle = "#05060a";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this._seedParticles();
  }

  _seedParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this._spawn());
    }
  }

  _spawn() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      // Life so particles respawn occasionally, preventing them from all
      // piling into the same attractor over time.
      life: 40 + Math.random() * 220,
    };
  }

  setPalette(palette) {
    this.palette = palette;
  }

  setPointer(x, y, active) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = active;
  }

  // Angle of the flow field at a point in space+time.
  _fieldAngle(x, y) {
    const n = perlin3(x * this.noiseScale, y * this.noiseScale, this.time);
    // Map noise [-1,1] to a couple of full turns for swirlier structure.
    return n * TWO_PI * 2;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._lastFrame = 0;
    const loop = (ts) => {
      if (!this.running) return;
      this._step(ts);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
  }

  _step(ts) {
    // Advance field time based on elapsed wall-clock so morphing speed is
    // independent of frame rate.
    const dt = this._lastFrame ? ts - this._lastFrame : 16;
    this._lastFrame = ts;
    this.time += dt * this.timeScale;

    const { ctx, palette } = this;

    // Fade the previous frame toward the background instead of clearing, which
    // is what produces the flowing trails.
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = "lighter";

    const p = this.pointer;
    for (const particle of this.particles) {
      const angle = this._fieldAngle(particle.x, particle.y);
      let vx = Math.cos(angle);
      let vy = Math.sin(angle);

      // Pointer swirl: within the radius, add a tangential push so particles
      // orbit the cursor.
      if (p.active) {
        const dx = particle.x - p.x;
        const dy = particle.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < p.radius && dist > 0.001) {
          const falloff = (1 - dist / p.radius) * p.strength;
          // Perpendicular vector (-dy, dx) gives a swirl around the pointer.
          vx += (-dy / dist) * falloff;
          vy += (dx / dist) * falloff;
        }
      }

      const px = particle.x;
      const py = particle.y;
      particle.x += vx * this.speed;
      particle.y += vy * this.speed;

      // Color by local speed so faster ribbons glow hotter.
      const speedT = Math.min(1, Math.hypot(vx, vy) / (1 + p.strength));
      ctx.strokeStyle = sampleColor(palette.colors, speedT);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();

      // Respawn when a particle dies or wanders off screen.
      particle.life -= 1;
      if (
        particle.life <= 0 ||
        particle.x < 0 ||
        particle.x > this.width ||
        particle.y < 0 ||
        particle.y > this.height
      ) {
        Object.assign(particle, this._spawn());
      }
    }

    ctx.globalCompositeOperation = "source-over";
  }

  // Wipe the canvas back to a clean background (used on palette change / clear).
  clear() {
    this.ctx.fillStyle = "#05060a";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}
