import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { objectToCsv } from '../utils/downloadUtils'
import { updateFormulaNames } from '../utils/helpers'
import ExportLink from '../components/ExportLink'
import { MicroChevronLeft, MicroChevronRight } from '../components/Icons'
import Pagination from '../components/Pagination'

// eslint-disable-next-line react/prop-types
const DataDictionary = ({ dictionaryDb }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPageData, setCurrentPageData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const dictionaryDbRef = useRef(dictionaryDb)
  const allElements =
    useLiveQuery(() => dictionaryDbRef.current.elements.orderBy('category').toArray(), []) || []

  const data = useMemo(() => allElements, [allElements])

  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [data, searchQuery]
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const fetchData = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const pageData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const updatedPageData = updateFormulaNames(
      updateFormulaNames(pageData, data, 'numerator'),
      data,
      'denominator'
    )

    setCurrentPageData(updatedPageData)
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
            placeholder="Search by Name or ID"
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            Search
          </button>
        </form>
      </div>
      {currentPageData && (
        <div className="overflow-x-auto w-full">
          <table className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
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
            <tbody className="text-gray-600 text-xs font-light">
              {currentPageData.map((el) => (
                <tr key={el.id} className="border-b">
                  <td className="py-1 px-1 border-r break-words">{el.category}</td>
                  <td className="py-1 px-1 border-r [word-break:break-word]">{el.id}</td>
                  <td className="py-1 px-1 border-r break-words">{el.displayName}</td>
                  <td className="py-1 px-1 border-r break-words">{el.displayDescription}</td>
                  <td className="py-1 px-1 border-r [word-break:break-word]">{el.numerator}</td>
                  <td className="py-1 px-1 border-r [word-break:break-word]">{el.numeratorName}</td>
                  <td className="py-1 px-1 border-r [word-break:break-word]">{el.denominator}</td>
                  <td className="py-1 px-1 border-r [word-break:break-word]">
                    {el.denominatorName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      <div className="mt-4 w-full max-w-4xl mx-auto flex justify-between items-center">
        <ExportLink onClick={handleExportAll} text="Export All" />
        <ExportLink onClick={handleExportCurrent} text="Export This Page" />
      </div>
    </div>
  )
}

export default DataDictionary
