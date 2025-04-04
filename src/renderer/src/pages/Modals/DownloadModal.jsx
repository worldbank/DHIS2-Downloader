import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../reducers/modalReducer'
import { setChunkingStrategy } from '../../reducers/downloadReducer'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/prop-types
const ChunkingStrategyModal = ({ onStrategySelect }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [customChunkSize, setCustomChunkSize] = useState('3')

  const handleConfirm = () => {
    if (!customChunkSize || isNaN(customChunkSize) || customChunkSize <= 0) {
      alert(t('modal.invalidInput'))
      return
    }

    const parsedChunkSize = parseInt(customChunkSize, 10)
    dispatch(setChunkingStrategy(parsedChunkSize))
    onStrategySelect(parsedChunkSize)
    console.log(`Updated Redux with chunk size: ${parsedChunkSize}`)
    dispatch(closeModal())
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg w-80">
        <h3 className="text-lg font-semibold mb-4 text-center">{t('modal.title')}</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">{t('modal.description')}</label>
          <input
            type="number"
            value={customChunkSize}
            onChange={(e) => setCustomChunkSize(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder={t('modal.placeholder')}
            min="1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => dispatch(closeModal())}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChunkingStrategyModal
