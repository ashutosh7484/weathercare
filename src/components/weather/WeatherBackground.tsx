import { useEffect, useRef } from 'react'

interface Props { theme: string; conditionId: number; temp?: number }

function getHeatTier(t: number) {
  if (t >= 45) return 'extreme'
  if (t >= 38) return 'hot'
  if (t >= 30) return 'warm'
  if (t >= 20) return 'mild'
  if (t >= 10) return 'cool'
  if (t >= 0)  return 'cold'
  return 'freezing'
}

// ── palette per weather ───────────────────────────────────────────────────────
function getPalette(theme: string, tier: string) {
  if (theme === 'storm')        return { bg: ['#04000d','#0d0020','#05000f'],   accent: '#7c3aed', glow: '#a78bfa' }
  if (theme === 'rain')         return { bg: ['#010a16','#021628','#010c1e'],   accent: '#0ea5e9', glow: '#38bdf8' }
  if (theme === 'snow' || tier === 'freezing') return { bg: ['#020810','#04101e','#020810'], accent: '#93c5fd', glow: '#bfdbfe' }
  if (theme === 'fog')          return { bg: ['#0c0e11','#141618','#0c0e11'],   accent: '#6b7280', glow: '#9ca3af' }
  if (tier === 'extreme')       return { bg: ['#0f0000','#2a0400','#0f0000'],   accent: '#ef4444', glow: '#fca5a5' }
  if (tier === 'hot')           return { bg: ['#0d0200','#220700','#0d0200'],   accent: '#f97316', glow: '#fdba74' }
  if (tier === 'warm')          return { bg: ['#090700','#181200','#090700'],   accent: '#eab308', glow: '#fde047' }
  if (tier === 'mild')          return { bg: ['#000a02','#011205','#000a02'],   accent: '#22c55e', glow: '#86efac' }
  if (tier === 'cool')          return { bg: ['#000c08','#001610','#000c08'],   accent: '#10b981', glow: '#6ee7b7' }
  if (tier === 'cold')          return { bg: ['#00050f','#000a1e','#00050f'],   accent: '#3b82f6', glow: '#93c5fd' }
  if (theme === 'clear-night')  return { bg: ['#010208','#02040f','#010208'],   accent: '#818cf8', glow: '#c7d2fe' }
  return                               { bg: ['#010810','#020e1c','#010810'],   accent: '#0ea5e9', glow: '#7dd3fc' }
}

