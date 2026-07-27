import { useState } from 'react'
import { defaultLandingContent, type LandingContent } from '../data/landing'

const STORAGE_KEY = 'crown-crm-landing'

function readContent(): LandingContent {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultLandingContent
  try {
    const parsed = JSON.parse(raw) as Partial<LandingContent>
    return {
      hero: { ...defaultLandingContent.hero, ...parsed.hero },
      contact: { ...defaultLandingContent.contact, ...parsed.contact },
    }
  } catch {
    return defaultLandingContent
  }
}

function writeContent(content: LandingContent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(readContent)

  function updateHero(partial: Partial<LandingContent['hero']>) {
    setContent((prev) => {
      const next = { ...prev, hero: { ...prev.hero, ...partial } }
      writeContent(next)
      return next
    })
  }

  function updateContact(partial: Partial<LandingContent['contact']>) {
    setContent((prev) => {
      const next = { ...prev, contact: { ...prev.contact, ...partial } }
      writeContent(next)
      return next
    })
  }

  function resetToDefault() {
    writeContent(defaultLandingContent)
    setContent(defaultLandingContent)
  }

  return { content, updateHero, updateContact, resetToDefault }
}
