import { CONTACT, whatsappHref } from '../data/contactDetails'

export interface LetterValues {
  name: string
  phone: string
  email: string
  area: string
  puppy: string
  puppyLabel: string
  message: string
  website: string // honeypot
}

export type LetterErrors = Partial<Record<'name' | 'phone' | 'email' | 'area' | 'message', string>>

/** Rules mirror the original EnquiryForm: name 2–80 (required), phone required, email optional, area ≤ 80, message ≤ 2000. */
export function validateLetter(v: LetterValues): LetterErrors {
  const e: LetterErrors = {}
  const name = v.name.trim()
  if (name.length < 2) e.name = 'Please tell us your name (at least 2 letters).'
  else if (name.length > 80) e.name = 'Your name is a bit long — 80 characters max.'
  const digits = v.phone.replace(/\D/g, '')
  if (!v.phone.trim()) e.phone = 'Please add a phone or WhatsApp number.'
  else if (digits.length < 7 || !/^[+\d\s()-]+$/.test(v.phone.trim()))
    e.phone = 'That number doesn’t look right — include the country code.'
  const email = v.email.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'That email doesn’t look right.'
  if (v.area.trim().length > 80) e.area = 'Your area is too long — 80 characters max.'
  if (v.message.length > 2000) e.message = 'Your note is too long — 2000 characters max.'
  return e
}

export function letterText(v: LetterValues): string {
  const lines = [
    'Dear TeddyPups,',
    '',
    `My name is ${v.name.trim()} and you can reach me on ${v.phone.trim()}.`,
    v.email.trim() ? `Email: ${v.email.trim()}` : '',
    v.area.trim() ? `I live in ${v.area.trim()}.` : '',
    `I'm curious about: ${v.puppy ? v.puppyLabel : 'any puppy (not sure yet)'}.`,
    v.message.trim() ? `\n${v.message.trim()}` : '',
    '\nWith love, a future puppy parent',
  ]
  return lines.filter((l) => l !== '').join('\n').trim()
}

export type DeliveryResult = { ok: true } | { ok: false; message: string }

/**
 * Hands the letter to the configured channel.
 * "whatsapp"/"email" navigate synchronously (popup blockers), before any await.
 */
export async function deliverLetter(v: LetterValues): Promise<DeliveryResult> {
  const { mode, endpoint } = CONTACT.delivery
  const text = letterText(v)

  if (mode === 'whatsapp') {
    const href = whatsappHref(text)
    if (!href) return { ok: false, message: 'WhatsApp isn’t set up yet — add the number in src/data/contactDetails.ts.' }
    window.open(href, '_blank', 'noopener,noreferrer')
    return { ok: true }
  }
  if (mode === 'email') {
    const subject = encodeURIComponent('A letter for TeddyPups')
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${encodeURIComponent(text)}`
    return { ok: true }
  }
  if (mode === 'endpoint' && endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: v.name.trim(),
          phone: v.phone.trim(),
          email: v.email.trim(),
          area: v.area.trim(),
          puppy: v.puppy,
          puppyLabel: v.puppy ? v.puppyLabel : '',
          message: v.message.trim(),
          letter: text,
        }),
      })
      return res.ok ? { ok: true } : { ok: false, message: 'We couldn’t post your letter just now. Please try again.' }
    } catch {
      return { ok: false, message: 'We couldn’t reach the post box — check your connection and try again.' }
    }
  }
  return {
    ok: false,
    message: 'Sending isn’t switched on yet. Please use WhatsApp, call or email for now.',
  }
}
