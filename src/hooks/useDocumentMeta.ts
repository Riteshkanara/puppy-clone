import { useEffect } from 'react'

/** Sets <title> and meta description for a page (no head-manager library needed). */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (!description) return
    let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = description
  }, [title, description])
}
