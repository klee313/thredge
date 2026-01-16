export const getBodyWithoutTitle = (title: string, body: string) => {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    return body.trim()
  }
  let remainder = body
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
  const normalizedBody = body.replace(/\r\n/g, '\n').replace(/<br\s*\/?>|<\/p>/gi, '\n')
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
