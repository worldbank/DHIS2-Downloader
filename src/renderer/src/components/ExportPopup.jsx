import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { closePopup } from '../reducers/exportReducer'

const ExportPopup = () => {
  const dispatch = useDispatch()
  const { isPopupOpen, exportConfig } = useSelector((state) => state.popup)

  const handleExport = () => {
    console.log('Exporting data with config:', exportConfig)
    dispatch(closePopup())
  }

  if (!isPopupOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Export Configuration</h2>
        <div className="mb-4">
          <label className="block mb-2">Exporting Options:</label>
          <select className="p-2 border rounded">
            <option value="all">All</option>
            <option value="thisPage">This Page</option>
            <option value="allAnnotated">All (Annotated)</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handleExport}>
            Export
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => dispatch(closePopup())}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportPopup
