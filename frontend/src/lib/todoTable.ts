export type TodoTableRow = {
  task: string
  deadline: string
  priority: string
  blocker: string
  solution: string
  done: string
}

type TodoTableParseResult = {
  rows: TodoTableRow[]
  startLine: number
  endLine: number
  lines: string[]
}

const headerAliases: Record<keyof TodoTableRow, string[]> = {
  task: ['할일', '할 일', 'todo', 'task'],
  deadline: ['데드라인', '마감', 'due', 'deadline'],
  priority: ['중요도', 'priority', 'prio'],
  blocker: ['블로커', 'blocker'],
  solution: ['해결방식', '해결 방식', '해결', '블로커해결방식', '블로커 해결 방식', 'solution'],
  done: ['완료', 'done', 'complete', 'completed'],
}

const normalizeHeader = (value: string) => value.replace(/\s+/g, '').toLowerCase()

const isAliasMatch = (key: keyof TodoTableRow, value: string) => {
  const normalized = normalizeHeader(value)
  return headerAliases[key].some((alias) => normalizeHeader(alias) === normalized)
}

const parseRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

const isSeparatorRow = (cells: string[]) =>
  cells.length > 0 &&
  cells.every((cell) => {
    const trimmed = cell.replace(/:/g, '').trim()
    return trimmed.length >= 3 && /^-+$/.test(trimmed)
  })

const buildHeaderIndex = (headers: string[]) => {
  const indexMap: Partial<Record<keyof TodoTableRow, number>> = {}
  headers.forEach((header, idx) => {
    const normalized = normalizeHeader(header)
    ;(Object.keys(headerAliases) as (keyof TodoTableRow)[]).forEach((key) => {
      if (indexMap[key] !== undefined) {
        return
      }
      if (headerAliases[key].some((alias) => normalizeHeader(alias) === normalized)) {
        indexMap[key] = idx
      }
    })
  })
  return indexMap
}

export const normalizeDoneValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (['y', 'yes', 'true', '완료'].includes(normalized)) {
    return 'y'
  }
  if (['n', 'no', 'false', '미완료'].includes(normalized)) {
    return 'n'
  }
  return ''
}

export const isTodoHeaderRow = (row: TodoTableRow) =>
  (Object.keys(headerAliases) as (keyof TodoTableRow)[]).every((key) =>
    isAliasMatch(key, row[key]),
  )

export const isTodoHeaderStringRow = (row: TodoTableRow) => {
  const headerTokens = ['할일', '데드라인', '중요도', '블로커', '해결 방식', '완료']
  const candidate = row.task.trim()
  if (!candidate.includes('|')) {
    return false
  }
  return headerTokens.every((token) => candidate.includes(token))
}

export const isTodoHeaderNoiseRow = (row: TodoTableRow) => {
  const tokens = ['할일', '데드라인', '중요도', '블로커', '해결방식', '완료']
  const normalized = normalizeHeader(
    [row.task, row.deadline, row.priority, row.blocker, row.solution, row.done].join(''),
  )
  if (!tokens.every((token) => normalized.includes(normalizeHeader(token)))) {
    return false
  }
  let remaining = normalized
  tokens.forEach((token) => {
    remaining = remaining.replaceAll(normalizeHeader(token), '')
  })
  return remaining.trim().length === 0
}

export const parseTodoTable = (body: string | null | undefined): TodoTableParseResult | null => {
  if (!body) {
    return null
  }
  const lines = body.replace(/\r\n/g, '\n').split('\n')
  for (let i = 0; i < lines.length - 1; i += 1) {
    const headerLine = lines[i]
    const separatorLine = lines[i + 1]
    if (!headerLine.includes('|') || !separatorLine.includes('|')) {
      continue
    }
    const headerCells = parseRow(headerLine)
    const separatorCells = parseRow(separatorLine)
    if (headerCells.length < 2 || !isSeparatorRow(separatorCells)) {
      continue
    }
    const headerIndex = buildHeaderIndex(headerCells)
    const requiredKeys: (keyof TodoTableRow)[] = ['task', 'deadline', 'priority', 'blocker', 'solution', 'done']
    if (requiredKeys.some((key) => headerIndex[key] === undefined)) {
      continue
    }
    const rows: TodoTableRow[] = []
    let endLine = i + 1
    const isHeaderLikeRow = (cells: string[]) =>
      requiredKeys.every((key) => {
        const index = headerIndex[key] ?? -1
        if (index < 0) return false
        const value = cells[index] ?? ''
        return isAliasMatch(key, value)
      })

    for (let j = i + 2; j < lines.length; j += 1) {
      const line = lines[j]
      if (!line.includes('|')) {
        break
      }
      const cells = parseRow(line)
      if (cells.length === 0 || cells.every((cell) => !cell.trim())) {
        endLine = j
        continue
      }
      if (isHeaderLikeRow(cells)) {
        endLine = j
        continue
      }
      const getCell = (key: keyof TodoTableRow) => {
        const index = headerIndex[key] ?? -1
        if (index < 0) return ''
        return cells[index] ?? ''
      }
      rows.push({
        task: getCell('task'),
        deadline: getCell('deadline'),
        priority: getCell('priority'),
        blocker: getCell('blocker'),
        solution: getCell('solution'),
        done: normalizeDoneValue(getCell('done')) || getCell('done').trim(),
      })
      endLine = j
    }
    return { rows, startLine: i, endLine, lines }
  }
  return null
}

export const buildTodoTable = (rows: TodoTableRow[]) => {
  const header = ['할일', '데드라인', '중요도', '블로커', '해결 방식', '완료']
  const lines = [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
  ]
  rows.forEach((row) => {
    const done = normalizeDoneValue(row.done) || 'n'
    const cells = [row.task, row.deadline, row.priority, row.blocker, row.solution, done]
    lines.push(`| ${cells.map((cell) => cell || '').join(' | ')} |`)
  })
  return lines.join('\n')
}

export const applyTodoTableToBody = (body: string, rows: TodoTableRow[]) => {
  const parsed = parseTodoTable(body)
  const table = buildTodoTable(rows)
  if (!parsed) {
    return table
  }
  const before = parsed.lines.slice(0, parsed.startLine).join('\n').trimEnd()
  const after = parsed.lines.slice(parsed.endLine + 1).join('\n').trimStart()
  if (before && after) {
    return `${before}\n\n${table}\n\n${after}`
  }
  if (before) {
    return `${before}\n\n${table}`
  }
  if (after) {
    return `${table}\n\n${after}`
  }
  return table
}

export const buildTodoExampleTable = () => {
  return [
    '| 할일 | 데드라인 | 중요도 | 블로커 | 해결 방식 | 완료 |',
    '| --- | --- | --- | --- | --- | --- |',
    '| 예: 로그인 페이지 카피 수정 | 2026-02-05 | 높음 | 디자인 승인 지연 | (빈칸) | n |',
  ].join('\n')
}
