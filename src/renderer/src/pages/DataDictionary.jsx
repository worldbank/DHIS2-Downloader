import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import LoadingModal from './Modal'
import { objectToCsv } from '../utils/helpers'
import { updateFormulaNames } from '../utils/helpers'
import ExportLink from '../components/ExportLink'

// eslint-disable-next-line react/prop-types
const DataDictionary = ({ dictionaryDb }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState('')
  const [currentPageData, setCurrentPageData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const dictionaryDbRef = useRef(dictionaryDb)
  const elements = useLiveQuery(() => dictionaryDbRef.current.dataElements.toArray(), []) || []
  const indicators = useLiveQuery(() => dictionaryDbRef.current.indicators.toArray(), []) || []
  const catOptionCombos =
    useLiveQuery(() => dictionaryDbRef.current.catOptionCombos.toArray(), []) || []

  const data = useMemo(
    () => [
      ...elements.map((item) => ({
        ...item,
        numerator: null,
        denominator: null,
        category: 'DataElement'
      })),
      ...indicators.map((item) => ({ ...item, category: 'Indicator' })),
      ...catOptionCombos.map((item) => ({ ...item, category: 'Category Options' }))
    ],
    [elements, indicators, catOptionCombos]
  )

  const filteredData = useMemo(
    () => data.filter((item) => item.displayName.toLowerCase().includes(searchQuery.toLowerCase())),
    [data, searchQuery]
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const fetchData = useCallback(() => {
    setIsLoading('Loading')
    const startIndex = (currentPage - 1) * itemsPerPage
    const pageData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const updatedPageData = updateFormulaNames(
      updateFormulaNames(pageData, data, 'numerator'),
      data,
      'denominator'
    )

    setCurrentPageData(updatedPageData)
    setIsLoading('')
  }, [currentPage, itemsPerPage, filteredData, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  const handleJumpToPageChange = (event) => {
    setJumpToPage(event.target.value)
  }

  const handleJumpToPageSubmit = (event) => {
    event.preventDefault()
    const page = Number(jumpToPage)
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleExportAll = () => {
    try {
      const csvDataPoints = objectToCsv(data)
      const csvBlob = new Blob([csvDataPoints], { type: 'text/csv' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(csvBlob)
      downloadLink.download = 'JsonId.csv'
      downloadLink.click()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading('')
    }
  }

  const handleExportCurrent = () => {
    try {
      const csvDataPoints = objectToCsv(currentPageData)
      const csvBlob = new Blob([csvDataPoints], { type: 'text/csv' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(csvBlob)
      downloadLink.download = 'JsonId_thisPage.csv'
      downloadLink.click()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading('')
    }
  }

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1) // Reset to first page when search query changes
  }

  return (
    <div className="mt-4 flex flex-col items-center w-full">
      <div className="w-full max-w-4xl mx-auto mb-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            Search
          </button>
        </form>
      </div>
      {currentPageData && (
        <div className="overflow-x-auto w-full">
          <table className="w-full max-w-4xl mx-auto bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b text-base">
                <th className="py-1 px-1 border-r">Type</th>
                <th className="py-1 px-1 border-r">JSON ID</th>
                <th className="py-1 px-1 border-r">Name</th>
                <th className="py-1 px-1 border-r">Description</th>
                <th className="py-1 px-1 border-r">Numerator</th>
                <th className="py-1 px-1 border-r">Numerator Name</th>
                <th className="py-1 px-1 border-r">Denominator</th>
                <th className="py-1 px-1 border-r">Denominator Name</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {currentPageData.map((el) => (
                <tr key={el.id} className="border-b">
                  <td className="py-1 px-1 border-r whitespace-normal">{el.category}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.id}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.displayName}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.displayDescription}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.numerator}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.numeratorName}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.denominator}</td>
                  <td className="py-1 px-1 border-r whitespace-normal">{el.denominatorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4 w-full max-w-4xl mx-auto">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
      <div className="mt-4 w-full max-w-4xl mx-auto flex justify-between items-center">
        <div>
          <label htmlFor="itemsPerPage" className="mr-2">
            Rows per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <form onSubmit={handleJumpToPageSubmit} className="flex items-center">
            <label htmlFor="jumpToPage" className="mr-2">
              Jump to page:
            </label>
            <input
              type="number"
              id="jumpToPage"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={handleJumpToPageChange}
              className="px-2 py-1 border border-gray-300 rounded"
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
              Go
            </button>
          </form>
        </div>
      </div>
      <div className="mt-4 w-full max-w-4xl mx-auto flex justify-between items-center">
        <ExportLink onClick={handleExportAll} text="Export All" />
        <ExportLink onClick={handleExportCurrent} text="Export This Page" />
      </div>

      {isLoading.length > 0 && <LoadingModal isLoading={isLoading} />}
    </div>
  )
}

export default DataDictionary
