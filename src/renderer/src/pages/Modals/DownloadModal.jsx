import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../reducers/modalReducer'
import { setChunkingStrategy } from '../../reducers/downloadReducer'

// eslint-disable-next-line react/prop-types
const ChunkingStrategyModal = ({ onStrategySelect }) => {
  const dispatch = useDispatch()
  const [customChunkSize, setCustomChunkSize] = useState('3')

  const handleConfirm = () => {
    if (!customChunkSize || isNaN(customChunkSize) || customChunkSize <= 0) {
      alert('Please enter a valid positive number for chunk size.')
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
        <h3 className="text-lg font-semibold mb-4 text-center">Split Data Into Smaller Chunks</h3>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">
            Enter the number of time periods for each chunk.
          </label>
          <input
            type="number"
            value={customChunkSize}
            onChange={(e) => setCustomChunkSize(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Enter a number"
            min="1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => dispatch(closeModal())}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChunkingStrategyModal
