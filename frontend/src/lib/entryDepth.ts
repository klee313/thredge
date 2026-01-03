export const buildEntryDepthMap = (
  entries: { id: string; parentEntryId?: string | null }[],
) => {
  const entryById = new Map(entries.map((entry) => [entry.id, entry]))
  const depthCache = new Map<string, number>()
  const getDepth = (entryId: string) => {
    const cached = depthCache.get(entryId)
    if (cached) {
      return cached
    }
    let depth = 1
    let currentId = entryById.get(entryId)?.parentEntryId ?? null
    while (currentId) {
      const parent = entryById.get(currentId)
      if (!parent) {
        break
      }
      depth += 1
      currentId = parent.parentEntryId ?? null
      if (depth >= 3) {
        break
      }
    }
    depthCache.set(entryId, depth)
    return depth
  }
  entries.forEach((entry) => {
    getDepth(entry.id)
  })
  return depthCache
}
