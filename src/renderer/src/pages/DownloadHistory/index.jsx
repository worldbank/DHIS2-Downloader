import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import JSZip from 'jszip'
import { useLiveQuery } from 'dexie-react-hooks'
import { objectToCsv } from '../../utils/downloadUtils'
import { setNotification, setLoading, triggerNotification } from '../../reducers/statusReducer'
import { queryHeaders } from '../../service/db'
import {
  selectAllRows,
  setSelectedRows,
  setEditedRow,
  clearEditedRow
} from '../../reducers/historyReducer'
import { addSelectedElements } from '../../reducers/dataElementsReducer'

// eslint-disable-next-line react/prop-types
const HistoryPage = ({ dictionaryDb, queryDb }) => {
  const downloadQueries = useLiveQuery(() => queryDb.query.toArray(), []) || []
  const [temporaryNote, setTemporaryNote] = useState('')
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const { selectedRows, editedRow } = useSelector((state) => state.history)
  const worker = new Worker(new URL('../../service/worker.js', import.meta.url))
  const allElements = useLiveQuery(() => dictionaryDb.elements.toArray(), []) || []

  useEffect(() => {
    if (editedRow.rowId !== null) {
      setTemporaryNote(editedRow.note || '')
    }
  }, [editedRow])

  const handleCheckboxChange = (id) => {
    dispatch(setSelectedRows(id))
  }

  const handleDeleteRow = () => {
    // eslint-disable-next-line react/prop-types
    queryDb.query.bulkDelete(selectedRows)
  }

  const handleSelectAllChange = () => {
    const allSelected = selectedRows.length === downloadQueries.length
    const newSelection = allSelected ? [] : downloadQueries.map((q) => q.id)
    dispatch(selectAllRows(newSelection))
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

  const handleEditClick = (id, currentNote) => {
    dispatch(setEditedRow({ id, note: currentNote }))
  }

  const handleNoteChange = (e) => {
    setTemporaryNote(e.target.value)
  }

  const handleSaveNotes = async (event) => {
    event.preventDefault()
    if (editedRow.rowId !== null) {
      try {
        await queryDb.query.update(editedRow.rowId, { notes: temporaryNote })
        dispatch(
          triggerNotification({
            message: `Note ${editedRow.rowId} updated successfully.`,
            type: 'success'
          })
        )
        dispatch(clearEditedRow())
      } catch (error) {
        console.error('Error updating note:', error)
        dispatch(
          triggerNotification({
            message: `Failed to update note: ${error.message}`,
            type: 'error'
          })
        )
      }
    }
  }

  const handlePassParams = (id) => {
    console.log(downloadQueries)
    const params = downloadQueries.filter((el) => el.id === id)
    const dimensions = params.flatMap((param) =>
      param.dimension.includes(';') ? param.dimension.split(';') : param.dimension
    )
    console.log(dimensions)
    const elementsInfo = allElements.filter((el) => dimensions.includes(el.id))
    dispatch(
      addSelectedElements(elementsInfo.map((el) => ({ id: el.id, displayName: el.displayName })))
    )
    dispatch(
      triggerNotification({
        message: `Parameters passed for row ${id}.`,
        type: 'info'
      })
    )
    dispatch(clearEditedRow())
  }

  if (downloadQueries.length === 0) {
    return <p className="text-center text-gray-500">No download history available.</p>
  }

  return (
    <div className="mb-8 w-full flex flex-col space-y-4">
      {/* Toolbar Component */}
      <div className="bg-white px-4 py-2 shadow-md">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-800 font-semibold"
              onClick={handleExportDownloadHistory}
              disabled={downloadQueries.length === 0}
            >
              Export
            </button>
          </div>
        </div>
      </div>
      {/* Table Component */}
      <div className="overflow-x-auto px-4">
        <form onSubmit={handleSaveNotes}>
          <table className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                <th className="py-3 px-3 border-b-2 border-gray-300">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
                    checked={selectedRows.length === downloadQueries.length}
                    onChange={handleSelectAllChange}
                  />
                </th>

                {queryHeaders.map((name, index) => (
                  <th key={index} className="py-3 px-3 border-b-2 border-gray-300">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-800 text-xs font-light">
              {downloadQueries.map((el) => (
                <tr key={el.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b border-gray-300">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
                      checked={selectedRows.includes(el.id)}
                      onChange={() => handleCheckboxChange(el.id)}
                    />
                    <td className="py-3 text-left">
                      <button type="button" onClick={() => handleEditClick(el.id, el.notes)}>
                        Edit
                      </button>
                      {editedRow.rowId === el.id && (
                        <>
                          <button type="submit">Save</button>
                          <button type="button" onClick={() => handlePassParams(el.id)}>
                            Pass
                          </button>
                        </>
                      )}
                    </td>
                  </td>

                  {queryHeaders.map((header) => (
                    <td key={header} className="py-2 px-3 border-b border-gray-300">
                      {editedRow.rowId === el.id && header === 'notes' ? (
                        <input
                          type="text"
                          name={header}
                          value={temporaryNote}
                          onChange={handleNoteChange}
                        />
                      ) : header === 'url' ? (
                        <a
                          href={el[header]}
                          className="text-blue-500 hover:text-blue-600"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {el[header]}
                        </a>
                      ) : (
                        el[header]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleDeleteRow}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-150 ease-in-out"
          disabled={downloadQueries.length === 0}
        >
          Delete
        </button>
        <button
          onClick={handleQuickRedownload}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-150 ease-in-out"
          disabled={selectedRows.length === 0}
        >
          Download Selected Record
        </button>
      </div>
    </div>
  )
}

export default HistoryPage
