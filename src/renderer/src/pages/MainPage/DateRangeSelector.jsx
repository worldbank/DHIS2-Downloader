const DateRangeSelector = ({
  startDate,
  endDate,
  frequency,
  handleStartDateChange,
  handleEndDateChange,
  handleFrequency
}) => {
  let today = new Date().toJSON().slice(0, 7)

  return (
    <div className="flex">
      <div className="w-1/2 space-y-4">
        <legend className="text-sm font-medium text-gray-700">Frequency</legend>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              id="year"
              name="frequency"
              value="year"
              onChange={handleFrequency}
              checked={frequency === 'year'}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Year</span>
          </label>
        </div>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              id="quarter"
              name="frequency"
              value="quarter"
              checked={frequency === 'quarter'}
              onChange={handleFrequency}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Quarter</span>
          </label>
        </div>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              id="month"
              name="frequency"
              value="month"
              checked={frequency === 'month'}
              onChange={handleFrequency}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Month</span>
          </label>
        </div>
      </div>
      <div className="w-1/2 space-y-4">
        <div className="w-full">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="month"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            className="mt-2 block w-full px-1 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="w-full">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="month"
            id="endDate"
            value={endDate}
            max={today}
            onChange={handleEndDateChange}
            className="mt-2 block w-full px-1 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default DateRangeSelector
