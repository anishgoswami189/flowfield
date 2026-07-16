import { useEffect, useRef, useState } from 'react'
import { FlowField } from './FlowField.js'
import { PALETTES } from './palettes.js'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const fieldRef = useRef(null)

  const [paletteIndex, setPaletteIndex] = useState(0)
  const [count, setCount] = useState(1400)
  const [paused, setPaused] = useState(false)

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
    field.setPointer(event.clientX - rect.left, event.clientY - rect.top, true)
  }

  const handlePointerLeave = (event) => {
    const field = fieldRef.current
    if (!field) return
    const rect = event.currentTarget.getBoundingClientRect()
    field.setPointer(event.clientX - rect.left, event.clientY - rect.top, false)
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

  return (
    <>
      <canvas
        ref={canvasRef}
        className="field-canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />

      <div className="controls">
        <h1 className="title">Flow Field</h1>

        <div className="control-group">
          <span className="control-label">Palette</span>
          <div className="palette-row">
            {PALETTES.map((palette, index) => (
              <button
                key={palette.name}
                type="button"
                className={
                  'palette-button' + (index === paletteIndex ? ' active' : '')
                }
                onClick={() => setPaletteIndex(index)}
              >
                {palette.name}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">
            Particles<span className="control-value">{count}</span>
          </span>
          <input
            className="slider"
            type="range"
            min="200"
            max="3000"
            step="100"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </div>

        <div className="button-row">
          <button type="button" className="action-button" onClick={handleClear}>
            Clear
          </button>
          <button
            type="button"
            className="action-button"
            onClick={togglePlayback}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>
    </>
  )
}

export default App
