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
