# Testing

Testing was **manual**. The project has no automated tests.

## Automated checks
- `npm run lint`: pass
- `npm run build` (`tsc -b && vite build`): pass, with the 500 kB chunk warning

## Manual checklist
| Area | Result |
|---|---|
| Home page | Pass |
| Happy Families | Pass |
| How It Works and `#imported` | Pass |
| Puppy detail | Pass |
| Invalid puppy URL (404) | Pass |
| Page transitions | Pass |
| Browser back and forward | Pass |
| Refresh on non-home routes | Pass locally. TODO: verify on the live URL |
| Mobile responsiveness | Pass. TODO: list the widths or devices |
| Original images and media | Pass |

Compared against reference screenshots at desktop, tablet and mobile widths.

## Live site checks
TODO: after deploy, tick each: home, refresh on `/puppies`, bad URL, `/how-it-works#imported`, phone.

## Lighthouse (live URL)
| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | TODO | TODO | TODO | TODO |
| Puppies | TODO | TODO | TODO | TODO |

## Known gaps
No automated tests. Large JS bundle. Images are served unoptimised. TODO: add anything that differs from the reference.