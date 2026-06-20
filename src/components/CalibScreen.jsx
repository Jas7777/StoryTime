import { useState, useEffect, useRef, useCallback } from 'react'
import { GazeTracker } from '../lib/GazeTracker'

// 9-point calibration grid (relative positions 0-1)
const CALIB_POINTS = [
  { x: 0.1, y: 0.1 }, { x: 0.5, y: 0.1 }, { x: 0.9, y: 0.1 },
  { x: 0.1, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.9, y: 0.5 },
  { x: 0.1, y: 0.9 }, { x: 0.5, y: 0.9 }, { x: 0.9, y: 0.9 },
  ]

export default function CalibScreen({ onCalibrated }) {
    const [phase, setPhase] = useState('intro') // intro | calibrating | done
  const [activeIdx, setActiveIdx] = useState(0)
    const [doneIdxs, setDoneIdxs] = useState([])
    const [irisPos, setIrisPos] = useState(null)
    const [status, setStatus] = useState('Starting webcam...')
    const videoRef = useRef()
    const trackerRef = useRef(null)

  // Calibration data: map screen point -> iris point
  const calibData = useRef([])

  const startTracker = useCallback(async () => {
        try {
                const tracker = new GazeTracker(({ x, y }) => {
                          setIrisPos({ x: x * window.innerWidth, y: y * window.innerHeight })
                })
                await tracker.init(videoRef.current)
                trackerRef.current = tracker
                setStatus('Tracker ready')
        } catch (err) {
                setStatus('Webcam error: ' + err.message + '. Using simulated gaze.')
                // Simulated gaze fallback
          const sim = setInterval(() => {
                    setIrisPos({
                                x: window.innerWidth * 0.5 + Math.sin(Date.now() / 1000) * 100,
                                y: window.innerHeight * 0.5 + Math.cos(Date.now() / 800) * 80
                    })
          }, 50)
                trackerRef.current = { stop: () => clearInterval(sim), getLastGaze: () => ({ x: 0.5, y: 0.5 }) }
        }
  }, [])

  useEffect(() => {
        if (phase === 'calibrating') startTracker()
        return () => trackerRef.current?.stop()
  }, [phase, startTracker])

  function handlePointClick() {
        if (phase !== 'calibrating') return
        const pt = CALIB_POINTS[activeIdx]
        const gaze = trackerRef.current?.getLastGaze() || { x: 0.5, y: 0.5 }
        calibData.current.push({ screen: pt, gaze })
        setDoneIdxs(prev => [...prev, activeIdx])

      if (activeIdx < CALIB_POINTS.length - 1) {
              setActiveIdx(activeIdx + 1)
      } else {
              // Calibration complete — compute simple linear offsets
          const offsets = calibData.current.map(d => ({
                    dx: d.screen.x - d.gaze.x,
                    dy: d.screen.y - d.gaze.y,
          }))
              const avgDx = offsets.reduce((s, o) => s + o.dx, 0) / offsets.length
              const avgDy = offsets.reduce((s, o) => s + o.dy, 0) / offsets.length
              setPhase('done')
              setTimeout(() => onCalibrated({ offsetX: avgDx, offsetY: avgDy, tracker: trackerRef.current }), 600)
      }
  }

  if (phase === 'intro') {
        return (
                <div className="calib-screen">
                        <div className="calib-overlay">
                                  <h2>Gaze Calibration</h2>h2>
                                  <p>
                                              We'll use your webcam to track where your eyes are on the page.
                                              Look at each dot as it appears and click it (or wait 1.5s).
                                              <br /><br />
                                              Please allow camera access when prompted.
                                  </p>p>
                                  <button className="btn-primary" onClick={() => setPhase('calibrating')}>
                                              Start Calibration
                                  </button>button>
                                  <button className="btn-ghost" onClick={() => onCalibrated({ offsetX: 0, offsetY: 0, tracker: null })}>
                                              Skip (no eye tracking)
                                  </button>button>
                        </div>div>
                </div>div>
              )
  }
  
    if (phase === 'done') {
          return (
                  <div className="calib-screen">
                          <div className="calib-overlay">
                                    <h2>Calibration Complete ✓</h2>h2>
                                    <p>Eye tracking is ready. Starting reading view...</p>p>
                          </div>div>
                  </div>div>
                )
    }
  
    const activePt = CALIB_POINTS[activeIdx]
      
        return (
              <div className="calib-screen" onClick={handlePointClick}>
                {/* Iris dot overlay */}
                {irisPos && (
                        <div
                                    className="calib-iris"
                                    style={{ left: irisPos.x, top: irisPos.y }}
                                  />
                      )}
              
                {/* Calibration dots */}
                {CALIB_POINTS.map((pt, i) => {
                        const isActive = i === activeIdx
                                  const isDone = doneIdxs.includes(i)
                                            return (
                                                        <div
                                                                      key={i}
                                                                      className={`calib-point${isActive ? ' active' : isDone ? ' done' : ''}`}
                                                                      style={{
                                                                                      left: `${pt.x * 100}%`,
                                                                                      top: `${pt.y * 100}%`,
                                                                      }}
                                                                    />
                                                      )
              })}
              
                {/* Webcam preview */}
                    <video ref={videoRef} className="calib-video" muted playsInline />
              
                {/* Progress */}
                    <div className="calib-progress">
                            <div>{status}</div>div>
                            <div style={{ marginTop: '0.3rem' }}>
                                      Point {activeIdx + 1} of {CALIB_POINTS.length} — Click the highlighted dot
                            </div>div>
                    </div>div>
              </div>div>
            )
}</div>
