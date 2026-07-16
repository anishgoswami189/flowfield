import { useEffect, useRef, useState } from 'react'
import { FlowField } from './FlowField.js'
import { PALETTES } from './palettes.js'
import './App.css'

// Build a CSS linear-gradient string from a palette's color stops so each
// selector shows the actual material it applies — color is the subject here.
function gradientOf(colors) {
  return `linear-gradient(120deg, ${colors.join(', ')})`
}

function App() {
  const canvasRef = useRef(null)
  const fieldRef = useRef(null)

  const [paletteIndex, setPaletteIndex] = useState(0)
  const [count, setCount] = useState(1400)
  const [paused, setPaused] = useState(false)
  // Live telemetry for the instrument readout — pointer position in the field.
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false })

  // Create the engine once after mount, start the loop, and wire up resize.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const field = new FlowField(canvas, {
      particleCount: 1400,
      palette: PALETTES[0],
    })
    fieldRef.current = field
    field.start()

    const handleResize = () => {
      if (fieldRef.current) fieldRef.current.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      field.stop()
      fieldRef.current = null
    }
  }, [])

  // Swap palette live when the selection changes.
  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.setPalette(PALETTES[paletteIndex])
  }, [paletteIndex])

  // Update particle count live; setting the field then reseeding via resize().
  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.particleCount = count
    field.resize()
  }, [count])

  const handlePointerMove = (event) => {
    const field = fieldRef.current
    if (!field) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    field.setPointer(x, y, true)
    setPointer({ x, y, active: true })
  }

  const handlePointerLeave = (event) => {
    const field = fieldRef.current
    if (!field) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    field.setPointer(x, y, false)
    setPointer({ x, y, active: false })
  }

  const handleClear = () => {
    const field = fieldRef.current
    if (field) field.clear()
  }

  const togglePlayback = () => {
    const field = fieldRef.current
    if (!field) return
    if (paused) {
      field.start()
      setPaused(false)
    } else {
      field.stop()
      setPaused(true)
    }
  }

  const activePalette = PALETTES[paletteIndex]

  return (
    <>
      <canvas
        ref={canvasRef}
        className="field-canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />

      {/* Field-instrument HUD: bracketed corner cluster, not a floating card. */}
      <aside className="hud" aria-label="Flow field controls">
        <header className="hud-head">
          <h1 className="hud-title">Flow Field</h1>
          <p className="hud-sub">vector field · perlin noise · {activePalette.name.toLowerCase()}</p>
        </header>

        <section className="hud-block">
          <div className="hud-label">
            <span>Palette</span>
          </div>
          <div className="swatch-row" role="radiogroup" aria-label="Palette">
            {PALETTES.map((palette, index) => (
              <button
                key={palette.name}
                type="button"
                role="radio"
                aria-checked={index === paletteIndex}
                aria-label={palette.name}
                title={palette.name}
                className={'swatch' + (index === paletteIndex ? ' active' : '')}
                style={{ backgroundImage: gradientOf(palette.colors) }}
                onClick={() => setPaletteIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className="hud-block">
          <div className="hud-label">
            <span>Density</span>
            <span className="hud-readout">{String(count).padStart(4, '0')}</span>
          </div>
          <input
            className="slider"
            type="range"
            min="200"
            max="3000"
            step="100"
            value={count}
            aria-label="Particle count"
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </section>

        <div className="hud-actions">
          <button type="button" className="hud-btn" onClick={togglePlayback}>
            {paused ? '▶ Play' : '❚❚ Pause'}
          </button>
          <button type="button" className="hud-btn" onClick={handleClear}>
            ⟲ Clear
          </button>
        </div>

        {/* Live telemetry line — reinforces the instrument metaphor. */}
        <footer className="hud-telemetry" aria-hidden="true">
          <span className={'tele-dot' + (pointer.active ? ' live' : '')} />
          x{String(Math.round(pointer.x)).padStart(4, '0')} · y
          {String(Math.round(pointer.y)).padStart(4, '0')}
        </footer>
      </aside>
    </>
  )
}

export default App
