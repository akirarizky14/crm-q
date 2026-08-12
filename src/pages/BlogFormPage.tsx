import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { RichTextEditor } from '../components/blog/RichTextEditor'
import type { BlogPost } from '../data/mock'
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../api/blog'
import { paragraphsToHtml, htmlToParagraphs } from '../lib/blogContent'
import './BlogFormPage.css'

const CATEGORIES = [
  'Tips Berkendara',
  'Perawatan Mobil',
  'Rekomendasi',
  'Berita',
  'Panduan Sewa',
]

function emptyPost(): Omit<BlogPost, 'slug'> {
  return {
    title: '',
    category: CATEGORIES[0],
    excerpt: '',
    content: [],
    author: '',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    image: '',
  }
}

export function BlogFormPage() {
  const { slug } = useParams<{ slug: string }>()
  const isNew = !slug || slug === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState<Omit<BlogPost, 'slug'>>(emptyPost())
  const [initialHtml, setInitialHtml] = useState('')
  const [contentHtml, setContentHtml] = useState('')

  useEffect(() => {
    if (isNew) return
    fetchBlogPosts()
      .then((posts) => {
        const found = posts.find((p) => p.slug === slug)
        if (!found) {
          setError('Artikel tidak ditemukan.')
          return
        }
        setForm(found)
        const html = paragraphsToHtml(found.content)
        setInitialHtml(html)
        setContentHtml(html)
      })
      .catch(() => setError('Gagal memuat artikel.'))
      .finally(() => setLoading(false))
  }, [slug, isNew])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim()) return

    const content = htmlToParagraphs(contentHtml)
    const payload = { ...form, content }

    const request = isNew ? createBlogPost(payload) : updateBlogPost(slug!, payload)
    request
      .then((saved) => {
        setForm(saved)
        const html = paragraphsToHtml(saved.content)
        setInitialHtml(html)
        setContentHtml(html)
        navigate(`/blog/${saved.slug}`, { replace: true })
      })
      .catch(() => setError('Gagal menyimpan artikel.'))
  }

  function handleDelete() {
    if (!slug) return
    deleteBlogPost(slug)
      .then(() => navigate('/blog', { replace: true }))
      .catch(() => setError('Gagal menghapus artikel.'))
  }

  if (loading) {
    return <p className="kanban-empty">Memuat artikel...</p>
  }

  return (
    <div className="blog-form-page">
      <Link to="/blog" className="blog-back-link">
        <ArrowLeft size={15} /> Kembali ke Blog
      </Link>

      <Card className="blog-form-card">
        {error && <p className="login-error">{error}</p>}

        <form className="blog-form" onSubmit={handleSubmit}>
          <label className="blog-field">
            <span>Judul</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul artikel"
              required
            />
          </label>

          <div className="blog-field-row">
            <label className="blog-field">
              <span>Kategori</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="blog-field">
              <span>Penulis</span>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Nama penulis"
                required
              />
            </label>
          </div>

          <div className="blog-field-row">
            <label className="blog-field">
              <span>Tanggal</span>
              <input
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="24 Jul 2026"
              />
            </label>
            <label className="blog-field">
              <span>URL Gambar (opsional)</span>
              <input
                value={form.image ?? ''}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="blog-field">
            <span>Ringkasan (opsional)</span>
            <input
              value={form.excerpt ?? ''}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Ringkasan singkat untuk daftar artikel"
            />
          </label>

          <label className="blog-field">
            <span>Isi Artikel</span>
            <RichTextEditor key={slug ?? 'new'} initialHtml={initialHtml} onChange={setContentHtml} />
          </label>

          <div className="blog-form-actions">
            <Button type="submit">{isNew ? 'Terbitkan Artikel' : 'Simpan Perubahan'}</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/blog')}>
              Batal
            </Button>
            {!isNew && (
              <button
                type="button"
                className="blog-delete-link"
                onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
              >
                <Trash2 size={14} /> {confirmDelete ? 'Yakin hapus?' : 'Hapus Artikel'}
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
