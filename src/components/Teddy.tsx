import PupMascot from './PupMascot'
import './Teddy.css'

/**
 * Teddy as used on page heroes / empty states: the live original-rig mascot (see PupMascot).
 *   pose "sit"  – full body sitting (Puppies self-portrait, empty states, sign-offs)
 *   pose "peek" – head + paws over a ledge (Gone-home ticket booth)
 */
interface Props {
  facing?: 'left' | 'right'
  pose?: 'sit' | 'peek'
  label?: string
  className?: string
}

export default function Teddy({ facing = 'right', pose = 'sit', label = 'Teddy, the TeddyPups puppy', className = '' }: Props) {
  return <PupMascot pose={pose} facing={facing} label={label} className={`teddy ${className}`.trim()} />
}
