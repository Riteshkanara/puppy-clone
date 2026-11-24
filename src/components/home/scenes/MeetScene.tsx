import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import PupBuddy from '../PupBuddy'
import Door from '../Door'
import { doors } from '../../../data/homeDoors'
import { useMeetRun } from '../../../hooks/useMeetRun'

/**
 * Home → "Meet the pups". Same markup as the original.
 * On wide screens the section pins and the hall slides sideways as you scroll, each door opening as it
 * passes (see hooks/useMeetRun.ts). Teddy here is the page-wide Teddy, not a copy: the stop below is
 * only his place — he sits there on small screens and walks on the spot (`treadmill`) while pinned.
 */
export default function MeetScene() {
  const pin = useRef<HTMLDivElement>(null)
  const hall = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const pinned = useMeetRun({ pin, hall, track })

  return (
    <section
      data-pup-scene="true"
      data-tone="light"
      data-pinned={pinned || undefined}
      className="tp-scene tp-meet"
      style={{ '--sky-top': '#fff1d8', '--sky-bottom': '#fbe3b4' } as CSSProperties}
      aria-labelledby="meet-title"
    >
      <div ref={pin} data-pin-range="true" style={{ '--pinned': pinned ? '1' : '0' } as CSSProperties}>
        <div className="tp-meet__stage">
          <header className="tp-meet__head gutter">
            <div>
              <h2 id="meet-title" className="font-plush text-huge">
                Meet the pups
              </h2>
              <p className="text-lede mt-3 max-w-[44ch] text-[var(--ink-soft)]">
                Real puppies, real photos, looking for their families right now.
              </p>
            </div>
            <Link to="/puppies" className="btn btn-primary shrink-0">
              See all available puppies
            </Link>
          </header>
          <div ref={hall} className="tp-meet__hall">
            <ol ref={track} className="tp-meet__track" data-treadmill="true" aria-label="Puppies looking for a family">
              {doors.map((d) => (
                <Door key={d.slug} d={d} />
              ))}
              <li className="tp-door tp-door--all" data-open="true">
                <Link className="tp-door__link" to="/puppies">
                  <span className="tp-door__frame tp-door__frame--all">
                    <span className="font-plush tp-door__all">Meet them all</span>
                  </span>
                </Link>
              </li>
            </ol>
            <div aria-hidden="true" className="tp-meet__floor"></div>
            <div
              data-pup-stop="true"
              data-pose={pinned ? 'walk' : 'sit'}
              data-act={pinned ? 'treadmill' : undefined}
              data-facing="right"
              className="pup-stop tp-meet__teddy"
            >
              <PupBuddy n={1} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
