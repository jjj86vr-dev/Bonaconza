/**
 * Campiona panorama.svg in una griglia di colori: e' quella che tinge
 * i tasselli del mosaico nella pagina.
 *
 *   node presale/tools/campiona-mosaico.mjs
 *
 * Stampa la stringa da incollare in MOSAICO dentro index.html.
 * Ogni tassello sono 3 caratteri esadecimali (#abc): abbastanza per un
 * mosaico, abbastanza corto da stare in linea nel file.
 */
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const COLS = 36
const ROWS = 15
const here = dirname(fileURLToPath(import.meta.url))
const svg = await readFile(join(here, '..', 'panorama.svg'), 'utf8')

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1200, height: 500 } })
await page.setContent(
  `<style>html,body{margin:0;padding:0}svg{display:block}</style>${svg}`,
  { waitUntil: 'load' },
)
await page.waitForTimeout(300)

const griglia = await page.evaluate(async ({ COLS, ROWS }) => {
  const svgEl = document.querySelector('svg')
  const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url })

  const c = document.createElement('canvas')
  c.width = 1200; c.height = 500
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, 1200, 500)

  const cw = 1200 / COLS, ch = 500 / ROWS
  const hex1 = (v) => Math.round((v / 255) * 15).toString(16)
  let out = ''
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const d = ctx.getImageData(x * cw, y * ch, Math.ceil(cw), Math.ceil(ch)).data
      let r = 0, g = 0, b = 0, n = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i+1]; b += d[i+2]; n++ }
      out += hex1(r / n) + hex1(g / n) + hex1(b / n)
    }
  }
  return out
}, { COLS, ROWS })

console.log(`COLONNE: ${COLS}  RIGHE: ${ROWS}  tasselli: ${COLS * ROWS}  lunghezza: ${griglia.length}`)
console.log(griglia)
await browser.close()
