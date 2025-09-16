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
