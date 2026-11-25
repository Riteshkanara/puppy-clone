import { useRef, useState } from 'react'

interface Props {
  src: string
  poster: string
  label: string
}

/** Short video inside the WhatsApp chat mock-up: tap the round button to play / pause. */
export default function Clip({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      void video.play().then(() => setPlaying(true), () => setPlaying(false))
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="tp-clip">
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label} onEnded={() => setPlaying(false)}></video>
      <button
        type="button"
        className="tp-clip__play"
        aria-pressed={playing}
        aria-label={playing ? 'Pause video' : 'Play video'}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={playing ? 'M7 5h3v14H7zM14 5h3v14h-3z' : 'M8 5v14l11-7z'} />
        </svg>
      </button>
    </div>
  )
}
