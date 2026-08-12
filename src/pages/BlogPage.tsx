import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Newspaper, Plus, Trash2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { BlogPost } from '../data/mock'
import { fetchBlogPosts, deleteBlogPost } from '../api/blog'
import './BlogPage.css'

const PAGE_SIZE = 10

function formatDateShort(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlogPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  function load() {
    fetchBlogPosts()
      .then(setPosts)
      .catch(() => setError('Gagal memuat artikel blog dari server.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedPosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleDelete(e: React.MouseEvent, slug: string) {
    e.stopPropagation()
    if (!window.confirm('Hapus artikel ini?')) return
    deleteBlogPost(slug)
      .then(load)
      .catch(() => setError('Gagal menghapus artikel.'))
  }

  return (
    <div className="blog-page">
      {loading && <p className="kanban-empty">Memuat artikel...</p>}
      {error && <p className="login-error">{error}</p>}

      <div className="blog-toolbar">
        <Button type="button" onClick={() => navigate('/blog/new')}>
          <Plus size={15} /> Tulis Artikel
        </Button>
        <span className="blog-count">{posts.length} artikel</span>
      </div>

      <div className="blog-grid">
        {paginatedPosts.map((post) => (
          <Card
            key={post.slug}
            className="blog-card blog-card-clickable"
            onClick={() => navigate(`/blog/${post.slug}`)}
          >
            <div className="blog-card-media">
              {post.image ? (
                <img src={post.image} alt={post.title} className="blog-media-image" />
              ) : (
                <Newspaper size={40} className="blog-media-icon" />
              )}
              <span className="blog-category-badge">{post.category}</span>
              <button
                type="button"
                className="blog-delete-btn"
                onClick={(e) => handleDelete(e, post.slug)}
                title="Hapus artikel"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="blog-card-body">
              <h3>{post.title}</h3>
              {post.excerpt && <p className="blog-excerpt">{post.excerpt}</p>}
              <div className="blog-meta">
                <span>{post.author}</span>
                <span className="blog-meta-sep">•</span>
                <span>{formatDateShort(post.date)}</span>
              </div>
            </div>
          </Card>
        ))}
        {!loading && posts.length === 0 && <p className="kanban-empty">Belum ada artikel.</p>}
      </div>

      {totalPages > 1 && (
        <div className="blog-pagination">
          <button
            type="button"
            className="blog-page-btn"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} /> Sebelumnya
          </button>
          <span className="blog-page-indicator">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            type="button"
            className="blog-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Selanjutnya <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
