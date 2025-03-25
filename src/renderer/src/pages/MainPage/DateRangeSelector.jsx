import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setStartDate, setEndDate, setFrequency } from '../../reducers/dateRangeReducer'
import { useTranslation } from 'react-i18next'

const DateRangeSelector = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { frequency, startDate, endDate } = useSelector((state) => state.dateRange)

  const handleStartDateChange = (event) => {
    dispatch(setStartDate(event.target.value))
  }

  const handleEndDateChange = (event) => {
    dispatch(setEndDate(event.target.value))
  }

  const handleFrequencyChange = (event) => {
    dispatch(setFrequency(event.target.value))
  }

  let today = new Date().toJSON().slice(0, 7)

  return (
    <div className="flex">
      <div className="w-1/2 space-y-4">
        <legend className="text-sm font-medium text-gray-700">
          {t('dateRange.frequencyLabel')}
        </legend>
        <div className="mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              id="year"
              name="frequency"
              value="year"
              onChange={handleFrequencyChange}
              checked={frequency === 'year'}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">{t('dateRange.frequencyOptions.year')}</span>
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
              onChange={handleFrequencyChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">{t('dateRange.frequencyOptions.quarter')}</span>
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
              onChange={handleFrequencyChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">{t('dateRange.frequencyOptions.month')}</span>
          </label>
        </div>
      </div>
      <div className="w-1/2 space-y-4">
        <div className="w-full">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            {t('dateRange.startDateLabel')}
          </label>
          <input
            type="month"
            id="startDate"
            value={startDate}
            max={today}
            onChange={handleStartDateChange}
            className="mt-2 block w-full px-1 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="w-full">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            {t('dateRange.endDateLabel')}
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
