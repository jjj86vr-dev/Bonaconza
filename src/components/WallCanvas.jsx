import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { logoUrl } from '../lib/supabase'

const BASE_CELL = 16
const MIN_SCALE = 0.35
const MAX_SCALE = 6

const COLORS = {
  bg: '#12100e',
  grid: '#241f1a',
  gridStrong: '#322b24',
  free: '#191512',
  freeHover: '#2a231c',
  taken: '#3a322a',
  ok: '#2f5d50',
  bad: '#b4232a',
  gold: '#d6a44c',
}

/**
 * Wall su canvas: 6.000 celle disegnate a mano.
 * Il DOM non regge 6.000 nodi animati con pan e zoom fluidi, il canvas si'.
 */
export default function WallCanvas({
  spaces = [],
  occupied = [],
  cols = 100,
  rows = 60,
  mode = 'view',
  pickSize = { w: 1, h: 1 },
  selection = null,
  onPick,
  onSelectSpace,
  className = '',
}) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const viewRef = useRef({ scale: 1, x: 0, y: 0 })
  const pointerRef = useRef({ dragging: false, moved: false, lastX: 0, lastY: 0 })
  const imagesRef = useRef(new Map())
  const frameRef = useRef(0)

  const [hover, setHover] = useState(null)
  const [ready, setReady] = useState(false)

  /* Mappa cella → spazio, per l'hit test in O(1). */
  const cellIndex = useMemo(() => {
    const map = new Map()
    for (const s of spaces) {
      for (let dy = 0; dy < s.h; dy += 1) {
        for (let dx = 0; dx < s.w; dx += 1) {
          map.set(`${s.x + dx},${s.y + dy}`, s)
        }
      }
    }
    return map
  }, [spaces])

  /* Celle occupate ma non ancora pubbliche (hold in corso). */
  const busySet = useMemo(() => {
    const set = new Set()
    for (const o of occupied) {
      for (let dy = 0; dy < o.h; dy += 1) {
        for (let dx = 0; dx < o.w; dx += 1) {
          set.add(`${o.x + dx},${o.y + dy}`)
        }
      }
    }
    return set
  }, [occupied])

  const isAreaFree = useCallback(
    (gx, gy, w, h) => {
      if (gx < 0 || gy < 0 || gx + w > cols || gy + h > rows) return false
      for (let dy = 0; dy < h; dy += 1) {
        for (let dx = 0; dx < w; dx += 1) {
          const key = `${gx + dx},${gy + dy}`
          if (cellIndex.has(key) || busySet.has(key)) return false
        }
      }
      return true
    },
    [cellIndex, busySet, cols, rows],
  )

  /* `drawRef` tiene sempre l'ultima versione di draw(): senza, il
     requestAnimationFrame ridisegnerebbe con lo stato del primo render. */
  const drawRef = useRef(() => {})

  const requestDraw = useCallback(() => {
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      drawRef.current()
    })
  }, [])

  /* ── Disegno ──────────────────────────────────────────────────── */

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = wrap.clientWidth
    const height = wrap.clientHeight

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, width, height)

    const { scale, x: ox, y: oy } = viewRef.current
    const cell = BASE_CELL * scale

    // Solo la porzione visibile: il resto non viene nemmeno considerato.
    const first = { x: Math.max(0, Math.floor(-ox / cell)), y: Math.max(0, Math.floor(-oy / cell)) }
    const last = {
      x: Math.min(cols, Math.ceil((-ox + width) / cell)),
      y: Math.min(rows, Math.ceil((-oy + height) / cell)),
    }

    // Fondo delle celle libere
    ctx.fillStyle = COLORS.free
    ctx.fillRect(ox, oy, cols * cell, rows * cell)

    // Griglia
    if (cell > 5) {
      ctx.lineWidth = 1
      ctx.strokeStyle = COLORS.grid
      ctx.beginPath()
      for (let gx = first.x; gx <= last.x; gx += 1) {
        const px = Math.round(ox + gx * cell) + 0.5
        ctx.moveTo(px, Math.max(oy, 0))
        ctx.lineTo(px, Math.min(oy + rows * cell, height))
      }
      for (let gy = first.y; gy <= last.y; gy += 1) {
        const py = Math.round(oy + gy * cell) + 0.5
        ctx.moveTo(Math.max(ox, 0), py)
        ctx.lineTo(Math.min(ox + cols * cell, width), py)
      }
      ctx.stroke()

      // Righe maestre ogni 10 celle: danno il senso della scala.
      ctx.strokeStyle = COLORS.gridStrong
      ctx.beginPath()
      for (let gx = first.x; gx <= last.x; gx += 1) {
        if (gx % 10) continue
        const px = Math.round(ox + gx * cell) + 0.5
        ctx.moveTo(px, Math.max(oy, 0))
        ctx.lineTo(px, Math.min(oy + rows * cell, height))
      }
      for (let gy = first.y; gy <= last.y; gy += 1) {
        if (gy % 10) continue
        const py = Math.round(oy + gy * cell) + 0.5
        ctx.moveTo(Math.max(ox, 0), py)
        ctx.lineTo(Math.min(ox + cols * cell, width), py)
      }
      ctx.stroke()
    }

    // Celle prenotate da altri (hold in corso)
    ctx.fillStyle = COLORS.taken
    for (const key of busySet) {
      if (cellIndex.has(key)) continue
      const [gx, gy] = key.split(',').map(Number)
      if (gx < first.x || gx > last.x || gy < first.y || gy > last.y) continue
      ctx.fillRect(ox + gx * cell, oy + gy * cell, cell, cell)
    }

    // Spazi pubblicati
    for (const space of spaces) {
      const px = ox + space.x * cell
      const py = oy + space.y * cell
      const pw = space.w * cell
      const ph = space.h * cell
      if (px + pw < 0 || py + ph < 0 || px > width || py > height) continue

      ctx.fillStyle = space.bg_color || '#2a231c'
      ctx.fillRect(px, py, pw, ph)

      const image = getImage(space, imagesRef, requestDraw)
      if (image && pw >= 10) {
        const pad = Math.max(1, pw * 0.08)
        const box = Math.min(pw, ph) - pad * 2
        if (box > 4) {
          ctx.save()
          ctx.beginPath()
          ctx.rect(px + pad, py + pad, pw - pad * 2, ph - pad * 2)
          ctx.clip()
          const ratio = Math.min((pw - pad * 2) / image.width, (ph - pad * 2) / image.height)
          const iw = image.width * ratio
          const ih = image.height * ratio
          ctx.drawImage(image, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih)
          ctx.restore()
        }
      }

      if (cell > 3) {
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'
        ctx.lineWidth = 1
        ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1)
      }
    }

    // Selezione confermata
    if (selection) {
      const px = ox + selection.x * cell
      const py = oy + selection.y * cell
      ctx.strokeStyle = COLORS.gold
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.strokeRect(px, py, pickSize.w * cell, pickSize.h * cell)
      ctx.setLineDash([])
    }

    // Anteprima sotto il puntatore
    if (hover && mode === 'pick') {
      const free = isAreaFree(hover.x, hover.y, pickSize.w, pickSize.h)
      const px = ox + hover.x * cell
      const py = oy + hover.y * cell
      ctx.fillStyle = free ? 'rgba(47,93,80,0.42)' : 'rgba(180,35,42,0.38)'
      ctx.fillRect(px, py, pickSize.w * cell, pickSize.h * cell)
      ctx.strokeStyle = free ? COLORS.ok : COLORS.bad
      ctx.lineWidth = 2
      ctx.strokeRect(px, py, pickSize.w * cell, pickSize.h * cell)
    } else if (hover && mode === 'view' && cellIndex.has(`${hover.x},${hover.y}`)) {
      const space = cellIndex.get(`${hover.x},${hover.y}`)
      ctx.strokeStyle = COLORS.gold
      ctx.lineWidth = 2
      ctx.strokeRect(ox + space.x * cell, oy + space.y * cell, space.w * cell, space.h * cell)
    }

    // Cornice della wall
    ctx.strokeStyle = COLORS.gridStrong
    ctx.lineWidth = 2
    ctx.strokeRect(ox, oy, cols * cell, rows * cell)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaces, cellIndex, busySet, cols, rows, hover, mode, pickSize, selection, isAreaFree, requestDraw])

  /* ── Inquadratura iniziale ────────────────────────────────────── */

  const fitToView = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const scale = Math.min(
      wrap.clientWidth / (cols * BASE_CELL),
      wrap.clientHeight / (rows * BASE_CELL),
    )
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * 0.94))
    viewRef.current = {
      scale: clamped,
      x: (wrap.clientWidth - cols * BASE_CELL * clamped) / 2,
      y: (wrap.clientHeight - rows * BASE_CELL * clamped) / 2,
    }
    requestDraw()
  }, [cols, rows, requestDraw])

  useEffect(() => {
    fitToView()
    setReady(true)
    const observer = new ResizeObserver(() => {
      requestDraw()
    })
    if (wrapRef.current) observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [fitToView, requestDraw])

  useEffect(() => {
    drawRef.current = draw
    requestDraw()
  }, [draw, requestDraw])

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  /* ── Interazione ──────────────────────────────────────────────── */

  const toGrid = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const { scale, x: ox, y: oy } = viewRef.current
    const cell = BASE_CELL * scale
    return {
      x: Math.floor((clientX - rect.left - ox) / cell),
      y: Math.floor((clientY - rect.top - oy) / cell),
    }
  }

  const zoomAt = (clientX, clientY, factor) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const view = viewRef.current
    const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, view.scale * factor))
    if (next === view.scale) return
    const mx = clientX - rect.left
    const my = clientY - rect.top
    view.x = mx - ((mx - view.x) * next) / view.scale
    view.y = my - ((my - view.y) * next) / view.scale
    view.scale = next
    requestDraw()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (event) => {
      event.preventDefault()
      zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.12 : 1 / 1.12)
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerRef.current = {
      dragging: true,
      moved: false,
      lastX: event.clientX,
      lastY: event.clientY,
    }
  }

  const onPointerMove = (event) => {
    const pointer = pointerRef.current
    if (pointer.dragging) {
      const dx = event.clientX - pointer.lastX
      const dy = event.clientY - pointer.lastY
      if (Math.abs(dx) + Math.abs(dy) > 3) pointer.moved = true
      pointer.lastX = event.clientX
      pointer.lastY = event.clientY
      viewRef.current.x += dx
      viewRef.current.y += dy
      requestDraw()
      return
    }

    const cellPoint = toGrid(event.clientX, event.clientY)
    const inside = cellPoint.x >= 0 && cellPoint.y >= 0 && cellPoint.x < cols && cellPoint.y < rows
    const next = inside ? cellPoint : null
    setHover((prev) => {
      if (prev?.x === next?.x && prev?.y === next?.y) return prev
      return next
    })
  }

  const endPointer = (event) => {
    const pointer = pointerRef.current
    pointer.dragging = false

    if (pointer.moved) return // era un pan, non un click

    const cellPoint = toGrid(event.clientX, event.clientY)
    if (cellPoint.x < 0 || cellPoint.y < 0 || cellPoint.x >= cols || cellPoint.y >= rows) return

    const space = cellIndex.get(`${cellPoint.x},${cellPoint.y}`)
    if (space) {
      onSelectSpace?.(space)
      return
    }
    if (mode === 'pick') {
      // Centra la selezione sul punto cliccato quando il blocco e' grande.
      const gx = Math.min(Math.max(cellPoint.x, 0), cols - pickSize.w)
      const gy = Math.min(Math.max(cellPoint.y, 0), rows - pickSize.h)
      onPick?.({ x: gx, y: gy, free: isAreaFree(gx, gy, pickSize.w, pickSize.h) })
    }
  }

  const hoverSpace = hover ? cellIndex.get(`${hover.x},${hover.y}`) : null
  const cursor = pointerRef.current.dragging
    ? 'grabbing'
    : hoverSpace || mode === 'pick'
      ? 'pointer'
      : 'grab'

  return (
    <div className={`wall ${className}`} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="wall-canvas"
        style={{ cursor, opacity: ready ? 1 : 0 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerLeave={() => {
          pointerRef.current.dragging = false
          setHover(null)
        }}
      />

      <div className="wall-hud">
        <div className="wall-coord mono">
          {hover ? `x ${hover.x} · y ${hover.y}` : `${cols} × ${rows}`}
          {hoverSpace ? ` · ${hoverSpace.title || 'spazio'}` : ''}
        </div>
        <div className="wall-zoom">
          <button
            type="button"
            aria-label="Riduci"
            onClick={() => {
              const rect = canvasRef.current.getBoundingClientRect()
              zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1 / 1.3)
            }}
          >
            −
          </button>
          <button type="button" aria-label="Adatta alla finestra" onClick={fitToView}>
            ⤢
          </button>
          <button
            type="button"
            aria-label="Ingrandisci"
            onClick={() => {
              const rect = canvasRef.current.getBoundingClientRect()
              zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.3)
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

/** Cache immagini: ogni logo si carica una volta sola. */
function getImage(space, cacheRef, onLoad) {
  if (!space.logo_path) return null
  const cache = cacheRef.current
  const cached = cache.get(space.id)
  if (cached) return cached.complete && cached.naturalWidth ? cached : null

  const url = logoUrl(space.logo_path)
  if (!url) return null

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  image.onload = onLoad
  image.onerror = () => cache.set(space.id, { complete: true, naturalWidth: 0 })
  cache.set(space.id, image)
  return null
}
