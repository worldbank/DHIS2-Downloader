import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { objectToCsv } from '../utils/downloadUtils'
import { updateFormulaNames } from '../utils/helpers'
import ExportLink from '../components/ExportLink'
import Pagination from '../components/Pagination'

// eslint-disable-next-line react/prop-types
const DataDictionary = ({ dictionaryDb }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPageData, setCurrentPageData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchColumn, setSearchColumn] = useState('all')
  const dictionaryDbRef = useRef(dictionaryDb)
  const { t } = useTranslation()

  const allElements =
    useLiveQuery(() => dictionaryDbRef.current.elements.orderBy('category').toArray(), []) || []
  const data = useMemo(() => allElements, [allElements])

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data

    return data.filter((item) => {
      const categoriesText =
        item.categoryCombo?.categories
          ?.flatMap((cat) => [
            cat.displayName,
            ...(cat.categoryOptions?.map((opt) => opt.displayName) || [])
          ])
          .join(' ') || ''

      let fieldText = ''
      switch (searchColumn) {
        case 'category':
          fieldText = item.category
          break
        case 'id':
          fieldText = item.id
          break
        case 'displayName':
          fieldText = item.displayName
          break
        case 'displayDescription':
          fieldText = item.displayDescription || ''
          break
        case 'categories':
          fieldText = categoriesText
          break
        case 'numerator':
          fieldText = item.numerator?.toString() ?? ''
          break
        case 'numeratorName':
          fieldText = item.numeratorName || ''
          break
        case 'denominator':
          fieldText = item.denominator?.toString() ?? ''
          break
        case 'denominatorName':
          fieldText = item.denominatorName || ''
          break
        case 'all':
        default:
          fieldText = [
            item.category,
            item.id,
            item.displayName,
            item.displayDescription,
            categoriesText,
            item.numeratorName,
            item.denominatorName
          ].join(' ')
      }

      return fieldText.toLowerCase().includes(q)
    })
  }, [data, searchColumn, searchQuery])

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchColumn])

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const handleJumpToPageSubmit = (event) => {
    event.preventDefault()
    const page = Number(jumpToPage)
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const flattenForExport = (item) => {
    const disaggregateSummary =
      item.categoryCombo?.categories
        ?.map((cat) => {
          const catName = `${cat.displayName} [${cat.id}]`
          const options = cat.categoryOptions
            ?.map((opt) => `${opt.displayName} [${opt.id}]`)
            .join(', ')
          return `${catName}: ${options}`
        })
        .join(' | ') || 'N/A'

    const { categoryCombo, ...rest } = item
    return {
      ...rest,
      categoryCombo: disaggregateSummary
    }
  }

  const handleExportAll = () => {
    try {
      const csvDataPoints = objectToCsv(data.map(flattenForExport))
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
      const csvDataPoints = objectToCsv(currentPageData.map(flattenForExport))
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
    setCurrentPage(1)
  }

  return (
    <div className="mt-4 flex flex-col items-center w-full">
      <div className="w-full max-w-4xl mx-auto mb-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">{t('dictionary.allColumns')}</option>
            <option value="category">{t('dictionary.type')}</option>
            <option value="id">{t('dictionary.id')}</option>
            <option value="displayName">{t('dictionary.name')}</option>
            <option value="displayDescription">{t('dictionary.description')}</option>
            <option value="categories">{t('dictionary.categories')}</option>
            <option value="numerator">{t('dictionary.numerator')}</option>
            <option value="numeratorName">{t('dictionary.numeratorName')}</option>
            <option value="denominator">{t('dictionary.denominator')}</option>
            <option value="denominatorName">{t('dictionary.denominatorName')}</option>
          </select>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={t('dictionary.searchPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            {t('dictionary.search')}
          </button>
        </form>
      </div>

      {currentPageData.length > 0 && (
        <div className="overflow-x-auto w-full">
          <table className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                <th className="py-1 px-1 border-r">{t('dictionary.type')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.id')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.name')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.description')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.categories')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.numerator')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.numeratorName')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.denominator')}</th>
                <th className="py-1 px-1 border-r">{t('dictionary.denominatorName')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-xs font-light">
              {currentPageData.map((el) => (
                <tr key={el.id} className="border-b">
                  <td className="py-1 px-1 border-r break-words">{el.category}</td>
                  <td className="py-1 px-1 border-r break-words">{el.id}</td>
                  <td className="py-1 px-1 border-r break-words">{el.displayName}</td>
                  <td className="py-1 px-1 border-r break-words">{el.displayDescription}</td>
                  <td className="py-1 px-1 border-r break-words">
                    {el.categoryCombo?.categories?.map((cat) => (
                      <div key={cat.id}>
                        <strong>{cat.displayName}:</strong>{' '}
                        {cat.categoryOptions?.map((opt) => opt.displayName).join(', ')}
                      </div>
                    ))}
                  </td>
                  <td className="py-1 px-1 border-r break-words">{el.numerator}</td>
                  <td className="py-1 px-1 border-r break-words">{el.numeratorName}</td>
                  <td className="py-1 px-1 border-r break-words">{el.denominator}</td>
                  <td className="py-1 px-1 border-r break-words">{el.denominatorName}</td>
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
        <ExportLink onClick={handleExportAll} text={t('dictionary.exportAll')} />
        <ExportLink onClick={handleExportCurrent} text={t('dictionary.exportPage')} />
      </div>
    </div>
  )
}

export default DataDictionary
