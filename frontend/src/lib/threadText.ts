const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const getBodyWithoutTitle = (title: string, body: string) => {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    return body.trim()
  }
  let remainder = body
  const paragraphMatch = remainder.match(/^\s*<p[^>]*>[\s\S]*?<\/p>/i)
  if (paragraphMatch) {
    const paragraph = paragraphMatch[0]
    const openTagMatch = paragraph.match(/^\s*<p[^>]*>/i)
    const openTag = openTagMatch?.[0] ?? '<p>'
    const inner = paragraph.replace(/^\s*<p[^>]*>/i, '').replace(/<\/p>\s*$/i, '')
    const titlePrefixPattern = new RegExp(
      `^\\s*${escapeRegExp(trimmedTitle)}\\s*(<br\\s*\\/?>\\s*)?`,
      'i',
    )
    if (titlePrefixPattern.test(inner)) {
      const updatedInner = inner.replace(titlePrefixPattern, '')
      const trimmedInner = updatedInner.replace(/^\s+/, '').trimEnd()
      if (!trimmedInner) {
        remainder = remainder.replace(paragraph, '')
      } else {
        remainder = remainder.replace(paragraph, `${openTag}${updatedInner}</p>`)
      }
      return remainder.replace(/^\s+/, '').trimEnd()
    }
  }
  if (remainder.startsWith(trimmedTitle)) {
    remainder = remainder.slice(trimmedTitle.length)
  } else {
    const trimmedBody = remainder.trimStart()
    if (trimmedBody.startsWith(trimmedTitle)) {
      remainder = trimmedBody.slice(trimmedTitle.length)
    }
  }
  return remainder.replace(/^\s+/, '').trimEnd()
}

export const deriveTitleFromBody = (body: string) => {
  const normalizedBody = body
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>|<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
  const lines = normalizedBody.split('\n')
  const firstIndex = lines.findIndex((line) => line.trim().length > 0)
  if (firstIndex === -1) {
    return null
  }
  const firstLine = lines[firstIndex].trim()
  if (firstLine.length > 100) {
    return null
  }
  const nextIndex = lines.slice(firstIndex + 1).findIndex((line) => line.trim().length > 0)
  if (nextIndex === -1) {
    return null
  }
  const secondIndex = firstIndex + 1 + nextIndex
  if (secondIndex < firstIndex + 2) {
    return null
  }
  return firstLine
}
