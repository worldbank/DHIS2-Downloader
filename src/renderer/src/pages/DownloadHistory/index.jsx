import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLiveQuery } from 'dexie-react-hooks'
import { objectToCsv, jsonToCsv } from '../../utils/downloadUtils'
import { fetchCsvData, fetchData } from '../../service/useApi'
import { setNotification, setLoading, setError } from '../../reducers/statusReducer'

// eslint-disable-next-line react/prop-types
const HistoryPage = ({ dictionaryDb }) => {
  const downloadQueries = useLiveQuery(() => dictionaryDb.query.toArray(), []) || []
  const [selectedRows, setSelectedRows] = useState([])
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)

  const handleCheckboxChange = (id) => {
    // setSelectedRows((prev) =>
    //   prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    // )
    setSelectedRows([id])
  }

  const handleSelectAllChange = () => {
    const allSelected = selectedRows.length === downloadQueries.length
    const newSelection = allSelected ? [] : downloadQueries.map((q) => q.id)
    setSelectedRows(newSelection)
  }

  const handleQuickRedownload = async () => {
    const redownloadingUrls = downloadQueries
      .filter(({ id }) => selectedRows.includes(id))
      .map((el) => el.url)

    try {
      dispatch(setLoading(true))
      for (let i = 0; i < redownloadingUrls.length; i++) {
        const url = redownloadingUrls[i]
        let csvBlob
        if (url.includes('csv')) {
          csvBlob = await fetchCsvData(url, username, password)
        } else {
          const data = await fetchData(url, username, password)
          const { csvData } = jsonToCsv(data)
          csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8' })
        }
        dispatch(setNotification({ message: `Finished ${i}`, type: 'info' }))
        const link = document.createElement('a')
        link.href = URL.createObjectURL(csvBlob)
        link.setAttribute('download', `file_${i}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : error
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleExportDownloadHistory = () => {
    const csvContent = objectToCsv(downloadQueries)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'downloading_history.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (downloadQueries.length === 0) {
    return <p className="text-center text-gray-500">No download history available.</p>
  }

  return (
    <div className="mb-8 w-full flex flex-col space-y-4 p-4">
      <div className="overflow-x-auto w-full">
        <table className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left">
                {/* <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  checked={selectedRows.length === downloadQueries.length}
                  onChange={handleSelectAllChange}
                /> */}
              </th>
              <th className="py-3 px-4 text-left">Organization Level</th>
              <th className="py-3 px-4 text-left">Period</th>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Disaggregation</th>
              <th className="py-3 px-4 text-left">URL</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-xs font-light">
            {downloadQueries.map((el) => (
              <tr key={el.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    checked={selectedRows.includes(el.id)}
                    onChange={() => handleCheckboxChange(el.id)}
                  />
                </td>
                <td className="py-1 px-1 border-r whitespace-normal">{el.ou}</td>
                <td className="py-1 px-1 border-r whitespace-normal">{el.pe}</td>
                <td className="py-1 px-1 border-r whitespace-normal">{el.dx}</td>
                <td className="py-1 px-1 border-r whitespace-normal">{el.co}</td>
                <td className="py-1 px-1 border-r whitespace-normal">
                  <a
                    href={el.url}
                    className="text-blue-500 hover:text-blue-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {el.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleExportDownloadHistory}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-600 transition duration-150 ease-in-out"
          disabled={downloadQueries.length === 0}
        >
          Export Downloading History
        </button>
        <button
          onClick={handleQuickRedownload}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-600 transition duration-150 ease-in-out"
          disabled={selectedRows.length === 0}
        >
          Downloading Selected Record
        </button>
      </div>
    </div>
  )
}

export default HistoryPage
