// VizEngine.js - Canvas-based gaze-reactive animations
// gazeY: 0 = top of page, 1 = bottom of page

function rand(a, b) { return a + Math.random() * (b - a) }
function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }

// ── Particle pool ─────────────────────────────────────────────────────────────
class Particle {
    constructor(x, y, vx, vy, life, size, color, alpha = 1) {
          Object.assign(this, { x, y, vx, vy, life, maxLife: life, size, color, alpha })
    }
    update(dt) {
          this.x += this.vx * dt
          this.y += this.vy * dt
          this.life -= dt
          this.alpha = clamp(this.life / this.maxLife, 0, 1)
          return this.life > 0
    }
    draw(ctx) {
          ctx.save()
          ctx.globalAlpha = this.alpha * 0.85
          ctx.fillStyle = this.color
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    }
}

// ── Theme renderers ───────────────────────────────────────────────────────────
const RENDERERS = {}

// Snow
RENDERERS.snow = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(8,10,20,0.18)'
    ctx.fillRect(0, 0, W, H)
    const focusY = gazeY * H
    if (!state.flakes) state.flakes = Array.from({ length: 80 }, () => ({
          x: rand(0, W), y: rand(0, H), r: rand(1, 4),
          vy: rand(30, 90), vx: rand(-15, 15), alpha: rand(0.4, 1)
    }))
    state.flakes.forEach(f => {
          f.y += f.vy * dt
          f.x += f.vx * dt + Math.sin(f.y / 60) * 0.5
          if (f.y > H) { f.y = -10; f.x = rand(0, W) }
          const dist = Math.abs(f.y - focusY) / H
          const brightness = lerp(1, 0.3, dist)
          ctx.save()
          ctx.globalAlpha = f.alpha * brightness
          ctx.fillStyle = '#d8eeff'
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
}

// Fire
RENDERERS.fire = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(10,4,2,0.22)'
    ctx.fillRect(0, 0, W, H)
    if (!state.embers) state.embers = []
        const baseY = gazeY * H
    for (let i = 0; i < 4; i++) {
          const x = rand(W * 0.2, W * 0.8)
          const offset = (x / W - 0.5) * H * 0.6
          state.embers.push(new Particle(
                  x, baseY + offset,
                  rand(-25, 25), rand(-180, -60),
                  rand(0.8, 2.5), rand(2, 6),
                  `hsl(${rand(10, 45)},100%,${rand(50, 80)}%)`
                ))
    }
    state.embers = state.embers.filter(e => e.update(dt))
    state.embers.forEach(e => e.draw(ctx))
    // Glow
    const grd = ctx.createRadialGradient(W / 2, baseY, 0, W / 2, baseY, W * 0.45)
    grd.addColorStop(0, 'rgba(255,120,20,0.12)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)
}

// Storm
RENDERERS.storm = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(5,6,14,0.25)'
    ctx.fillRect(0, 0, W, H)
    if (!state.drops) state.drops = Array.from({ length: 120 }, () => ({
          x: rand(0, W), y: rand(0, H),
          vy: rand(400, 700), len: rand(8, 22)
    }))
    const focusY = gazeY * H
    state.drops.forEach(d => {
          d.y += d.vy * dt
          if (d.y > H) { d.y = -30; d.x = rand(0, W) }
          const dist = Math.abs(d.y - focusY) / H
          ctx.save()
          ctx.globalAlpha = lerp(0.7, 0.1, dist)
          ctx.strokeStyle = '#8ab4d4'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - 2, d.y + d.len)
          ctx.stroke()
          ctx.restore()
    })
    // Lightning flash
    if (!state.nextFlash) state.nextFlash = rand(2, 6)
    state.nextFlash -= dt
    if (state.nextFlash <= 0) {
          ctx.fillStyle = 'rgba(180,200,255,0.08)'
          ctx.fillRect(0, 0, W, H)
          state.nextFlash = rand(2, 8)
    }
}

// Night
RENDERERS.night = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(3,4,12,0.2)'
    ctx.fillRect(0, 0, W, H)
    if (!state.stars) state.stars = Array.from({ length: 120 }, () => ({
          x: rand(0, W), y: rand(0, H * 0.7),
          r: rand(0.5, 2), twinkle: rand(0, Math.PI * 2), speed: rand(1, 3)
    }))
    const focusY = gazeY * H
    state.stars.forEach(s => {
          s.twinkle += s.speed * dt
          const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle))
          const dist = Math.abs(s.y - focusY) / H
          ctx.save()
          ctx.globalAlpha = alpha * lerp(1, 0.2, dist)
          ctx.fillStyle = '#fff8e7'
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
    // Moon
    ctx.save()
    ctx.globalAlpha = 0.9
    const moonY = H * 0.15 + gazeY * H * 0.1
    const grd = ctx.createRadialGradient(W * 0.75, moonY, 0, W * 0.75, moonY, 55)
    grd.addColorStop(0, '#fff8e7')
    grd.addColorStop(0.5, '#ffe8a0')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
}

