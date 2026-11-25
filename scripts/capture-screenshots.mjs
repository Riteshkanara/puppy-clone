import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '')
const OUT = 'docs/screenshots'

const VIEWPORTS = [
  { prefix: '', width: 1440, height: 900, deviceScaleFactor: 1 },
  { prefix: 'mobile-', width: 390, height: 844, deviceScaleFactor: 2 },
]

const ROUTES = [
  ['home', '/'],
  ['puppies', '/puppies'],
  ['puppy-detail', '__FIRST_PUPPY__'],
  ['gone-home', '/gone-home'],
  ['happy-families', '/happy-families'],
  ['how-it-works', '/how-it-works'],
  ['faq', '/faq'],
  ['contact', '/contact'],
  ['404', '/this-page-does-not-exist'],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function settle(page) {
  await page.waitForLoadState('networkidle')
  await sleep(2800)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await sleep(140)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await sleep(900)
}

async function firstPuppyPath(browser) {
  const page = await browser.newPage()
  await page.goto(`${BASE}/puppies`, { waitUntil: 'networkidle' })
  await sleep(2800)
  const href = await page
    .locator('a[href^="/puppies/"]')
    .first()
    .getAttribute('href')
    .catch(() => null)
  await page.close()
  return href ?? '/puppies'
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
const puppyPath = await firstPuppyPath(browser)

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor,
    hasTouch: vp.prefix === 'mobile-',
    isMobile: vp.prefix === 'mobile-',
  })
  for (const [name, route] of ROUTES) {
    const path = route === '__FIRST_PUPPY__' ? puppyPath : route
    const page = await context.newPage()
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' })
      await settle(page)
      const file = `${OUT}/${vp.prefix}${name}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log('saved', file)
    } catch (err) {
      console.error('failed', name, vp.prefix || 'desktop', err.message)
    } finally {
      await page.close()
    }
  }
  await context.close()
}

await browser.close()
console.log('Done. Review the images, then commit docs/screenshots/.')
