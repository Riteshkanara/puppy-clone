/**
 * Single source of truth for TeddyPups contact details (used by /contact).
 *
 * ⚠ NOTHING HERE IS CONFIRMED BUSINESS DATA YET.
 * The values below are exactly what the ORIGINAL demo site displays
 * (puppy.instabizweb.com, a template host). Replace each `TODO` with the real
 * TeddyPups value. Never copy the wa.me number found in the recon payload:
 * it belongs to the template builder.
 */

export type DeliveryMode = 'whatsapp' | 'email' | 'endpoint' | null

export interface ContactConfig {
  /** Phone shown on the "call us" line. `tel` = digits only with +, for the tel: link. */
  phone: { display: string; tel: string }
  /** WhatsApp number in international format, digits only (e.g. "9715XXXXXXXX"). null = not provided yet. */
  whatsapp: { number: string | null; display: string; greeting: string }
  email: string
  /** Shown in the showroom card and used for the default Google Maps search link. */
  address: string
  /** Exact Google Maps share link. null = fall back to a Maps search for `address`. */
  mapsUrl: string | null
  /** Where the letter goes. null = form is built but sending is disabled. */
  delivery: {
    mode: DeliveryMode
    /** Only for mode "endpoint": URL that accepts a JSON POST. */
    endpoint: string | null
  }
}

export const CONTACT: ContactConfig = {
  // TODO: real phone. Original shows +971 50 000 0000 (tel:+971500000000).
  phone: { display: '+971 50 000 0000', tel: '+971500000000' },
  // TODO: real WhatsApp number. Greeting text is the original's own wording.
  whatsapp: {
    number: null,
    display: '+971 50 000 0000',
    greeting: "Hi TeddyPups! I'd love to know more about your puppies.",
  },
  // TODO: real email. Original shows the template host's address.
  email: 'info@instabizweb.com',
  // Original: "Downtown Dubai, United Arab Emirates" (no street address).
  // TODO: add the full showroom address if you want one shown.
  address: 'Downtown Dubai, United Arab Emirates',
  mapsUrl: null,
  // TODO: choose how letters are delivered (see PROJECT_HANDOFF §8).
  delivery: { mode: null, endpoint: null },
}

export function whatsappHref(message: string = CONTACT.whatsapp.greeting): string | null {
  const n = CONTACT.whatsapp.number?.replace(/\D/g, '')
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : null
}

export function mapsHref(): string {
  return (
    CONTACT.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`
  )
}
