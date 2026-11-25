import PupMascot from '../PupMascot'

/** Seated Teddy under the letter on /contact — the live original-rig mascot, facing the letter. */
export default function ContactPup({ className }: { className?: string }) {
  return <PupMascot pose="sit" facing="left" className={className} label="Teddy the puppy, sitting politely" />
}
