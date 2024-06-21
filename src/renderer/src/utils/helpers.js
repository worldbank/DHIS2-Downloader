export const clearCacheData = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name)
    })
  })
}

export const generateDownloadingUrl = (dhis2Url, ou, dx, pe, co) => {
  let parameters = `api/analytics.json?dimension=ou:LEVEL-${ou}&dimension=pe:${pe}&dimension=dx:${dx}`
  let defaultFormat =
    '&displayProperty=NAME&ignoreLimit=TRUE&hierarchyMeta=true&hideEmptyRows=TRUE&showHierarchy=true&rows=ou;pe;dx'

  if (co.length !== 0) {
    parameters += `&dimenion=${co}`
    defaultFormat += ';co'
  }

  const url = `${dhis2Url}/${parameters}${defaultFormat}`
  return url
}

export const jsonToCsv = (data) => {
  const headers = data.headers.filter((header) => !header.hidden)
  const headerNames = headers.map((header) => header.name)
  const csvRows = []
  csvRows.push(headerNames.join(','))

  // Add the data rows
  for (const row of data.rows) {
    const filteredRow = headers.map((header) => row[data.headers.indexOf(header)])
    const values = filteredRow.map((value) => JSON.stringify(value ?? '')) // Handle null/undefined values
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

export const objectToCsv = (array) => {
  if (!array || !array.length) {
    console.error('No data to export')
    return
  }

  const headers = Object.keys(array[0])
  const csvRows = []

  // Add the headers row
  csvRows.push(headers.join(','))

  // Add each row of data
  for (const obj of array) {
    const values = headers.map((header) => {
      const escapedValue = ('' + obj[header]).replace(/"/g, '\\"')
      return `"${escapedValue}"`
    })
    csvRows.push(values.join(','))
  }

  // Create a Blob from the CSV string
  return csvRows.join('\n')
}
