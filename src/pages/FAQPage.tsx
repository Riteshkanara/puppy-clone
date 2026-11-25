import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PupMascot from "../components/PupMascot";
import { faqItems, type FaqItem } from "../data/faq";
import "./FAQPage.css";

function SearchIcon() {
  return (
    <svg className="faq-search__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M15.5 15.5 21 21" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="faq-note__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface NoteProps {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}

function FaqNote({ item, open, onToggle }: NoteProps) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const buttonId = `${uid}-button`;

  return (
    <li className={`faq-note${open ? " is-open" : ""}`}>
      <span className="faq-note__pin" aria-hidden="true" />
      <h2 className="faq-note__heading">
        <button
          type="button"
          id={buttonId}
          className="faq-note__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="faq-note__question">{item.question}</span>
          <Chevron />
        </button>
      </h2>
      <div id={panelId} role="region" aria-labelledby={buttonId} className="faq-note__panel">
        <div className="faq-note__panel-inner">
          <div className="faq-note__answer">
            {item.answer.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
      <span className="faq-note__fold" aria-hidden="true" />
    </li>
  );
}

function FAQPage() {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(new Set());

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter((item) => `${item.question} ${item.answer.join(" ")}`.toLowerCase().includes(q));
  }, [query]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="faq-page">
      <section className="faq-hero">
        <h1 className="faq-title font-plush text-giant">Questions &amp; answers</h1>
        <p className="faq-lede text-lede">
          Can&rsquo;t find what you&rsquo;re looking for? Message us on WhatsApp &mdash; our team is available 24/7.
        </p>
      </section>

      <div className="faq-layout">
        <div className="faq-tools">
          <label className="faq-tools__label font-scrawl" htmlFor="faq-search">
            sniff out a question
          </label>

          <div className="faq-search">
            <SearchIcon />
            <input
              id="faq-search"
              className="faq-search__input"
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="delivery, Korea, vaccinated…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <p className="faq-tools__count" aria-live="polite">
            {visible.length} {visible.length === 1 ? "note" : "notes"} on the board
          </p>

          <div className="faq-tools__teddy">
            <span className="faq-tools__bubble" aria-hidden="true">
              <span className="faq-tools__mark faq-tools__mark--q">?</span>
              <span className="faq-tools__mark faq-tools__mark--x">!</span>
            </span>
            <PupMascot pose="sit" facing="right" label="Teddy, the TeddyPups puppy, wondering" style={{ display: "block", width: "88%", height: "auto" }} />
          </div>

          <Link to="/contact" className="btn btn-whatsapp faq-tools__ask">
            Ask your own question
          </Link>
        </div>

        <div className="faq-board">
          <div className="faq-board__cork">
            {visible.length > 0 ? (
              <ul className="faq-board__list">
                {visible.map((item) => (
                  <FaqNote key={item.id} item={item} open={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
                ))}
              </ul>
            ) : (
              <p className="faq-board__empty">No notes match &ldquo;{query.trim()}&rdquo;.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;
