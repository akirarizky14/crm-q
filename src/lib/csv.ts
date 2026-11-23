/** Picks "," or ";" by counting them (outside quotes) on the header line. Excel with an
 * Indonesian locale saves CSV with ";" as the separator. */
function detectDelimiter(text: string): ',' | ';' {
  let commas = 0
  let semicolons = 0
  let inQuotes = false
  for (const char of text) {
    if (char === '"') inQuotes = !inQuotes
    else if (!inQuotes && (char === '\n' || char === '\r')) break
    else if (!inQuotes && char === ',') commas++
    else if (!inQuotes && char === ';') semicolons++
  }
  return semicolons > commas ? ';' : ','
}

export function parseCsv(rawText: string): string[][] {
  const text = rawText.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}
