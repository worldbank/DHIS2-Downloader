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
  const [layoutFormat, setLayoutFormat] = useState('long')
  const [perOuMode, setPerOuMode] = useState(false)

  const handleConfirm = () => {
    if (!customChunkSize || isNaN(customChunkSize) || customChunkSize <= 0) {
      alert(t('modal.invalidInput'))
      return
    }

    const parsedChunkSize = parseInt(customChunkSize, 10)
    dispatch(setChunkingStrategy(parsedChunkSize))

    const layout =
      layoutFormat === 'wide'
        ? { rows: ['ou', 'pe'], columns: ['dx'] }
        : { rows: ['ou', 'pe', 'dx'], columns: [] }

    // PASS the flag as a 2nd arg
    onStrategySelect(layout, perOuMode)
    dispatch(closeModal())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">{t('modal.title')}</h2>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">{t('modal.format')}</label>
          <select
            value={layoutFormat}
            onChange={(e) => setLayoutFormat(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="long">{t('modal.long')}</option>
            <option value="wide">{t('modal.wide')}</option>
          </select>
        </div>

        {/* Chunk Size Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">{t('modal.description')}</label>
          <input
            type="number"
            min="1"
            value={customChunkSize}
            onChange={(e) => setCustomChunkSize(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={t('modal.placeholder')}
          />
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            id="perOuMode"
            type="checkbox"
            checked={perOuMode}
            onChange={(e) => setPerOuMode(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
          />
          <label htmlFor="perOuMode" className="text-sm text-gray-700">
            {t('modal.perOuMode')}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => dispatch(closeModal())}
            className="text-sm px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="text-sm px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {t('modal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChunkingStrategyModal
