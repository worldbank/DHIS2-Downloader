export const fetchData = async (apiUrl, username, password) => {
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Basic ${btoa(`${username}:${password}`)}`
    }
  })

  if (!response.ok) {
    throw console.error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
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
  const elementUrl = `${dhis2Url}/api/dataElements?fields=id,displayName&paging=false`
  return fetchData(elementUrl, username, password)
}

export const getIndicators = (dhis2Url, username, password) => {
  const indicatorUrl = `${dhis2Url}/api/indicators?fields=id,displayName&paging=false`
  return fetchData(indicatorUrl, username, password)
}
