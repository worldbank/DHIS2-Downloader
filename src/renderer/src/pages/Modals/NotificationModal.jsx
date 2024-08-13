import React from 'react'
import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearNotification, handleExit } from '../../reducers/statusReducer'

// eslint-disable-next-line react/display-name
const Notification = React.memo(() => {
  const { isLoading, notification } = useSelector((state) => state.status)

  const renderedMessages = useMemo(() => {
    return notification.map((msg, index) => (
      <p
        key={index}
        className={`${msg?.type === 'error' ? 'text-red-600' : 'text-blue-600'} mb-2 whitespace-pre-wrap`}
      >
        {msg?.message}
      </p>
    ))
  }, [notification])

  if (notification.length === 0) return null

  return <div>{renderedMessages}</div>
})

const NotificationModal = () => {
  const dispatch = useDispatch()
  const { isLoading, notification } = useSelector((state) => state.status)

  const handleClose = () => {
    dispatch(handleExit())
    dispatch(clearNotification())
  }

  if (!isLoading && notification.length == 0) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full max-h-96 overflow-y-auto overflow-x-hidden flex flex-col items-center">
        {isLoading && (
          <div className="flex flex-col items-center mb-4">
            <div className="loader mb-3 border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Notification Content */}
        <div className="flex-grow overflow-y-auto max-h-48 w-full p-4 bg-gray-100 rounded-lg border border-gray-300">
          <Notification />
        </div>

        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ease-in-out duration-200 focus:outline-none w-full text-center"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default NotificationModal
