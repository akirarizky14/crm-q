import { apiFetch } from './client'

export interface SiteSettings {
  heroEyebrow: string
  heroHeadline: string
  heroSubheadline: string
  heroCtaLabel: string
  heroCtaWhatsapp: string
  contactWhatsapp: string
  contactEmail: string
  contactAddress: string
  contactHours: string
  heroImage?: string
  navbarLogo?: string
  navbarCtaLabel?: string
  footerTagline?: string
  footerSecondaryWhatsapp?: string
  footerInstagram?: string
  footerMapsUrl?: string
  footerCopyright?: string
  clientsLogos?: { id: string; imageUrl: string; alt: string }[]
  exploreCards?: { category: string; name: string; imageUrl: string }[]
  steps?: { number: string; imageUrl: string; desc: string; note?: string }[]
  testimonials?: { id: string; name: string; role: string; quote: string; initials: string }[]
  whyUsCards?: { title: string; desc: string }[]
}

export function fetchSiteSettings() {
  return apiFetch<SiteSettings>('/api/site-settings')
}

export function updateSiteSettings(patch: Partial<SiteSettings>) {
  return apiFetch<SiteSettings>('/api/site-settings', {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}
