export const clearCacheData = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name)
    })
  })
}

export const extractIds = (inputString) => {
  const idPattern = /\{([a-zA-Z0-9]{11})(?:\.([a-zA-Z0-9]{11}))?\}/g
  const matches = []
  let match
  while ((match = idPattern.exec(inputString)) !== null) {
    if (match[2]) {
      matches.push([match[1], match[2]])
    } else {
      matches.push([match[1]])
    }
  }
  return matches
}

export const updateFormulaNames = (pageData, data, formulaType) => {
  return pageData.map((item) => {
    if (item[formulaType] && isNaN(item[formulaType])) {
      const formulaIds = extractIds(item[formulaType])
      let updatedFormula = item[formulaType]
      formulaIds.forEach((id) => {
        let idName = ''
        const element = data.find((el) => el.id === id[0])
        idName = element?.displayName
        const regex = new RegExp(`{${id[0]}}`, 'g')
        updatedFormula = updatedFormula.replace(regex, idName)
        if (id.length === 2) {
          const categoryOption = data.find((el) => el.id === id[1])
          if (categoryOption) {
            idName += ` (${categoryOption.displayName})`
            const regex = new RegExp(`{${id.join('.')}`, 'g')
            updatedFormula = updatedFormula.replace(regex, idName)
          }
        }
      })
      return {
        ...item,
        [`${formulaType}Name`]: updatedFormula
      }
    }
    return item
  })
}
