import React from 'react'
import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearNotification, handleExit, toggleNotifications } from '../../reducers/statusReducer'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/display-name
const Logs = React.memo(() => {
  const { logs } = useSelector((state) => state.status)
  const { t } = useTranslation()

  const renderedMessages = useMemo(() => {
    return logs.map((log, index) => {
      const translated =
        log.key && log.params ? t(log.key, log.params) : log.message || t('mainPage.unknownError')

      return (
        <p
          key={index}
          className={`${
            log?.type === 'error' ? 'text-red-600' : 'text-blue-600'
          } mb-2 whitespace-pre-wrap`}
        >
          {translated}
        </p>
      )
    })
  }, [logs, t])

  if (logs.length === 0) return null

  return <div>{renderedMessages}</div>
})

const NotificationModal = () => {
  const dispatch = useDispatch()
  const { isLoading, notification, showLogs, logs } = useSelector((state) => state.status)
  const { t } = useTranslation()

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
            <p className="text-gray-600">{t('modal.loading')}</p>
          </div>
        )}

        {/* Notification Content - Always shown */}
        <div className="w-full mb-4">
          {notification.length > 0
            ? notification.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 mb-2 rounded-lg ${
                    notification.type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {notification.message}
                </div>
              ))
            : null}
        </div>

        {!isLoading && logs.length > 0 && (
          <>
            <button
              onClick={() => dispatch(toggleNotifications())}
              className="text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out focus:outline-none"
            >
              {showLogs ? t('modal.hidelogs') : t('modal.viewlogs')}
            </button>

            {/* Conditional rendering based on toggle */}
            {showLogs && (
              <div className="flex-grow w-full p-4 bg-gray-100 rounded-lg border border-gray-300 overflow-y-auto max-h-48 mt-4">
                <Logs />
              </div>
            )}
          </>
        )}

        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ease-in-out duration-200 focus:outline-none w-full text-center"
        >
          {t('modal.close')}
        </button>
      </div>
    </div>
  )
}

export default NotificationModal
