// Builds src/data/families.json from the ORIGINAL site's saved "Happy families" page.
// Usage (project root):  node scripts/extract-families.mjs "/path/to/puppy.instabizweb.com/happy-families.html"
// Then:                  node scripts/fetch-media.mjs      (downloads the photos into public/media/)
//
// The page is a Next.js (RSC "flight") payload: image records look like
//   {"id":"…","url":"/media/<id>/<hash>/<file>.webp","kind":"image","width":…,"height":…,"alt":"…","caption":"…","color":"#…"}
// We pull every such record out in page order, de-duplicate by url, and keep only images.
import { readFile, writeFile } from 'node:fs/promises'

const input = process.argv[2]
if (!input) {
  console.error('Usage: node scripts/extract-families.mjs <path-to-saved-happy-families-html>')
  process.exit(1)
}

const html = await readFile(input, 'utf8')

// 1) Re-assemble the flight text: self.__next_f.push([1,"<json string>"])
let flight = ''
for (const match of html.matchAll(/self\.__next_f\.push\(\[\d+,("(?:[^"\\]|\\.)*")\]\)/g)) {
  try {
    flight += JSON.parse(match[1])
  } catch {
    // skip malformed chunk
  }
}
if (!flight) flight = html // fall back to scanning the raw HTML

// 2) For every "url":"/media/…" find the enclosing {...} object and parse it.
function enclosingObject(text, at) {
  let depth = 0
  for (let i = at; i >= 0; i--) {
    const ch = text[i]
    if (ch === '}') depth++
    else if (ch === '{') {
      if (depth === 0) return i
      depth--
    }
  }
  return -1
}
function matchingEnd(text, start) {
  let depth = 0
  let inString = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (ch === '\\') i++
      else if (ch === '"') inString = false
    } else if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return i
  }
  return -1
}

const seen = new Set()
const photos = []
for (const m of flight.matchAll(/"url":"(\/media\/[^"]+)"/g)) {
  if (seen.has(m[1])) continue
  const start = enclosingObject(flight, m.index)
  if (start < 0) continue
  const end = matchingEnd(flight, start)
  if (end < 0) continue
  let record
  try {
    record = JSON.parse(flight.slice(start, end + 1))
  } catch {
    continue
  }
  if (record.url !== m[1] || (record.kind && record.kind !== 'image')) continue
  seen.add(m[1])
  photos.push({
    id: String(record.id ?? m[1]),
    url: record.url,
    width: Number(record.width) || 1000,
    height: Number(record.height) || 1250,
    alt: String(record.alt ?? '').replace(/\s+/g, ' ').trim(),
    caption: String(record.caption ?? '').replace(/\s+/g, ' ').trim(),
    ...(record.color ? { color: String(record.color) } : {}),
  })
}

await writeFile(new URL('../src/data/families.json', import.meta.url), JSON.stringify(photos, null, 2) + '\n')
console.log(`wrote src/data/families.json — ${photos.length} photos (${photos.filter((p) => p.caption).length} with captions)`)
if (photos.length !== 64) console.warn(`⚠ expected 64 photos, found ${photos.length}. Check the saved page / send me the first lines of the output.`)
