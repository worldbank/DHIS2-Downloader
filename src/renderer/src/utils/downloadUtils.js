export const generateDownloadingUrl = (dhis2Url, ou, dx, pe, co, format = 'csv') => {
  let parameters = `api/analytics.${format}?dimension=ou:${ou}&dimension=pe:${pe}&dimension=dx:${dx}`
  let defaultFormat =
    '&displayProperty=NAME&ignoreLimit=TRUE&hierarchyMeta=TRUE&hideEmptyRows=TRUE&showHierarchy=TRUE&rows=ou;pe;dx'

  if (co.length !== 0) {
    parameters += co.map((el) => `&dimension=${el}`).join('')
    let rowString = co.join(';')
    defaultFormat += `;${rowString}`
  }

  const url = `${dhis2Url}/${parameters}${defaultFormat}`
  return url
}

export const createDataChunks = (dxs, pe, ou, chunkSize) => {
  const chunks = []
  dxs.forEach((dx) => {
    for (let i = 0; i < pe.length; i += chunkSize) {
      chunks.push({
        dx: [dx],
        periods: pe.slice(i, i + chunkSize),
        ou: ou
      })
    }
  })
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

export const objectToCsv = (array) => {
  if (!array || !array.length) {
    console.error('No data to export')
    return
  }

  // Get all unique headers across all objects
  const headers = Array.from(new Set(array.flatMap((obj) => Object.keys(obj))))
  const csvRows = []

  // Add the headers row
  csvRows.push(headers.join(','))

  // Add each row of data
  for (const obj of array) {
    const values = headers.map((header) => {
      const value = obj[header] !== undefined ? obj[header] : ''
      const escapedValue = ('' + value).replace(/"/g, '\\"')
      return `"${escapedValue}"`
    })
    csvRows.push(values.join(','))
  }

  // Create a Blob from the CSV string
  return csvRows.join('\n')
}
