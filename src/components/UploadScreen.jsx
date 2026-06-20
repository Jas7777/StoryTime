import { useState, useRef } from 'react'
  import { parseFile } from '../lib/parseBook'

  export default function UploadScreen({ onUpload }) {
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'txt', 'epub'].includes(ext)) {
      setError('Please upload a PDF, TXT, or EPUB file.')
      return
}
    setError(null)
    setLoading(true)
    try {
      const pages = await parseFile(file)
      onUpload({ pages, title: file.name.replace(/\.[^/.]+$/, '') })
} catch (err) {
      setError('Failed to parse file: ' + err.message)
} finally {
      setLoading(false)
}
}

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    handleFile(e.dataTransfer.files[0])
}

  return (
    <div className="upload-screen">
      <div className="upload-logo">
        Gaze Storybook
        <span>Iris-reactive reading experience</span>
      </div>

      <div
        className={`upload-zone${drag ? ' drag' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.epub"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div className="upload-icon">📖</div>
{loading ? (
          <div className="spinner" />
        ) : (
          <>
            <div style={{ color: 'var(--text)', fontWeight: 500 }}>
              Drop your book here
            </div>
            <div className="upload-hint">
              Supports <strong>PDF</strong>, <strong>TXT</strong>, and{' '}
              <strong>EPUB</strong> formats
              <br />
              Your book never leaves your device
            </div>
          </>
        )}
      </div>

{error && (
        <div style={{ color: '#e07070', fontSize: '0.85rem', textAlign: 'center' }}>
{error}
        </div>
      )}

      <button className="btn-ghost" onClick={() => inputRef.current.click()}>
        Browse files
      </button>

      <div style={{ color: 'var(--text3)', fontSize: '0.75rem', textAlign: 'center', maxWidth: 380 }}>
        After upload, you'll calibrate your webcam gaze tracker with a 9-point grid,
        then read with real-time ambient animations.
      </div>
    </div>
  )
}
