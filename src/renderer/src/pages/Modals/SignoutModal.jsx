import React from 'react'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../reducers/modalReducer'
import { disconnect, clearHistory } from '../../reducers/authReducer'
import { useTranslation } from 'react-i18next'

const SignoutModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const handleConfirm = async () => {
    await dispatch(clearHistory())
    dispatch(disconnect())
    dispatch(closeModal())
  }

  const handleCancel = () => {
    dispatch(closeModal())
  }

  const handleDeny = () => {
    dispatch(disconnect())
    dispatch(closeModal())
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900">{t('modal.signoutTitle')}</h3>
        <p className="text-gray-600 text-sm">{t('modal.signoutDescription')}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
          >
            {t('modal.yes')}
          </button>
          <button
            onClick={handleDeny}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            {t('modal.no')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignoutModal
