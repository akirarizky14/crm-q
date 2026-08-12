import { apiFetch } from './client'
import type { BlogPost } from '../data/mock'

export function fetchBlogPosts() {
  return apiFetch<BlogPost[]>('/api/blog-posts')
}

export function createBlogPost(post: Omit<BlogPost, 'slug'> & { slug?: string }) {
  return apiFetch<BlogPost>('/api/blog-posts', {
    method: 'POST',
    body: JSON.stringify(post),
  })
}

export function updateBlogPost(slug: string, patch: Partial<Omit<BlogPost, 'slug'>>) {
  return apiFetch<BlogPost>(`/api/blog-posts/${slug}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteBlogPost(slug: string) {
  return apiFetch<void>(`/api/blog-posts/${slug}`, { method: 'DELETE' })
}
