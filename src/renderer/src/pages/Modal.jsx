import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handleExit } from '../reducers/statusReducer'

const LoadingModal = () => {
  const dispatch = useDispatch()
  const { isLoading, errorMessage, notification } = useSelector((state) => state.status)

  const handleClose = () => {
    dispatch(handleExit())
  }

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-start justify-center pt-20 z-50">
      <div className="bg-white p-4 rounded shadow-lg flex flex-col items-center max-w-sm w-full">
        {isLoading && (
          <>
            <div className="loader mb-4"></div>
            <p className="text-gray-700 mb-2">Loading...</p>
          </>
        )}
        {notification.message && (
          <>
            <p className={`text-${notification.type === 'success' ? 'green' : 'blue'}-600 mb-2`}>
              {notification.message}
            </p>
            <button
              onClick={handleClose}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
            >
              Dismiss
            </button>
          </>
        )}
        {errorMessage && (
          <>
            <p className="text-red-600 mb-2">{errorMessage}</p>
            <button
              onClick={handleClose}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
            >
              Dismiss
            </button>
          </>
        )}
        {!isLoading && !notification.message && !errorMessage && (
          <button
            onClick={handleClose}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

export default LoadingModal