// ── smooth cursor dot component using a second canvas overlay ─────────────────
function useCursorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let W = window.innerWidth, H = window.innerHeight
    c.width = W; c.height = H

    // Cursor state
    const cursor   = { x: W / 2, y: H / 2 }
    const target   = { x: W / 2, y: H / 2 }
    // Trail rings — each lags behind by different amount for magnetic feel
    const rings = Array.from({ length: 5 }, (_, i) => ({
      x: W / 2, y: H / 2,
      lag: 0.028 + i * 0.016,  // ultra slow magnetic tail
      size: 12 - i * 1.6,
      alpha: 0.35 - i * 0.055,
    }))
    let raf = 0

    const onMove = (e: MouseEvent) => { target.x = e.clientX; target.y = e.clientY }
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', resize)

    function loop() {
      ctx.clearRect(0, 0, W, H)

      // Single smooth dot — lerps toward cursor
      rings[0].x += (target.x - rings[0].x) * rings[0].lag
      rings[0].y += (target.y - rings[0].y) * rings[0].lag

      // Just one tiny glowing dot — no rings
      ctx.save()
      ctx.globalAlpha = 0.45
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 8
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(rings[0].x, rings[0].y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return ref
}

// ── main weather scene canvas ─────────────────────────────────────────────────
function useSceneCanvas(theme: string, tier: string) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    let W = 0, H = 0
    const palette = getPalette(theme, tier)
    const particles: any[] = []
    const MAX = 500
    let tick = 0
    let raf = 0

    function resize() {
      W = c.width  = window.innerWidth
      H = c.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── spawn background particles ─────────────────────────────────────────
    function spawnBg() {
      if (particles.length >= MAX) return

      if (theme === 'rain' || theme === 'storm') {
        // Angled slow cinematic raindrops
        const angle = theme === 'storm' ? -0.28 : -0.12
        const speed = theme === 'storm' ? 10 + Math.random() * 5 : 6 + Math.random() * 3
        particles.push({
          type: 'rain', x: Math.random() * W * 1.5 - W * 0.25, y: -30,
          vx: Math.sin(angle) * speed, vy: Math.cos(angle) * speed,
          len: theme === 'storm' ? 22 + Math.random() * 12 : 14 + Math.random() * 10,
          alpha: 0.07 + Math.random() * 0.14,
          life: 1, decay: 0,
        })
        // Occasional mist layer
        if (Math.random() < 0.008) {
          particles.push({ type: 'mist', x: Math.random() * W, y: Math.random() * H, r: 80 + Math.random() * 140, alpha: 0.04, life: 1, vx: 0.15, vy: 0, decay: 0.0006 })
        }
      }

      else if (theme === 'snow' || tier === 'freezing') {
        particles.push({
          type: 'snow', x: Math.random() * W, y: -10,
          vx: (Math.random() - 0.5) * 0.8, vy: 0.25 + Math.random() * 0.6,
          size: 1.5 + Math.random() * 4, alpha: 0.5 + Math.random() * 0.5,
          drift: Math.random() * Math.PI * 2, driftS: 0.006 + Math.random() * 0.008,
          life: 1, decay: 0,
        })
      }

      else if (theme === 'fog') {
        const fromLeft = Math.random() > 0.5
        particles.push({
          type: 'mist', x: fromLeft ? -150 : W + 150, y: Math.random() * H,
          vx: fromLeft ? 0.10 + Math.random() * 0.08 : -(0.10 + Math.random() * 0.08),
          vy: (Math.random() - 0.5) * 0.06,
          r: 100 + Math.random() * 180, alpha: 0.055 + Math.random() * 0.04,
          life: 1, decay: 0.0004,
        })
      }

      else if (tier === 'extreme' || tier === 'hot') {
        // Rising embers
        particles.push({
          type: 'ember', x: Math.random() * W, y: H + 10,
          vx: (Math.random() - 0.5) * 1.8, vy: -(0.4 + Math.random() * 1.2),
          size: 1.5 + Math.random() * 4,
          hue: tier === 'extreme' ? 5 + Math.random() * 18 : 20 + Math.random() * 20,
          wobble: Math.random() * Math.PI * 2, wobbleS: 0.012 + Math.random() * 0.015,
          life: 1, decay: 0.0015 + Math.random() * 0.0015,
        })
        // Heat shimmer wave
        if (Math.random() < 0.004) {
          particles.push({ type: 'heatwave', x: Math.random() * W, y: H * 0.5 + Math.random() * H * 0.5, w: 80 + Math.random() * 200, alpha: 0.05, life: 1, decay: 0.008, vx: (Math.random() - 0.5) * 0.5 })
        }
      }

      else if (tier === 'warm') {
        particles.push({
          type: 'pollen', x: Math.random() * W, y: H * 0.4 + Math.random() * H * 0.6,
          vx: (Math.random() - 0.5) * 0.7, vy: -(0.1 + Math.random() * 0.35),
          size: 1.2 + Math.random() * 2.5,
          wobble: Math.random() * Math.PI * 2, wobbleS: 0.008 + Math.random() * 0.01,
          life: 1, decay: 0.0008 + Math.random() * 0.001,
        })
      }

      else if (tier === 'mild' || tier === 'cool') {
        if (Math.random() < 0.35) {
          // Falling leaves
          particles.push({
            type: 'leaf', x: Math.random() * W, y: -20,
            vx: (Math.random() - 0.5) * 1.2, vy: 0.2 + Math.random() * 0.55,
            size: 7 + Math.random() * 12,
            rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.014,
            hue: tier === 'mild' ? 100 + Math.random() * 50 : 130 + Math.random() * 30,
            wobble: Math.random() * Math.PI * 2, wobbleS: 0.008,
            life: 1, decay: 0,
          })
        } else {
          // Floating dust motes
          particles.push({
            type: 'mote', x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
            size: 0.8 + Math.random() * 1.5, alpha: 0.2 + Math.random() * 0.4,
            life: 1, decay: 0.001,
          })
        }
      }

      else if (tier === 'cold') {
        particles.push({
          type: 'crystal', x: Math.random() * W, y: -10,
          vx: (Math.random() - 0.5) * 0.5, vy: 0.18 + Math.random() * 0.45,
          size: 3 + Math.random() * 7,
          rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.008,
          life: 1, decay: 0,
        })
      }

      else if (theme === 'clear-night') {
        // Slow twinkling stars that drift very slightly
        if (Math.random() < 0.25) {
          particles.push({
            type: 'star', x: Math.random() * W, y: Math.random() * H * 0.75,
            size: Math.random() > 0.92 ? 2.2 : 0.9,
            alpha: 0.1 + Math.random() * 0.7, alphaD: (Math.random() - 0.5) * 0.012,
            life: 1, decay: 0,
          })
        }
      }

      else {
        // Clear day — subtle floating light particles
        particles.push({
          type: 'mote', x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: -0.1 - Math.random() * 0.2,
          size: 0.8 + Math.random() * 1.8, alpha: 0.1 + Math.random() * 0.2,
          life: 1, decay: 0.0008,
        })
      }
    }

    // ── cursor-reactive spawner ────────────────────────────────────────────
    const mouse = { x: -999, y: -999, vx: 0, vy: 0, px: -999, py: -999 }
    let lastCursor = 0

    function spawnCursor(x: number, y: number) {
      if (theme === 'rain' || theme === 'storm') {
        // Ripple ring
        particles.push({ type: 'ripple', x, y, r: 0, maxR: 50 + Math.random() * 30, life: 1, decay: 0.012, col: palette.glow })
        for (let i = 0; i < 2; i++) {
          const a = (Math.PI * 2 / 5) * i + Math.random() * 0.4
          particles.push({ type: 'drop', x, y, vx: Math.cos(a) * (0.8 + Math.random() * 1.2), vy: Math.sin(a) * (0.8 + Math.random() * 1.2) - 0.8, size: 2 + Math.random() * 2.5, life: 1, decay: 0.016, col: palette.glow })
        }
      } else if (theme === 'snow' || tier === 'freezing') {
        for (let i = 0; i < 2; i++) {
          const a = (Math.PI * 2 / 7) * i
          particles.push({ type: 'snowflake_cursor', x, y, vx: Math.cos(a) * (0.5 + Math.random() * 0.7), vy: Math.sin(a) * (0.5 + Math.random() * 0.7), size: 5 + Math.random() * 7, rot: a, rotV: (Math.random() - 0.5) * 0.025, life: 1, decay: 0.005 })
        }
      } else if (tier === 'extreme' || tier === 'hot') {
        particles.push({ type: 'ripple', x, y, r: 0, maxR: 70, life: 1, decay: 0.018, col: palette.glow })
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2
          particles.push({ type: 'lava', x, y, vx: Math.cos(a) * (0.7 + Math.random() * 1.5) + mouse.vx * 0.08, vy: Math.sin(a) * (0.7 + Math.random() * 1.5) + mouse.vy * 0.08, size: 4 + Math.random() * 7, hue: 5 + Math.random() * 25, life: 1, decay: 0.009 })
        }
      } else if (tier === 'warm') {
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2
          particles.push({ type: 'pollen', x, y, vx: Math.cos(a) * (0.2 + Math.random() * 0.4) + mouse.vx * 0.02, vy: Math.sin(a) * (0.2 + Math.random() * 0.4) + mouse.vy * 0.02, size: 2 + Math.random() * 3.5, wobble: Math.random() * Math.PI * 2, wobbleS: 0.022, life: 1, decay: 0.005 })
        }
      } else if (tier === 'mild' || tier === 'cool') {
        for (let i = 0; i < 1; i++) {
          const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 2.5
          particles.push({ type: 'leaf', x, y, vx: Math.cos(a) * sp * 0.15 + mouse.vx * 0.02, vy: Math.sin(a) * sp * 0.15 + mouse.vy * 0.02, size: 6 + Math.random() * 10, rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.04, hue: 100 + Math.random() * 60, wobble: 0, wobbleS: 0.018, life: 1, decay: 0.004 })
        }
      } else if (tier === 'cold') {
        for (let i = 0; i < 2; i++) {
          const a = (Math.PI * 2 / 6) * i
          particles.push({ type: 'crystal', x, y, vx: Math.cos(a) * (0.5 + Math.random() * 0.9), vy: Math.sin(a) * (0.5 + Math.random() * 0.9), size: 4 + Math.random() * 7, rot: a, rotV: (Math.random() - 0.5) * 0.03, life: 1, decay: 0.005 })
        }
      } else if (theme === 'fog') {
        particles.push({ type: 'mist', x, y, vx: mouse.vx * 0.08, vy: mouse.vy * 0.08, r: 15, alpha: 0.1, life: 1, decay: 0.009 })
      } else {
        // Default — glowing orbs
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2
          particles.push({ type: 'orb', x, y, vx: Math.cos(a) * (1 + Math.random() * 2), vy: Math.sin(a) * (1 + Math.random() * 2), size: 2 + Math.random() * 4, life: 1, decay: 0.018, col: palette.glow })
        }
      }
    }

    const onMove = (e: MouseEvent) => {
      mouse.vx = e.clientX - mouse.px; mouse.vy = e.clientY - mouse.py
      mouse.px = mouse.x; mouse.py = mouse.y
      mouse.x = e.clientX; mouse.y = e.clientY
      // Cursor particles disabled — background animation only
    }
    window.addEventListener('mousemove', onMove)

    // ── update ────────────────────────────────────────────────────────────
    function update(p: any) {
      if (p.type === 'rain') { p.x += p.vx; p.y += p.vy; if (p.y > H + 40) p.life = 0; return }
      if (p.type === 'mist') { p.x += p.vx; p.y += p.vy; p.r += 0.4; p.life -= p.decay; if (p.r > 350 || p.x < -350 || p.x > W + 350) p.life = 0; return }
      if (p.type === 'ripple') { p.r += (p.maxR - p.r) * 0.1; p.life -= p.decay; return }
      if (p.type === 'snow') { p.drift += p.driftS; p.x += p.vx + Math.sin(p.drift) * 0.45; p.y += p.vy; if (p.y > H + 15) p.life = 0; return }
      if (p.type === 'star') { p.alpha += p.alphaD; if (p.alpha > 0.9 || p.alpha < 0.05) p.alphaD *= -1; return }
      if (p.type === 'ember') { p.wobble += p.wobbleS; p.x += p.vx + Math.sin(p.wobble) * 0.55; p.y += p.vy; p.life -= p.decay; if (p.y < -20) p.life = 0; return }
      if (p.type === 'heatwave') { p.x += p.vx; p.life -= p.decay; return }
      if (p.type === 'pollen') { p.wobble += p.wobbleS; p.x += p.vx + Math.sin(p.wobble) * 0.35; p.y += p.vy; p.vx *= 0.993; p.vy *= 0.993; p.life -= p.decay; if (p.y < -20) p.life = 0; return }
      if (p.type === 'leaf') { if (p.decay === 0 && p.y > H + 30) p.life = 0; if (p.wobble !== undefined) { p.wobble += p.wobbleS; p.x += Math.sin(p.wobble) * 0.45 } p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vx *= 0.995; p.vy *= 0.995; p.life -= p.decay; return }
      if (p.type === 'mote') { p.x += p.vx; p.y += p.vy; p.life -= p.decay; return }
      if (p.type === 'crystal') { p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.vx *= 0.97; p.vy *= 0.97; if (p.decay === 0 && p.y > H + 20) p.life = 0; p.life -= p.decay; return }
      // cursor particles
      p.vx *= 0.88; p.vy *= 0.88; p.x += p.vx; p.y += p.vy; p.life -= p.decay
      if (p.type === 'snowflake_cursor' || p.type === 'crystal') p.rot += p.rotV
    }

    // ── draw ──────────────────────────────────────────────────────────────
    function draw(p: any) {
      ctx.save()
      const al = Math.max(0, Math.min(1, p.life))
      ctx.globalAlpha = al

      if (p.type === 'rain') {
        ctx.strokeStyle = `rgba(148,210,255,${p.alpha})`
        ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * p.len / p.vy, p.y + p.len); ctx.stroke()

      } else if (p.type === 'mist') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r)
        const a = al * p.alpha
        g.addColorStop(0,   `rgba(148,180,210,${a * 1.8})`)
        g.addColorStop(0.5, `rgba(100,140,180,${a})`)
        g.addColorStop(1,   `rgba(80,120,160,0)`)
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'ripple') {
        ctx.strokeStyle = p.col || palette.glow
        ctx.lineWidth = 1.2
        ctx.globalAlpha = al * 0.6
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke()

      } else if (p.type === 'drop' || p.type === 'orb') {
        ctx.shadowColor = palette.glow; ctx.shadowBlur = 8
        ctx.fillStyle = p.col || palette.glow
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'snow') {
        ctx.fillStyle = `rgba(200,230,255,${al * p.alpha})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'snowflake_cursor') {
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.strokeStyle = `rgba(186,230,253,${al})`
        ctx.shadowColor = '#bfdbfe'; ctx.shadowBlur = 8; ctx.lineWidth = 1.2
        for (let i = 0; i < 6; i++) {
          ctx.save(); ctx.rotate((Math.PI / 3) * i)
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size)
          ctx.moveTo(0, -p.size * 0.5); ctx.lineTo(p.size * 0.28, -p.size * 0.7)
          ctx.moveTo(0, -p.size * 0.5); ctx.lineTo(-p.size * 0.28, -p.size * 0.7)
          ctx.stroke(); ctx.restore()
        }

      } else if (p.type === 'star') {
        ctx.fillStyle = `rgba(220,230,255,${p.alpha})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        if (p.size > 1.5) {
          // Cross flare for big stars
          ctx.strokeStyle = `rgba(220,230,255,${p.alpha * 0.4})`; ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y); ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6); ctx.stroke()
        }

      } else if (p.type === 'ember') {
        ctx.shadowColor = `hsl(${p.hue},100%,55%)`; ctx.shadowBlur = 14
        ctx.fillStyle = `hsla(${p.hue},100%,${55 + (1 - al) * 25}%,${al})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * al, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'lava') {
        ctx.shadowColor = `hsl(${p.hue},100%,55%)`; ctx.shadowBlur = 18
        ctx.fillStyle = `hsla(${p.hue},100%,55%,${al})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * al, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'heatwave') {
        const g = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y)
        g.addColorStop(0,   'rgba(251,146,60,0)')
        g.addColorStop(0.5, `rgba(251,146,60,${al * p.alpha})`)
        g.addColorStop(1,   'rgba(251,146,60,0)')
        ctx.fillStyle = g; ctx.fillRect(p.x, p.y - 1, p.w, 2)

      } else if (p.type === 'pollen') {
        ctx.shadowColor = '#fde047'; ctx.shadowBlur = 7
        ctx.fillStyle = `rgba(253,224,71,${al * 0.85})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'leaf') {
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.shadowColor = `hsl(${p.hue},55%,35%)`; ctx.shadowBlur = 6
        ctx.fillStyle = `hsla(${p.hue},62%,36%,${al})`
        ctx.beginPath()
        ctx.moveTo(0, -p.size)
        ctx.bezierCurveTo( p.size * 0.65, -p.size * 0.4,  p.size * 0.65,  p.size * 0.4, 0,  p.size)
        ctx.bezierCurveTo(-p.size * 0.65,  p.size * 0.4, -p.size * 0.65, -p.size * 0.4, 0, -p.size)
        ctx.fill()
        ctx.strokeStyle = `rgba(255,255,255,0.18)`; ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(0, -p.size * 0.85); ctx.lineTo(0, p.size * 0.85); ctx.stroke()

      } else if (p.type === 'mote') {
        ctx.fillStyle = `rgba(200,220,255,${al * p.alpha})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()

      } else if (p.type === 'crystal') {
        ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.strokeStyle = `rgba(147,210,253,${al * 0.85})`
        ctx.shadowColor = '#93c5fd'; ctx.shadowBlur = 9; ctx.lineWidth = 1
        for (let i = 0; i < 6; i++) {
          ctx.save(); ctx.rotate((Math.PI / 3) * i)
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p.size)
          ctx.moveTo(-p.size * 0.22, -p.size * 0.5); ctx.lineTo(p.size * 0.22, -p.size * 0.5)
          ctx.stroke(); ctx.restore()
        }
      }
      ctx.restore()
    }

    // ── spawn rate ────────────────────────────────────────────────────────
    function spawnEvery() {
      if (theme === 'rain') return 2
      if (theme === 'storm') return 2
      if (theme === 'snow' || tier === 'freezing') return 4
      if (theme === 'fog') return 10
      if (tier === 'extreme' || tier === 'hot') return 5
      if (tier === 'warm') return 7
      if (tier === 'mild' || tier === 'cool') return 5
      if (tier === 'cold') return 5
      if (theme === 'clear-night') return 18
      return 20
    }

    // ── draw gradient sky ─────────────────────────────────────────────────
    function drawSky() {
      const [c1, c2, c3] = palette.bg
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0,   c1)
      g.addColorStop(0.5, c2)
      g.addColorStop(1,   c3)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    }

    // ── ambient glow orbs (static, pulsing) ───────────────────────────────
    const orbs = [
      { x: 0.18, y: 0.22, r: 0.28, phase: 0 },
      { x: 0.82, y: 0.65, r: 0.22, phase: Math.PI },
      { x: 0.5,  y: 0.1,  r: 0.18, phase: Math.PI / 2 },
    ]

    // ── main loop ─────────────────────────────────────────────────────────
    let bgTimer = 0
    function loop() {
      tick++
      drawSky()

      // Ambient glow orbs
      for (const orb of orbs) {
        orb.phase += 0.008
        const pulse = 0.85 + Math.sin(orb.phase) * 0.15
        const ox = orb.x * W, oy = orb.y * H, or_ = orb.r * Math.max(W, H) * pulse
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, or_)
        g.addColorStop(0,   palette.accent.replace('#','') === palette.accent ? palette.accent + '22' : hexAlpha(palette.accent, 0.13))
        g.addColorStop(0.5, hexAlpha(palette.accent, 0.05))
        g.addColorStop(1,   'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }

      // Spawn + update particles
      bgTimer++
      if (bgTimer >= spawnEvery()) { bgTimer = 0; spawnBg() }
      for (let i = particles.length - 1; i >= 0; i--) {
        update(particles[i])
        if (particles[i].life <= 0) { particles.splice(i, 1); continue }
        draw(particles[i])
      }

      raf = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [theme, tier])

  return ref
}

function hexAlpha(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function WeatherBackground({ theme, conditionId, temp = 25 }: Props) {
  const tier      = getHeatTier(temp)
  const sceneRef  = useSceneCanvas(theme, tier)
  const cursorRef = useCursorCanvas()

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
      {/* Scene canvas — full animated weather */}
      <canvas ref={sceneRef}  className="absolute inset-0 w-full h-full" />

      {/* Cursor canvas — floating above scene, below UI */}
      <canvas ref={cursorRef} className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'overlay', opacity: 0.65 }} />

      {/* Edge vignette — keeps UI text readable */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.5) 100%)' }} />

      {/* Bottom gradient — always readable */}
      <div className="absolute bottom-0 left-0 right-0 h-52"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)' }} />
    </div>
  )
}