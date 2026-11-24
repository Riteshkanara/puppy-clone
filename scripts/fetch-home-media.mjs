// Downloads the photos/videos used on the Home page into public/media/.
// List: docs/reference/home-media.json (collected from the saved original index.html).
// Usage from the project root: node scripts/fetch-home-media.mjs [https://puppy.instabizweb.com]
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const ORIGIN = process.argv[2] ?? 'https://puppy.instabizweb.com'
const urls = JSON.parse(await readFile(new URL('../docs/reference/home-media.json', import.meta.url), 'utf8'))

console.log(`${urls.length} Home assets from ${ORIGIN}`)
let ok = 0
let failed = 0

for (const url of urls) {
  const output = join('public', url)
  try {
    await access(output)
    ok += 1
    continue
  } catch {
    // missing locally — download below
  }
  try {
    const response = await fetch(new URL(url, ORIGIN))
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, Buffer.from(await response.arrayBuffer()))
    ok += 1
    console.log(`  ✓ ${url}`)
  } catch (error) {
    failed += 1
    console.warn(`  ✗ ${url}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

console.log(`done: ${ok}/${urls.length} available locally; ${failed} failed`)
if (failed > 0) process.exitCode = 1
