import { useMemo } from 'react'
import './ContactPage.css'
import { CONTACT, whatsappHref } from '../data/contactDetails'
import { getPuppyOptions } from '../lib/puppyOptions'
import ContactPup from '../components/contact/ContactPup'
import LetterForm from '../components/contact/LetterForm'
import ShowroomCard from '../components/contact/ShowroomCard'

export default function ContactPage() {
  const puppyOptions = useMemo(() => getPuppyOptions(), [])
  // No WhatsApp number yet → the button scrolls to the letter instead of linking to someone else's number.
  const wa = whatsappHref()

  return (
    <div className="tp-contact" data-page="contact">
      <header className="tp-contact__head">
        <h1 className="font-plush tp-contact__title">
          <span>Get in touch</span> <span>with us</span>
        </h1>
        <p className="tp-contact__lede">
          Have questions about our puppies or adoption process? Fill out the form, and our team will get back to you
          promptly. Whether ready to adopt or just seeking info, we&rsquo;d love to hear from you!
        </p>
      </header>

      <div className="tp-contact__grid">
        <div className="tp-contact__letter">
          <LetterForm puppyOptions={puppyOptions} />
          <ContactPup className="tp-contact__pup" />
        </div>

        <div className="tp-contact__info">
          <a
            className="btn btn-whatsapp"
            href={wa ?? '#letter'}
            {...(wa ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            WhatsApp {CONTACT.whatsapp.display}
          </a>
          <dl className="tp-contact__ways">
            <div>
              <dt className="font-scrawl">call us</dt>
              <dd>
                <a className="link-ink" href={`tel:${CONTACT.phone.tel}`}>
                  {CONTACT.phone.display}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-scrawl">email</dt>
              <dd>
                <a className="link-ink" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <ShowroomCard />
      </div>
    </div>
  )
}
