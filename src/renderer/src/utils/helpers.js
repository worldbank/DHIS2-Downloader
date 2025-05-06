export const clearCacheData = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name)
    })
  })
}

export const extractIds = (inputString) => {
  const idPattern = /\{([A-Za-z0-9]{11})(?:\.([A-Za-z0-9_]{2,}))?\}/g
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

const tokenRE = /\{([A-Za-z0-9]{11})(?:\.([A-Za-z0-9_]{2,}))?\}/g

export const updateFormulaNames = (pageData, data, formulaType) => {
  const nameMap = new Map(data.map(({ id, displayName }) => [id, displayName]))

  return pageData.map((item) => {
    const raw = item[formulaType]
    if (!raw || !isNaN(raw)) return item // skip numbers / empty

    const updated = raw.replace(tokenRE, (_, id1, tail) => {
      // 1️⃣  full‑token lookup:  GfrILDBh14p.ACTUAL_REPORTS
      if (tail) {
        const fullKey = `${id1}.${tail}`
        if (nameMap.has(fullKey)) return nameMap.get(fullKey)
      }

      // 2️⃣  base ID always looked up
      const baseName = nameMap.get(id1) ?? id1

      // 3️⃣  variants
      if (!tail) return baseName // {id1}

      if (tail.length === 11 && nameMap.has(tail)) {
        // {id1.id2}
        return `${baseName} (${nameMap.get(tail)})`
      }

      // {id1.LABEL} – literal label retained
      return `${baseName}.${tail}`
    })

    return { ...item, [`${formulaType}Name`]: updated }
  })
}
