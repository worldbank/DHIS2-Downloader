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
