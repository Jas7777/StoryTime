// GazeTracker.js - MediaPipe FaceMesh iris tracking
// Uses @mediapipe/face_mesh via CDN for browser compatibility

const FACE_MESH_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'

// Iris landmark indices in MediaPipe FaceMesh
const LEFT_IRIS = [468, 469, 470, 471, 472]
const RIGHT_IRIS = [473, 474, 475, 476, 477]

function irisCenter(landmarks, indices) {
    let x = 0, y = 0
    for (const i of indices) {
          x += landmarks[i].x
          y += landmarks[i].y
    }
    return { x: x / indices.length, y: y / indices.length }
}

export class GazeTracker {
    constructor(onGaze) {
          this.onGaze = onGaze // callback({ x, y }) normalized 0-1
      this.faceMesh = null
          this.camera = null
          this.videoEl = null
          this.running = false
          this.lastGaze = { x: 0.5, y: 0.5 }
          this.smoothGaze = { x: 0.5, y: 0.5 }
    }

  async init(videoEl) {
        this.videoEl = videoEl

      return new Promise((resolve, reject) => {
              // Load MediaPipe FaceMesh from CDN
                               const script = document.createElement('script')
              script.src = `${FACE_MESH_CDN}/face_mesh.js`
              script.onload = async () => {
                        try {
                                    await this._setupFaceMesh()
                                    await this._setupCamera()
                                    resolve()
                        } catch (err) {
                                    reject(err)
                        }
              }
              script.onerror = () => reject(new Error('Failed to load MediaPipe'))

                               // Check if already loaded
                               if (window.FaceMesh) {
                                         this._setupFaceMesh().then(() => this._setupCamera()).then(resolve).catch(reject)
                               } else {
                                         document.head.appendChild(script)
                               }
      })
  }

  async _setupFaceMesh() {
        const FaceMesh = window.FaceMesh
        if (!FaceMesh) throw new Error('FaceMesh not available')

      this.faceMesh = new FaceMesh({
              locateFile: (file) => `${FACE_MESH_CDN}/${file}`,
      })
        this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true, // enables iris landmarks
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
        })
        this.faceMesh.onResults((results) => this._onResults(results))
        await this.faceMesh.initialize()
  }

  async _setupCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
        })
        this.videoEl.srcObject = stream
        this.videoEl.onloadedmetadata = () => {
                this.videoEl.play()
                this.running = true
                this._loop()
        }
  }

  _loop() {
        if (!this.running) return
        this.faceMesh.send({ image: this.videoEl }).catch(() => {})
        setTimeout(() => this._loop(), 50) // ~20fps to reduce CPU load
  }

  _onResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return
        const landmarks = results.multiFaceLandmarks[0]

      // Average left and right iris centers
      const left = irisCenter(landmarks, LEFT_IRIS)
        const right = irisCenter(landmarks, RIGHT_IRIS)

      const rawGaze = {
              x: (left.x + right.x) / 2,
              y: (left.y + right.y) / 2,
      }

      // Exponential smoothing
      const alpha = 0.25
        this.smoothGaze.x = alpha * rawGaze.x + (1 - alpha) * this.smoothGaze.x
        this.smoothGaze.y = alpha * rawGaze.y + (1 - alpha) * this.smoothGaze.y

      this.lastGaze = { ...this.smoothGaze }
        this.onGaze({ ...this.smoothGaze })
  }

  stop() {
        this.running = false
        if (this.videoEl && this.videoEl.srcObject) {
                this.videoEl.srcObject.getTracks().forEach((t) => t.stop())
        }
  }

  getLastGaze() {
        return this.lastGaze
  }
}
