import { fetchCsvData } from '../service/useApi'

// Merge several CSV strings: keep the first header, append every data row.
export const mergeCsvTexts = (texts) => {
  let header = ''
  const body = []
  for (const t of texts) {
    if (!t) continue
    const lines = t.split('\n').filter((l) => l.trim().length)
    if (!lines.length) continue
    if (!header) header = lines[0]
    body.push(...lines.slice(1))
  }
  return header ? [header, ...body].join('\n') : ''
}

// Fetch one chunk as CSV text. If the server rejects it with a
// "too many combinations" limit (E7151, returned as HTTP 409 or as an
// HTTP-200 CSV error body - both surfaced as a thrown error by fetchCsvData),
// split the periods in half and retry recursively down to a single period,
// then merge the pieces. This makes downloads self-heal on strict servers
// (e.g. facility-level pulls) regardless of the configured chunk size.
export const fetchCsvChunkAdaptive = async (
  { dhis2Url, ou, dx, periods, co, layout, username, password },
  onSplit
) => {
  const url = generateDownloadingUrl(dhis2Url, ou, dx.join(';'), periods.join(';'), co, 'csv', layout)
  try {
    const blob = await fetchCsvData(url, username, password)
    return await blob.text()
  } catch (err) {
    const tooMany = /too many combinations|E7151/i.test(err?.message || '')
    if (!tooMany || periods.length <= 1) {
      // single period still too large, or an unrelated error - cannot recover here
      throw err
    }
    if (onSplit) onSplit(periods)
    const mid = Math.ceil(periods.length / 2)
    const [left, right] = await Promise.all([
      fetchCsvChunkAdaptive(
        { dhis2Url, ou, dx, periods: periods.slice(0, mid), co, layout, username, password },
        onSplit
      ),
      fetchCsvChunkAdaptive(
        { dhis2Url, ou, dx, periods: periods.slice(mid), co, layout, username, password },
        onSplit
      )
    ])
    return mergeCsvTexts([left, right])
  }
}

export const generateDownloadingUrl = (
  dhis2Url,
  ou,
  dx,
  pe,
  co,
  format = 'json',
  layout = null
) => {
  // Base dimension URL parts
  let parameters = `api/analytics.${format}?dimension=ou:${ou}&dimension=pe:${pe}&dimension=dx:${dx}`

  // Add disaggregates (if any)
  if (co && co.length > 0) {
    parameters += co.map((c) => `&dimension=${c}`).join('')
  }

  // Layout processing
  let layoutParams =
    '&displayProperty=NAME&ignoreLimit=TRUE&hierarchyMeta=TRUE&hideEmptyRows=TRUE&showHierarchy=TRUE'

  let rows = ['ou', 'pe', 'dx']
  let columns = []

  if (layout && typeof layout === 'object') {
    rows = layout.rows || rows
    columns = layout.columns || columns
  }

  // If co is present, add it to rows if not already included
  if (co && co.length > 0) {
    for (const cat of co) {
      if (!rows.includes(cat) && !columns.includes(cat)) {
        rows.push(cat) // You may customize this to push to `columns` instead if preferred
      }
    }
  }

  if (rows.length > 0) layoutParams += `&rows=${rows.join(';')}`
  if (columns.length > 0) layoutParams += `&columns=${columns.join(';')}`

  return `${dhis2Url}/${parameters}${layoutParams}`
}
export const createDataChunks = (dxs, pe, ou, chunkSize, layout) => {
  const chunks = []

  const isWide = layout?.columns?.includes('dx')

  if (isWide) {
    // Wide format: keep all dxs, only chunk periods
    for (let i = 0; i < pe.length; i += chunkSize) {
      chunks.push({
        dx: dxs,
        periods: pe.slice(i, i + chunkSize),
        ou: ou
      })
    }
  } else {
    // Long format: chunk periods per each dx
    for (let i = 0; i < pe.length; i += chunkSize) {
      const periodChunk = pe.slice(i, i + chunkSize)
      chunks.push(
        ...dxs.map((dx) => ({
          dx: [dx],
          periods: periodChunk,
          ou: ou
        }))
      )
    }
  }

  return chunks
}

export function* jsonToCsvGenerator(data, includeHeaders = true) {
  if (!data || !data.headers || !data.rows) {
    throw new Error('Invalid data format')
  }

  const headers = data.headers
  const headerNames = headers.map((header) => header.column)

  // Yield the CSV header if includeHeaders is true
  if (includeHeaders) {
    yield headerNames.join(',')
  }

  // Yield the data rows
  for (const row of data.rows) {
    const values = headers.map((header, index) => {
      const value = row[index]
      return JSON.stringify(value ?? '')
    })
    yield values.join(',')
  }
}

export const jsonToCsv = (data, includeHeaders = true) => {
  if (!data || !data.headers || !data.rows) {
    throw new Error('Invalid data format')
  }

  const headers = data.headers
  const headerNames = headers.map((header) => header.column)
  const csvRows = []

  // Add the CSV header if includeHeaders is true
  if (includeHeaders) {
    csvRows.push(headerNames.join(','))
  }

  // Add the data rows
  for (const row of data.rows) {
    const values = headers.map((header, index) => {
      const value = row[index]
      return JSON.stringify(value ?? '')
    })
    csvRows.push(values.join(','))
  }

  return { csvData: csvRows.join('\n'), headers: headerNames, dbObjects: [] }
}

export const csvGeneratorToBlob = (generator) => {
  const csvParts = []
  for (const line of generator) {
    csvParts.push(line + '\n')
  }
  return new Blob(csvParts, { type: 'text/csv' })
}

export const objectToCsv = (array, columnsOrder = []) => {
  if (!array?.length) {
    console.error('No data to export')
    return ''
  }

  // 1) Determine headers: use columnsOrder if provided, else all unique keys
  const headers = columnsOrder.length
    ? columnsOrder
    : Array.from(new Set(array.flatMap((obj) => Object.keys(obj))))

  const csvRows = []
  // 2) Header row
  csvRows.push(headers.join(','))

  // 3) Data rows
  for (const obj of array) {
    const line = headers.map((header) => {
      const raw = obj[header] != null ? obj[header] : ''
      // replace commas inside values so they don't create extra columns
      const noCommas = String(raw).replace(/,/g, ';')
      // escape internal quotes by doubling them
      const escaped = noCommas.replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(line.join(','))
  }

  // 4) Join with CRLF for Excel
  return csvRows.join('\r\n')
}

export function buildOuParamForOneParent(parentId, selectedLevels) {
  const levels =
    selectedLevels && selectedLevels.length ? selectedLevels.map((l) => `LEVEL-${l}`) : ['LEVEL-5']
  // DHIS2: LEVEL-5;{parentId} ⇒ all level-5 descendants of that parent
  return `${levels.join(';')};${parentId}`
}
