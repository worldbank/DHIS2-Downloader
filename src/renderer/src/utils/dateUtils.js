export const generateQuarters = (startDate, endDate) => {
  const startYear = startDate.year
  const startMonth = startDate.month
  const endYear = endDate.year
  const endMonth = endDate.month

  const quarters = []

  // Convert start and end dates to Date objects
  const start = new Date(startYear, startMonth - 1)
  const end = new Date(endYear, endMonth - 1)

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

export const generateYears = (startDate, endDate) => {
  const startYear = startDate.year
  const endYear = endDate.year

  const years = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString())
  }

  return years
}

export const generateMonths = (startDate, endDate) => {
  const startYear = startDate.year
  const startMonth = startDate.month
  const endYear = endDate.year
  const endMonth = endDate.month

  const start = new Date(startYear, startMonth - 1)
  const end = new Date(endYear, endMonth - 1)
  const months = []

  for (let date = start; date <= end; date.setMonth(date.getMonth() + 1)) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    months.push(`${year}${month}`)
  }

  return months
}
