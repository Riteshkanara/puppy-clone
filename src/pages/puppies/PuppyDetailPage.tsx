import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./PuppyDetailPage.css";

const media = {
  photo: "https://puppy.instabizweb.com/media/Z0ToauDx7Eve/5fffe4d022/b942a5_4b8cfb8204d24eadaf524332aba1dc15-mv2.webp",
  video: "https://puppy.instabizweb.com/media/jNYYlZcF2IuE/61af7a5e09/b942a5_a1fa75c7bf2f4d688ec0ce0344baef67.mp4",
  poster: "https://puppy.instabizweb.com/media/RH7J577OfQ7f/e776d07dbd/b942a5_a1fa75c7bf2f4d688ec0ce0344baef67f000.jpg",
};

const puppy = {
  slug: "maltipoo-max-male",
  name: "Max",
  breed: "Maltipoo",
  gender: "Boy",
  age: "3 months",
  where: "Imported for you",
  status: "Available",
};

const homeSteps = [
  { title: "Reserve your puppy", body: "Tell us which puppy has captured your heart." },
  { title: "Personalized consultation", body: "We finalize details with you and share updates on your puppy's journey." },
  { title: "Import and arrival", body: "We manage health checks, travel arrangements, and documentation." },
  { title: "Welcome home", body: "We help your new puppy settle in and ensure a smooth transition into your home." },
];

const included = [
  "Vaccinated",
  "Dewormed",
  "Verified health certificate from licensed vets",
  "Thoroughly checked before joining your family",
];

function Chapter({ number, children }: { number: string; children: string }) {
  return (
    <p className="puppy-chapter">
      <span className="puppy-chapter-number" aria-hidden="true">{number}</span>
      <span>{children}</span>
    </p>
  );
}

function PuppyDetailPage() {
  const { slug } = useParams();
  const [selectedMedia, setSelectedMedia] = useState<"photo" | "video">("video");
  const [submitted, setSubmitted] = useState(false);

  if (slug !== puppy.slug) {
    return (
      <section className="puppy-not-found">
        <span className="puppy-eyebrow">A little detour</span>
        <h1>We couldn't find this puppy.</h1>
        <p>This puppy page may have moved, or this little one may already have found a family.</p>
        <Link className="puppy-button" to="/puppies">Meet all puppies</Link>
      </section>
    );
  }

  return (
    <article className="puppy-detail-page">
      <div className="puppy-detail-container">
        <nav className="puppy-breadcrumb" aria-label="Breadcrumb">
          <Link to="/puppies">← All puppies</Link>
        </nav>

        <section className="puppy-intro" aria-labelledby="puppy-title">
          <div className="puppy-gallery">
            <div className="puppy-gallery-stage">
              {selectedMedia === "video" ? (
                <video
                  key={media.video}
                  className="puppy-gallery-video"
                  src={media.video}
                  poster={media.poster}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="Video of Max, male Maltipoo puppy"
                />
              ) : (
                <img className="puppy-gallery-image" src={media.photo} alt="Max, male Maltipoo puppy" />
              )}
              <span className="puppy-gallery-count">{selectedMedia === "video" ? "A little hello from Max" : "Max, in a moment"}</span>
            </div>
            <div className="puppy-gallery-thumbs" aria-label="Choose a photo or video">
              <button
                className={`puppy-thumb ${selectedMedia === "photo" ? "is-active" : ""}`}
                type="button"
                onClick={() => setSelectedMedia("photo")}
                aria-label="Show Max's photo"
                aria-pressed={selectedMedia === "photo"}
              >
                <img src={media.photo} alt="" />
              </button>
              <button
                className={`puppy-thumb puppy-thumb-video ${selectedMedia === "video" ? "is-active" : ""}`}
                type="button"
                onClick={() => setSelectedMedia("video")}
                aria-label="Play Max's video"
                aria-pressed={selectedMedia === "video"}
              >
                <img src={media.poster} alt="" />
                <span aria-hidden="true">▶</span>
              </button>
            </div>
          </div>

          <div className="puppy-intro-copy">
            <span className="puppy-eyebrow">A little one from TeddyPups</span>
            <span className="puppy-status"><i aria-hidden="true" />{puppy.status}</span>
            <h1 id="puppy-title">{puppy.name}</h1>
            <p className="puppy-breed">{puppy.breed}</p>
            <dl className="puppy-facts">
              <div><dt>Gender</dt><dd>{puppy.gender}</dd></div>
              <div><dt>Age</dt><dd>{puppy.age}</dd></div>
              <div><dt>Where</dt><dd>{puppy.where}</dd></div>
            </dl>
            <div className="puppy-intro-actions">
              <Link className="puppy-button" to="/contact">Ask about a puppy like this</Link>
              <p>Want to know more? Get in touch with our team.</p>
            </div>
          </div>
        </section>

        <section className="puppy-included" aria-labelledby="puppy-included-title">
          <div className="puppy-included-card">
            <Chapter number="2">what comes with Max</Chapter>
            <h2 id="puppy-included-title">Every Teddy Pup comes</h2>
            <ul>
              {included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="puppy-journey" aria-labelledby="puppy-journey-title">
          <Chapter number="3">the way home</Chapter>
          <h2 id="puppy-journey-title">Coming home from abroad</h2>
          <ol className="puppy-journey-steps">
            {homeSteps.map((step, index) => (
              <li key={step.title}>
                <span className="puppy-step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="puppy-enquiry" id="enquire-maltipoo-max-male" aria-labelledby="puppy-enquiry-title">
          <div className="puppy-enquiry-intro">
            <Chapter number="4">dear TeddyPups…</Chapter>
            <h2 id="puppy-enquiry-title">Ask about Max</h2>
            <p>Leave your details and our team will get back to you promptly — or message us on WhatsApp for the quickest reply.</p>
          </div>
          <div className="puppy-enquiry-form-wrap">
            {submitted ? (
              <div className="puppy-form-success" role="status">
                <h3>Thank you for your interest in Max!</h3>
                <p>Please contact our team directly to complete your enquiry.</p>
                <Link to="/contact">Visit &amp; contact</Link>
              </div>
            ) : (
              <form className="puppy-enquiry-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                <label>Your name<input name="name" autoComplete="name" required placeholder="Your name" /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                <label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" placeholder="Your number (optional)" /></label>
                <label>Message<textarea name="message" rows={4} defaultValue="Hi TeddyPups, I'd love to know more about Max." /></label>
                <button className="puppy-button" type="submit">Send an enquiry</button>
                <p className="puppy-form-note">This local demo form does not send personal information. Please use the contact page to reach the team.</p>
              </form>
            )}
          </div>
        </section>

        <nav className="puppy-more-nav" aria-label="More puppies">
          <Link to="/puppies" className="puppy-more-card"><span>← Back to</span><strong>All puppies</strong></Link>
          <Link to="/puppies" className="puppy-more-card puppy-more-next"><span>Keep looking</span><strong>Meet more little ones →</strong></Link>
        </nav>
      </div>
    </article>
  );
}

export default PuppyDetailPage;
