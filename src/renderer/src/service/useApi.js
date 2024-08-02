export const fetchData = async (apiUrl, username, password, timeout = 1200000) => {
  const controller = new AbortController()
  const { signal } = controller
  const fetchOptions = {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Accept-Encoding': 'gzip, deflate, br'
    },
    signal
  }

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(apiUrl, fetchOptions)
    clearTimeout(timeoutId)
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'An error occurred while fetching data')
    }
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`)
    }
    throw error
  }
}

export const fetchCsvData = async (apiUrl, username, password, timeout = 1200000) => {
  const controller = new AbortController()
  const { signal } = controller
  const fetchOptions = {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`,
      'Accept-Encoding': 'gzip, deflate, br'
    },
    signal
  }
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(apiUrl, fetchOptions)
    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, 'text/html')
      const errorText = doc.querySelector('title').textContent || 'Error occurred'
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    return await response.blob()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`)
    }
    throw error
  }
}

export const getUserInfo = async (dhis2Url, username, password) => {
  const response = await fetch(`${dhis2Url}/api/me`, {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export const getInitialOrganizationUnitLevel = (dhis2Url, username, password) => {
  const url = `${dhis2Url}/api/organisationUnits?level=1&fields=id,displayName,children[id,displayName],level`
  return fetchData(url, username, password)
}

export const getChildOrgUnits = (dhis2Url, parentId, username, password) => {
  const url = `${dhis2Url}/api/organisationUnits/${parentId}?fields=id,displayName,children[id,displayName],level`
  return fetchData(url, username, password)
}

export const getOrganizationLevels = (dhis2Url, username, password) => {
  const url = `${dhis2Url}/api/organisationUnitLevels?paging=false&fields=id,displayName,level`
  return fetchData(url, username, password)
}
export const getCategoryCombination = (dhis2Url, username, password) => {
  const url = `${dhis2Url}/api/categoryCombos?fields=id,displayName&paging=false`
  return fetchData(url, username, password)
}

export const getDataElements = (dhis2Url, username, password) => {
  const elementUrl = `${dhis2Url}/api/dataElements?fields=id,displayName,displayDescription&paging=false`
  return fetchData(elementUrl, username, password)
}

export const getIndicators = (dhis2Url, username, password) => {
  const indicatorUrl = `${dhis2Url}/api/indicators.json?fields=id,code,displayName,displayDescription,numerator,denominator,indicatorGroups[id,code,displayName,attributeValues[value]]&paging=false`
  return fetchData(indicatorUrl, username, password)
}

export const getProgramIndicators = (dhis2Url, username, password) => {
  const indicatorUrl = `${dhis2Url}/api/programIndicators?fields=id,displayName,displayDescription&paging=false`
  return fetchData(indicatorUrl, username, password)
}

export const getCategoryOptionCombos = (dhis2Url, username, password) => {
  const catComboOptionUrl = `${dhis2Url}/api/categoryOptionCombos?fields=id,displayName&paging=false`
  return fetchData(catComboOptionUrl, username, password)
}

export const getOrganizationUnitGroupSets = (dhis2Url, username, password) => {
  const orgUnitGroupSetsUrl = `${dhis2Url}/api/organisationUnitGroupSets?fields=id,displayName&paging=false`
  return fetchData(orgUnitGroupSetsUrl, username, password)
}

export const getDataSets = (dhis2Url, username, password) => {
  const dataSetsUrl = `${dhis2Url}/api/dataSets?fields=id,displayName&paging=false`
  return fetchData(dataSetsUrl, username, password)
}
