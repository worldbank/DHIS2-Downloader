import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handleExit } from '../reducers/statusReducer'

const NotificationModal = () => {
  const dispatch = useDispatch()
  const { isLoading, errorMessage, notification } = useSelector((state) => state.status)

  const handleClose = () => dispatch(handleExit())

  if (!isLoading && !notification.message && !errorMessage) return null

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-start justify-center pt-20 z-50">
      <div className="bg-white p-4 rounded shadow-lg flex flex-col items-center max-w-sm w-full max-h-96 overflow-y-auto">
        {isLoading && (
          <>
            <div className="loader mb-4"></div>
            <p className="text-gray-700 mb-2">Loading...</p>
          </>
        )}
        {notification.message && (
          <p
            className={`text-${notification.type === 'success' ? 'green' : 'blue'}-600 mb-2 whitespace-pre-wrap`}
          >
            {notification.message}
          </p>
        )}
        {errorMessage && <p className="text-red-600 mb-2">{errorMessage}</p>}
        {!isLoading && (
          <button
            onClick={handleClose}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            {errorMessage || notification.message ? 'Dismiss' : 'Close'}
          </button>
        )}
      </div>
    </div>
  )
}

export default NotificationModal