// Calm
RENDERERS.calm = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(6,10,8,0.15)'
    ctx.fillRect(0, 0, W, H)
    if (!state.petals) state.petals = Array.from({ length: 30 }, () => ({
          x: rand(0, W), y: rand(0, H),
          vy: rand(15, 40), vx: rand(-8, 8),
          r: rand(3, 7), hue: rand(300, 360), phase: rand(0, Math.PI * 2)
    }))
    const focusY = gazeY * H
    state.petals.forEach(p => {
          p.y += p.vy * dt
          p.x += p.vx * dt + Math.sin(p.phase + p.y / 80) * 0.8
          p.phase += dt * 0.5
          if (p.y > H + 20) { p.y = -20; p.x = rand(0, W) }
          const dist = Math.abs(p.y - focusY) / H
          ctx.save()
          ctx.globalAlpha = lerp(0.8, 0.15, dist)
          ctx.fillStyle = `hsl(${p.hue},80%,80%)`
          ctx.beginPath()
          ctx.ellipse(p.x, p.y, p.r, p.r * 1.6, p.phase, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
}

// Conflict
RENDERERS.conflict = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(12,4,4,0.25)'
    ctx.fillRect(0, 0, W, H)
    if (!state.sparks) state.sparks = []
        const focusY = gazeY * H
    for (let i = 0; i < 3; i++) {
          const angle = rand(0, Math.PI * 2)
          const spd = rand(80, 220)
          state.sparks.push(new Particle(
                  W * 0.5 + rand(-80, 80), focusY + rand(-30, 30),
                  Math.cos(angle) * spd, Math.sin(angle) * spd,
                  rand(0.3, 0.9), rand(1, 3),
                  `hsl(${rand(0, 30)},100%,${rand(60, 90)}%)`
                ))
    }
    state.sparks = state.sparks.filter(s => s.update(dt))
    state.sparks.forEach(s => s.draw(ctx))
    // Red vignette
    const vgrd = ctx.createRadialGradient(W / 2, focusY, H * 0.1, W / 2, focusY, H * 0.8)
    vgrd.addColorStop(0, 'rgba(0,0,0,0)')
    vgrd.addColorStop(1, 'rgba(120,10,10,0.3)')
    ctx.fillStyle = vgrd
    ctx.fillRect(0, 0, W, H)
}

// Magic
RENDERERS.magic = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(6,4,14,0.18)'
    ctx.fillRect(0, 0, W, H)
    if (!state.orbs) state.orbs = Array.from({ length: 25 }, () => ({
          x: rand(0, W), y: rand(0, H), r: rand(2, 8),
          vx: rand(-30, 30), vy: rand(-30, 30),
          hue: rand(200, 320), phase: rand(0, Math.PI * 2), speed: rand(0.5, 2)
    }))
    const focusY = gazeY * H
    state.orbs.forEach(o => {
          o.phase += o.speed * dt
          o.x += o.vx * dt + Math.sin(o.phase) * 1.2
          o.y += o.vy * dt + Math.cos(o.phase * 0.7) * 1.2
          if (o.x < 0) o.x = W; if (o.x > W) o.x = 0
          if (o.y < 0) o.y = H; if (o.y > H) o.y = 0
          const dist = Math.abs(o.y - focusY) / H
          const alpha = lerp(0.9, 0.1, dist)
          ctx.save()
          const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 3)
          grd.addColorStop(0, `hsla(${o.hue},100%,80%,${alpha})`)
          grd.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(o.x, o.y, o.r * 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
}

// Ocean
RENDERERS.ocean = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(2,8,16,0.2)'
    ctx.fillRect(0, 0, W, H)
    if (!state.waves) { state.waves = []; state.t = 0 }
    state.t += dt
    const focusY = gazeY * H
    for (let layer = 0; layer < 5; layer++) {
          const yBase = focusY - H * 0.1 + layer * H * 0.08
          const amp = lerp(25, 10, layer / 4)
          const freq = lerp(0.008, 0.015, layer / 4)
          const speed = lerp(1.2, 0.6, layer / 4)
          ctx.save()
          ctx.globalAlpha = lerp(0.4, 0.15, layer / 4)
          ctx.strokeStyle = `hsl(${200 + layer * 6},80%,${50 + layer * 5}%)`
          ctx.lineWidth = lerp(2, 1, layer / 4)
          ctx.beginPath()
          for (let x = 0; x <= W; x += 4) {
                  const y = yBase + amp * Math.sin(x * freq + state.t * speed + layer * 0.8)
                  x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
          ctx.restore()
    }
}

// Forest
RENDERERS.forest = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(4,8,4,0.2)'
    ctx.fillRect(0, 0, W, H)
    if (!state.leaves) {
          state.leaves = Array.from({ length: 40 }, () => ({
                  x: rand(0, W), y: rand(0, H), r: rand(3, 9),
                  vx: rand(-20, 20), vy: rand(20, 60),
                  hue: rand(90, 150), phase: rand(0, Math.PI * 2)
          }))
          state.t = 0
    }
    state.t += dt
    const focusY = gazeY * H
    state.leaves.forEach(l => {
          l.phase += dt * 0.8
          l.x += l.vx * dt * 0.5 + Math.sin(l.phase) * 0.8
          l.y += l.vy * dt * 0.3
          if (l.y > H + 20) { l.y = -20; l.x = rand(0, W) }
          const dist = Math.abs(l.y - focusY) / H
          ctx.save()
          ctx.globalAlpha = lerp(0.85, 0.12, dist)
          ctx.fillStyle = `hsl(${l.hue},${60 + Math.sin(l.phase) * 20}%,35%)`
          ctx.beginPath()
          ctx.ellipse(l.x, l.y, l.r, l.r * 0.6, l.phase, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
    // Light rays
    for (let i = 0; i < 4; i++) {
          const rx = W * (0.1 + i * 0.25)
          const angle = -0.3 + i * 0.15
          ctx.save()
          ctx.globalAlpha = 0.04 + 0.02 * Math.sin(state.t * 0.5 + i)
          ctx.strokeStyle = '#d4f0a0'
          ctx.lineWidth = 30
          ctx.beginPath()
          ctx.moveTo(rx, 0)
          ctx.lineTo(rx + Math.tan(angle) * H, H)
          ctx.stroke()
          ctx.restore()
    }
}

// Celestial
RENDERERS.celestial = (state, ctx, W, H, gazeY, dt) => {
    ctx.fillStyle = 'rgba(2,3,10,0.18)'
    ctx.fillRect(0, 0, W, H)
    if (!state.stars) {
          state.stars = Array.from({ length: 150 }, () => ({
                  x: rand(0, W), y: rand(0, H), r: rand(0.5, 2.5),
                  hue: rand(180, 280), twinkle: rand(0, Math.PI * 2), speed: rand(0.5, 2)
          }))
          state.nebula = { x: W * 0.5, y: H * 0.4 }
          state.t = 0
    }
    state.t += dt
    const focusY = gazeY * H
    // Nebula
    const nx = state.nebula.x + Math.sin(state.t * 0.1) * 20
    const ny = focusY * 0.6 + H * 0.2
    const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, W * 0.5)
    grd.addColorStop(0, 'rgba(80,40,120,0.15)')
    grd.addColorStop(0.5, 'rgba(40,10,80,0.08)')
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)
    // Stars
    state.stars.forEach(s => {
          s.twinkle += s.speed * dt
          const focusDist = Math.abs(s.y - focusY) / H
          const brightness = lerp(1, 0.2, focusDist) * (0.5 + 0.5 * Math.abs(Math.sin(s.twinkle)))
          ctx.save()
          ctx.globalAlpha = brightness
          const sgrd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
          sgrd.addColorStop(0, `hsl(${s.hue},80%,95%)`)
          sgrd.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = sgrd
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
    })
}

// ── VizEngine class ───────────────────────────────────────────────────────────
export class VizEngine {
    constructor(canvas) {
          this.canvas = canvas
          this.ctx = canvas.getContext('2d')
          this.theme = 'calm'
          this.gazeY = 0.5
          this.state = {}
                this.lastTime = null
          this.animId = null
    }

  setTheme(theme) {
        if (theme !== this.theme) {
                this.theme = theme
                this.state = {} // reset particles when theme changes
        }
  }

  setGazeY(y) {
        this.gazeY = clamp(y, 0, 1)
  }

  start() {
        this.lastTime = performance.now()
        this._frame()
  }

  stop() {
        if (this.animId) cancelAnimationFrame(this.animId)
  }

  _frame() {
        const now = performance.now()
        const dt = Math.min((now - this.lastTime) / 1000, 0.05) // cap at 50ms
      this.lastTime = now

      const { canvas, ctx, theme, gazeY, state } = this
        const W = canvas.width
        const H = canvas.height

      const renderer = RENDERERS[theme] || RENDERERS.calm
        renderer(state, ctx, W, H, gazeY, dt)

      this.animId = requestAnimationFrame(() => this._frame())
  }

  resize(w, h) {
        this.canvas.width = w
        this.canvas.height = h
        this.state = {} // reset state on resize
  }
}
