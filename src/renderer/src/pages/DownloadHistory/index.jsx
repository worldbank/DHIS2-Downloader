import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import JSZip from 'jszip'
import { useLiveQuery } from 'dexie-react-hooks'
import { objectToCsv } from '../../utils/downloadUtils'
import { setLoading, triggerNotification } from '../../reducers/statusReducer'
import { queryHeaders } from '../../service/db'
import {
  selectAllRows,
  setSelectedRows,
  setEditedRow,
  clearEditedRow
} from '../../reducers/historyReducer'
import { addSelectedElements, clearSelectedElements } from '../../reducers/dataElementsReducer'
import {
  updateOrgUnitLevels,
  toggleOrgUnitSelection,
  clearOrgUnitLevels,
  clearOrgUnitSelections
} from '../../reducers/orgUnitReducer'
import { clearSelectedCategory, setSelectedCategory } from '../../reducers/categoryReducer'
import { MicroArrowDownTray, MicroArrowTopRight, MicroTrash } from '../../components/Icons'
import Pagination from '../../components/Pagination'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/prop-types
const HistoryPage = ({ dictionaryDb, queryDb }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const downloadQueries = useLiveQuery(() => queryDb.query.toArray(), []) || []
  const [temporaryNote, setTemporaryNote] = useState('')
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const { selectedRows, editedRow } = useSelector((state) => state.history)
  const worker = new Worker(new URL('../../service/worker.js', import.meta.url))
  const allElements = useLiveQuery(() => dictionaryDb.elements.toArray(), []) || []
  const { t } = useTranslation()

  const totalPages = useMemo(() => {
    return Math.ceil(downloadQueries.length / itemsPerPage)
  }, [downloadQueries.length, itemsPerPage])

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return downloadQueries.slice(startIndex, endIndex)
  }, [currentPage, itemsPerPage, downloadQueries])

  useEffect(() => {}, [currentPageData])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const handleJumpToPageSubmit = (event) => {
    event.preventDefault()
    const page = Number(jumpToPage)
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

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
                triggerNotification({
                  message: t('history.finishedDownloading', { url: url }),
                  type: 'info'
                })
              )
              resolve()
            } else if (e.data.type === 'error') {
              dispatch(triggerNotification({ message: e.data.message, type: 'error' }))
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
            message: t('history.updateSuccess', { id: editedRow.rowId }),
            type: 'success'
          })
        )
        dispatch(clearEditedRow())
      } catch (error) {
        console.error('Error updating note:', error)
        dispatch(
          triggerNotification({
            message: t('history.noteUpdateFail', { error: error.message }),
            type: 'error'
          })
        )
      }
    }
  }

  const clearExistingParams = () => {
    dispatch(clearSelectedElements())
    dispatch(clearOrgUnitSelections())
    dispatch(clearOrgUnitLevels())
    dispatch(clearSelectedCategory())
  }

  const handlePassParams = (id) => {
    clearExistingParams()
    const params = downloadQueries.filter((el) => el.id === id)
    const dimensions = params.flatMap((param) =>
      param.dimension.includes(';') ? param.dimension.split(';') : param.dimension
    )
    // organUnitLevel
    params.forEach((param) => {
      ;(param.organizationLevel.includes(';')
        ? param.organizationLevel.split(';')
        : [param.organizationLevel]
      ).forEach((org) => {
        if (org.includes('LEVEL')) {
          const numericLevel = parseInt(org.replace(/LEVEL-/gi, ''), 10)
          if (!isNaN(numericLevel)) {
            dispatch(updateOrgUnitLevels(numericLevel))
          }
        } else if (org.length == 11) {
          dispatch(toggleOrgUnitSelection(org))
        }
      })
    })

    // Disaggregation (Additional measures for disaggregations being '')
    const disaggregations = params
      .flatMap((param) =>
        param.disaggregation.includes(';') ? param.disaggregation.split(';') : param.disaggregation
      )
      .filter((dis) => dis !== '')

    if (disaggregations.length > 0) {
      disaggregations.forEach((dis) => dispatch(setSelectedCategory(dis)))
    }

    // dimension
    const elementsInfo = allElements.filter((el) => dimensions.includes(el.id))
    dispatch(
      addSelectedElements(elementsInfo.map((el) => ({ id: el.id, displayName: el.displayName })))
    )
    dispatch(
      triggerNotification({
        message: t('history.paramsPassed', { id: id }),
        type: 'info'
      })
    )
    dispatch(clearEditedRow())
  }

  if (downloadQueries.length === 0) {
    return <p className="text-center text-gray-500">{t('history.noHistory')}</p>
  }

  return (
    <div className="mb-8 w-full flex flex-col space-y-4">
      {/* Toolbar Component */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-t-lg">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            <button
              className="text-blue-600 hover:text-blue-800 font-semibold px-4 text-sm"
              onClick={handleExportDownloadHistory}
              disabled={downloadQueries.length === 0}
            >
              <MicroArrowTopRight /> {t('history.exportHistory')}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteRow}
              className="text-blue-600 hover:text-blue-800 font-semibold px-4 text-sm transition duration-150 ease-in-out"
              disabled={downloadQueries.length === 0}
            >
              <MicroTrash /> {t('history.delete')}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleQuickRedownload}
              className="text-blue-600 hover:text-blue-800 font-semibold px-4 text-sm transition duration-150 ease-in-out"
              disabled={selectedRows.length === 0}
            >
              <MicroArrowDownTray /> {t('history.reDownload')}
            </button>
          </div>
        </div>
      </div>
      {/* Table Component */}
      <div className="overflow-x-auto px-4">
        <form onSubmit={handleSaveNotes}>
          <div className="w-full bg-white rounded-lg shadow-lg">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                  <th className="py-3 px-3 sticky left-0 z-10 bg-gray-100">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
                      checked={selectedRows.length === downloadQueries.length}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  {queryHeaders.map((name, index) => (
                    <th key={index} className="py-2 px-2 whitespace-nowrap">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-800 text-xs font-light">
                {currentPageData.map((el) => (
                  <tr key={el.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 sticky left-0 z-10 bg-white">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-gray-600 transition duration-150 ease-in-out"
                        checked={selectedRows.includes(el.id)}
                        onChange={() => handleCheckboxChange(el.id)}
                      />
                      <div className="flex space-x-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(el.id, el.notes)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {t('history.edit')}
                        </button>
                        {editedRow.rowId === el.id && (
                          <>
                            <button type="submit" className="text-green-600 hover:text-green-800">
                              {t('history.save')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePassParams(el.id)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              {t('history.pass')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    {queryHeaders.map((header) => (
                      <td key={header} className="py-2 px-2 [word-break:break-word]">
                        {editedRow.rowId === el.id && header === 'notes' ? (
                          <input
                            type="text"
                            name={header}
                            value={temporaryNote}
                            onChange={handleNoteChange}
                            className="w-full p-1 border rounded"
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
          </div>
        </form>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          onJumpToPageSubmit={handleJumpToPageSubmit}
          jumpToPage={jumpToPage}
          setJumpToPage={setJumpToPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  )
}

export default HistoryPage
