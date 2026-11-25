import { pupBuddies } from '../../data/pupBuddies'

/**
 * STATIC Teddy — a frozen snapshot of the original rig in the pose it has on first paint.
 * (The animated rig — poses, blinking, peek-a-boo, speech bubbles — is the separate "Teddy mascot" phase.)
 */
export default function PupBuddy({ n }: { n: number }) {
  const b = pupBuddies[n]
  return (
    <div className="pup-buddy" data-facing={b.facing}>
      <svg
        viewBox={b.viewBox}
        style={{ overflow: 'visible' }}
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: b.inner }}
      />
    </div>
  )
}
