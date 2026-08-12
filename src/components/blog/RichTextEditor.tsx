import { useEffect, useRef, type ClipboardEvent } from 'react'
import { Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link, RemoveFormatting } from 'lucide-react'
import './rich-text-editor.css'

interface RichTextEditorProps {
  initialHtml: string
  onChange: (html: string) => void
}

export function RichTextEditor({ initialHtml, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.execCommand('defaultParagraphSeparator', false, 'p')
    if (ref.current) {
      ref.current.innerHTML = initialHtml || '<p><br></p>'
    }
    // Only sync on mount for this editor instance — parent remounts via `key` when switching records.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exec(command: string, value?: string) {
    ref.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
  }

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  function handleLink() {
    const url = window.prompt('URL tautan:')
    if (url) exec('createLink', url)
  }

  const buttons = [
    { icon: Bold, label: 'Tebal', onClick: () => exec('bold') },
    { icon: Italic, label: 'Miring', onClick: () => exec('italic') },
    { icon: Underline, label: 'Garis bawah', onClick: () => exec('underline') },
    { icon: Heading2, label: 'Judul Besar', onClick: () => exec('formatBlock', '<h2>') },
    { icon: Heading3, label: 'Judul Kecil', onClick: () => exec('formatBlock', '<h3>') },
    { icon: List, label: 'List Poin', onClick: () => exec('insertUnorderedList') },
    { icon: ListOrdered, label: 'List Angka', onClick: () => exec('insertOrderedList') },
    { icon: Link, label: 'Tautan', onClick: handleLink },
    { icon: RemoveFormatting, label: 'Hapus Format', onClick: () => exec('removeFormat') },
  ]

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {buttons.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            className="rte-btn"
            title={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-editor"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={handleInput}
        suppressContentEditableWarning
        data-placeholder="Tulis isi artikel di sini..."
      />
    </div>
  )
}
