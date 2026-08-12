export function paragraphsToHtml(content: string[]): string {
  return content
    .map((block) => (/^\s*</.test(block) ? block : `<p>${block}</p>`))
    .join('')
}

export function htmlToParagraphs(html: string): string[] {
  const container = document.createElement('div')
  container.innerHTML = html

  return Array.from(container.children)
    .map((el) => el.outerHTML)
    .filter((block) => {
      const text = block.replace(/<[^>]+>/g, '').trim()
      return text.length > 0
    })
}
