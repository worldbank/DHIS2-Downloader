const generateQuarters = (startDate, endDate) => {
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()

  const quarters = []

  // Convert start and end dates to Date objects
  const start = new Date(startYear, startMonth)
  const end = new Date(endYear, endMonth)

  // Helper function to get the quarter from a month
  const getQuarter = (month) => {
    return Math.floor(month / 3) + 1
  }

  // Loop through each quarter between start and end dates
  for (let date = start; date <= end; date.setMonth(date.getMonth() + 3)) {
    const year = date.getFullYear()
    const quarter = getQuarter(date.getMonth())
    quarters.push(`${year}Q${quarter}`)
  }

  return quarters
}

const generateYears = (startDate, endDate) => {
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  const years = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString())
  }

  return years
}

const generateMonths = (startDate, endDate) => {
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()

  const months = []

  for (let year = startYear; year <= endYear; year++) {
    const start = year === startYear ? startMonth : 0
    const end = year === endYear ? endMonth : 11

    for (let month = start; month <= end; month++) {
      const monthStr = (month + 1).toString().padStart(2, '0')
      months.push(`${year}${monthStr}`)
    }
  }

  return months
}

export const generatePeriods = (period, startDate, endDate) => {
  if (typeof startDate === 'string' || typeof endDate === 'string') {
    startDate = new Date(startDate)
    endDate = new Date(endDate)
  }

  if (period === 'year') {
    return generateYears(startDate, endDate)
  } else if (period === 'quarter') {
    return generateQuarters(startDate, endDate)
  } else if (period === 'month') {
    return generateMonths(startDate, endDate)
  } else {
    console.error('Must be in ["year", "quarter", "month"]')
  }
}
