import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import JSZip from 'jszip'
import { useLiveQuery } from 'dexie-react-hooks'
import { objectToCsv, jsonToCsv } from '../../utils/downloadUtils'
import { setNotification, setLoading } from '../../reducers/statusReducer'

// eslint-disable-next-line react/prop-types
const HistoryPage = ({ queryDb }) => {
  const downloadQueries = useLiveQuery(() => queryDb.query.toArray(), []) || []
  const [selectedRows, setSelectedRows] = useState([])
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const worker = new Worker(new URL('../../service/worker.js', import.meta.url))

  const handleCheckboxChange = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  const handleSelectAllChange = () => {
    const allSelected = selectedRows.length === downloadQueries.length
    const newSelection = allSelected ? [] : downloadQueries.map((q) => q.id)
    setSelectedRows(newSelection)
  }

  const handleQuickRedownload = async () => {
    if (!worker || selectedRows.length === 0) {
      console.log('No worker or no URLs selected for redownload.')
      return
    }

    const zip = new JSZip()
    dispatch(setLoading(true))

    const fetchFile = async (url, index) => {
      return new Promise((resolve, reject) => {
        const handleMessage = (e) => {
          if (e.data.index === index) {
            worker.removeEventListener('message', handleMessage)

            if (e.data.type === 'success') {
              const csvBlob = new Blob([e.data.data], { type: 'text/csv;charset=utf-8' })
              zip.file(`history_${index}.csv`, csvBlob)
              dispatch(
                setNotification({ message: `Finished downloading from ${url}`, type: 'info' })
              )
              resolve()
            } else if (e.data.type === 'error') {
              dispatch(setNotification({ message: e.data.message, type: 'error' }))
              reject(new Error(e.data.message))
            }
          }
        }
        worker.addEventListener('message', handleMessage)
        worker.postMessage({ url, username, password, index })
      })
    }

    try {
      const promises = downloadQueries
        .filter(({ id }) => selectedRows.includes(id))
        .map((query, index) => fetchFile(query.url, index))

      await Promise.all(promises)

      zip.generateAsync({ type: 'blob' }).then((content) => {
        const element = document.createElement('a')
        element.href = URL.createObjectURL(content)
        element.download = 'selected_histories.zip'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      })
    } catch (error) {
      console.error('Error processing downloads:', error)
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
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  checked={selectedRows.length === downloadQueries.length}
                  onChange={handleSelectAllChange}
                />
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
          Download Selected Record
        </button>
      </div>
    </div>
  )
}

export default HistoryPage
