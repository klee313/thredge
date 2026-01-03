export const getBodyWithoutTitle = (title: string, body: string) => {
  const normalizedBody = body.replace(/\r\n/g, '\n')
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    return normalizedBody.trim()
  }
  let remainder = normalizedBody
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
  const normalizedBody = body.replace(/\r\n/g, '\n')
  const firstLine = normalizedBody.split('\n').find((line) => line.trim().length > 0) ?? ''
  const source = firstLine.trim() || normalizedBody.trim()
  return source.slice(0, 200)
}
