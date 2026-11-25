import { useMemo, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Breed, Puppy } from '../types/puppy'
import PuppySketch from './PuppySketch'
import RevealScope from './RevealScope'
import Teddy from './Teddy'
import './PuppyBrowser.css'

type FilterKey = 'origin' | 'breed' | 'gender' | 'collection'
const KEYS: FilterKey[] = ['origin', 'breed', 'gender', 'collection']

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="tp-sticker-chip">
      {children}
    </button>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tp-filter-row">
      <span className="tp-filter-row__label font-scrawl">{label}</span>
      {children}
    </div>
  )
}

interface Props {
  puppies: Puppy[]
  breeds: Breed[]
  /** Where "Ask on WhatsApp" goes. Kept internal (/contact) until the real WhatsApp destination is confirmed. */
  askHref: string
}

/** Filter chips (synced to ?origin=&breed=&gender=&collection=) + the sketch grid + empty state. */
export default function PuppyBrowser({ puppies, breeds, askHref }: Props) {
  const [params, setParams] = useSearchParams()
  const f = {
    origin: params.get('origin') ?? '',
    breed: params.get('breed') ?? '',
    gender: params.get('gender') ?? '',
    collection: params.get('collection') ?? '',
  }

  const toggle = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(params)
    if (value && f[key] !== value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  const shown = useMemo(
    () =>
      puppies.filter(
        (p) =>
          (!f.origin || p.origin.slug === f.origin) &&
          (!f.breed || p.breeds.some((b) => b.slug === f.breed)) &&
          (!f.gender || p.gender === f.gender || p.gender === 'male-female') &&
          (!f.collection || p.collections.some((c) => c.slug === f.collection)),
      ),
    [puppies, f.origin, f.breed, f.gender, f.collection],
  )

  const filtered = KEYS.some((k) => f[k])
  const breedChips = breeds.filter((b) => puppies.some((p) => p.breeds.some((x) => x.slug === b.slug)))
  const hasKorean = puppies.some((p) => p.collections.some((c) => c.slug === 'korean-teacup'))
  const hasLocal = puppies.some((p) => p.origin.slug === 'local')

  return (
    <div>
      <div role="group" aria-label="Filter puppies" className="tp-sketchpad tp-filters">
        <Row label="where">
          <Chip active={!f.origin && !f.collection} onClick={clearAll}>
            Everywhere
          </Chip>
          {hasLocal && (
            <Chip active={f.origin === 'local'} onClick={() => toggle('origin', 'local')}>
              In Dubai
            </Chip>
          )}
          <Chip active={f.origin === 'imported'} onClick={() => toggle('origin', 'imported')}>
            Imported
          </Chip>
          {hasKorean && (
            <Chip active={f.collection === 'korean-teacup'} onClick={() => toggle('collection', 'korean-teacup')}>
              Korean Teacup
            </Chip>
          )}
        </Row>
        <Row label="breed">
          {breedChips.map((b) => (
            <Chip key={b.slug} active={f.breed === b.slug} onClick={() => toggle('breed', b.slug)}>
              {b.name}
            </Chip>
          ))}
        </Row>
        <Row label="boy or girl">
          <Chip active={f.gender === 'male'} onClick={() => toggle('gender', 'male')}>
            Boys
          </Chip>
          <Chip active={f.gender === 'female'} onClick={() => toggle('gender', 'female')}>
            Girls
          </Chip>
          {filtered && (
            <button type="button" onClick={clearAll} className="link-ink tp-filters__clear">
              Clear filters
            </button>
          )}
        </Row>
      </div>

      <p className="font-scrawl tp-count" aria-live="polite">
        {shown.length === 1 ? '1 puppy' : `${shown.length} puppies`} {filtered ? 'match' : 'looking for a home'}
      </p>

      {shown.length ? (
        <RevealScope>
          <ul className="tp-sketches tp-sketches--grid">
            {shown.map((p, i) => (
              <li key={p.id}>
                <PuppySketch puppy={p} index={i} />
              </li>
            ))}
          </ul>
        </RevealScope>
      ) : (
        <div className="tp-sketchpad tp-empty">
          <Teddy className="tp-empty__teddy" label="Teddy, tilting his head" />
          <div>
            <p className="font-plush text-big">No puppies match just now.</p>
            <p className="tp-empty__text">
              Tell us what you're hoping for and we'll let you know what's in our showroom or what we can bring in for
              you.
            </p>
            <div className="tp-empty__actions">
              <Link to={askHref} className="btn btn-whatsapp">
                Ask on WhatsApp
              </Link>
              <button type="button" onClick={clearAll} className="btn btn-ghost">
                Show all puppies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
