import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { CONTACT } from '../../data/contactDetails'
import { deliverLetter, validateLetter } from '../../lib/letter'
import type { LetterErrors, LetterValues } from '../../lib/letter'
import type { PuppyOption } from '../../lib/puppyOptions'
import { PawIcon } from './ShowroomCard'
import { Envelope, PostBox } from './PostScene'

type Phase = 'writing' | 'sealing' | 'posting' | 'sent'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Blank({ size, children }: { size: string; children: ReactNode }) {
  return (
    <span className="tp-blank" style={{ '--size': size } as CSSProperties}>
      {children}
    </span>
  )
}

/** ⚠ Sent copy for "whatsapp"/"email" is mine (original unknown); "endpoint" reuses the original enquiry success text. */
function sentCopy(): { heading: string; body: string } {
  switch (CONTACT.delivery.mode) {
    case 'whatsapp':
      return { heading: 'Almost there!', body: 'Your letter is open in WhatsApp — press send there and our team will get back to you promptly.' }
    case 'email':
      return { heading: 'Almost there!', body: 'Your letter is ready in your email app — press send and our team will get back to you promptly.' }
    default:
      return { heading: 'Message received!', body: 'Thank you — our team will get back to you promptly.' }
  }
}

export default function LetterForm({ puppyOptions }: { puppyOptions: PuppyOption[] }) {
  const [phase, setPhase] = useState<Phase>('writing')
  const [errors, setErrors] = useState<LetterErrors>({})
  const [notice, setNotice] = useState<string | null>(null)
  const alive = useRef(true)
  const sentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (phase === 'sent') sentRef.current?.focus()
  }, [phase])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phase !== 'writing') return
    const form = e.currentTarget
    const fd = new FormData(form)
    const text = (k: string) => (typeof fd.get(k) === 'string' ? (fd.get(k) as string) : '')
    const select = form.elements.namedItem('puppy') as HTMLSelectElement | null
    const values: LetterValues = {
      name: text('name'),
      phone: text('phone'),
      email: text('email'),
      area: text('area'),
      puppy: text('puppy'),
      puppyLabel: select?.selectedOptions[0]?.text ?? '',
      message: text('message'),
      website: text('website'),
    }

    const found = validateLetter(values)
    setErrors(found)
    setNotice(null)
    const first = (['name', 'phone', 'email', 'area', 'message'] as const).find((k) => found[k])
    if (first) {
      ;(form.elements.namedItem(first) as HTMLElement | null)?.focus()
      return
    }

    const motion = !reducedMotion()
    setPhase('sealing')
    // Bots fill the hidden "website" field: pretend it worked, send nothing.
    const delivery = values.website ? Promise.resolve({ ok: true as const }) : deliverLetter(values)
    const [result] = await Promise.all([delivery, wait(motion ? 1100 : 0)])
    if (!alive.current) return
    if (!result.ok) {
      setPhase('writing')
      setNotice(result.message)
      return
    }
    setPhase('posting')
    await wait(motion ? 1500 : 0)
    if (alive.current) setPhase('sent')
  }

  if (phase === 'sent') {
    const copy = sentCopy()
    return (
      <div id="letter" className="tp-post" data-phase="sent">
        <div ref={sentRef} className="tp-post__sent" role="status" tabIndex={-1}>
          <PostBox sent />
          <p className="font-plush tp-post__sent-title">{copy.heading}</p>
          <p className="tp-post__sent-body">{copy.body}</p>
          <button type="button" className="btn btn-ghost" onClick={() => setPhase('writing')}>
            Write another letter
          </button>
        </div>
      </div>
    )
  }

  const busy = phase !== 'writing'
  const problems = Object.values(errors)

  return (
    <div id="letter" className="tp-post" data-phase={phase}>
      <form className="tp-letterform" onSubmit={onSubmit} noValidate aria-busy={busy}>
        <span className="tp-letter__stamp" aria-hidden="true">
          <PawIcon className="tp-letter__paw" />
        </span>

        <p className="font-scrawl tp-letterform__greeting">Dear TeddyPups,</p>

        <p className="tp-letterform__line">
          my name is{' '}
          <Blank size="12rem">
            <input name="name" type="text" autoComplete="name" maxLength={80} aria-label="Your name" aria-invalid={!!errors.name} />
          </Blank>
          , and you can reach me on{' '}
          <Blank size="11.5rem">
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+971 50 123 4567"
              aria-label="Phone or WhatsApp number, with country code"
              aria-invalid={!!errors.phone}
            />
          </Blank>{' '}
          or by email at{' '}
          <Blank size="15rem">
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="optional"
              aria-label="Email (optional)"
              aria-invalid={!!errors.email}
            />
          </Blank>
          .
        </p>

        <p className="tp-letterform__line">
          I live in{' '}
          <Blank size="10rem">
            <input
              name="area"
              type="text"
              autoComplete="address-level2"
              maxLength={80}
              placeholder="e.g. Dubai Marina"
              aria-label="Your area (optional)"
              aria-invalid={!!errors.area}
            />
          </Blank>
          , and I&rsquo;m curious about{' '}
          <span className="tp-blank tp-blank--select" style={{ '--size': '20ch' } as CSSProperties}>
            <select name="puppy" defaultValue="" aria-label="The puppy you’re curious about">
              <option value="">any puppy (not sure yet)</option>
              {puppyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </span>
          .
        </p>

        <textarea
          name="message"
          className="tp-letterform__note"
          rows={4}
          maxLength={2000}
          placeholder="Anything else you’d like to tell us…"
          aria-label="Anything else you’d like to tell us (optional)"
          aria-invalid={!!errors.message}
        />

        <div className="tp-letterform__honey" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {(problems.length > 0 || notice) && (
          <div className="tp-letterform__alert" role="alert">
            {notice ? (
              <p className="font-semibold">{notice}</p>
            ) : (
              <>
                <p className="font-semibold">Almost there — a few things to fix:</p>
                <ul>
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="tp-letterform__sign">
          <p className="font-scrawl">with love, a future puppy parent</p>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Posting…' : 'Post my letter'}
          </button>
        </div>
      </form>

      {busy && (
        <div className="tp-post__scene" aria-hidden="true">
          <Envelope />
          <PostBox />
        </div>
      )}
    </div>
  )
}
