import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { objectToCsv } from '../utils/downloadUtils'
import { updateFormulaNames } from '../utils/helpers'
import ExportLink from '../components/ExportLink'
import Pagination from '../components/Pagination'

// eslint-disable-next-line react/prop-types
export default function DataDictionary({ dictionaryDb }) {
  const { t } = useTranslation()
  const dbRef = useRef(dictionaryDb)

  // pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [jumpToPage, setJumpToPage] = useState('')
  const [currentPageData, setCurrentPageData] = useState([])

  // per-column filters
  const [columnFilters, setColumnFilters] = useState({
    category: '',
    id: '',
    displayName: '',
    displayDescription: '',
    categories: '',
    numerator: '',
    numeratorName: '',
    denominator: '',
    denominatorName: ''
  })
  const handleColumnFilterChange = (col) => (e) => {
    setColumnFilters((prev) => ({ ...prev, [col]: e.target.value }))
    setCurrentPage(1)
  }

  // load all items from Dexie
  const allElements =
    useLiveQuery(() => dbRef.current.elements.orderBy('category').toArray(), []) || []
  const data = useMemo(() => allElements, [allElements])

  // filter logic: only per-column
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // flatten categories/options
      const categoriesText =
        item.categoryCombo?.categories
          ?.flatMap((cat) => [
            cat.displayName,
            ...(cat.categoryOptions?.map((opt) => opt.displayName) || [])
          ])
          .join(' ') || ''

      const lookup = {
        category: item.category,
        id: item.id,
        displayName: item.displayName,
        displayDescription: item.displayDescription || '',
        categories: categoriesText,
        numerator: item.numerator?.toString() ?? '',
        numeratorName: item.numeratorName ?? '',
        denominator: item.denominator?.toString() ?? '',
        denominatorName: item.denominatorName ?? ''
      }

      return Object.entries(columnFilters).every(([col, val]) => {
        if (!val) return true
        return lookup[col].toLowerCase().includes(val.trim().toLowerCase())
      })
    })
  }, [data, columnFilters])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // paginate & apply formula names
  const fetchPage = useCallback(() => {
    const start = (currentPage - 1) * itemsPerPage
    const page = filteredData.slice(start, start + itemsPerPage)
    const withNum = updateFormulaNames(page, data, 'numerator')
    const withDen = updateFormulaNames(withNum, data, 'denominator')
    setCurrentPageData(withDen)
  }, [currentPage, itemsPerPage, filteredData, data])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])
  useEffect(() => {
    setCurrentPage(1)
  }, [columnFilters])

  // pagination handlers
  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p)
  }
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }
  const handleJumpToPageSubmit = (e) => {
    e.preventDefault()
    const p = Number(jumpToPage)
    if (!isNaN(p) && p >= 1 && p <= totalPages) setCurrentPage(p)
  }

  // flatten for CSV export
  const flattenForExport = (item) => {
    const categoriesText =
      item.categoryCombo?.categories
        ?.map((cat) => {
          const opts = cat.categoryOptions?.map((o) => o.displayName).join(', ')
          return `${cat.displayName} [${cat.id}]: ${opts}`
        })
        .join(' | ') || ''

    return {
      category: item.category,
      id: item.id,
      displayName: item.displayName,
      displayDescription: item.displayDescription ?? '',
      categories: categoriesText,
      numerator: item.numerator ?? '',
      numeratorName: item.numeratorName ?? '',
      denominator: item.denominator ?? '',
      denominatorName: item.denominatorName ?? ''
    }
  }
  // export handlers
  const handleExportAll = () => {
    const allWithNum  = updateFormulaNames(data, data, 'numerator')
    const allWithNames = updateFormulaNames(allWithNum, data, 'denominator')
    const rows = allWithNames.map(flattenForExport)
    const csv = objectToCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'DataDictionary_All.csv'
    a.click()
  }
  const handleExportPage = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const rows = currentPageData.map(flattenForExport)
    const csv = objectToCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'DataDictionary_Page.csv'
    a.click()
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Table card */}
      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* header */}
            <tr className="uppercase text-gray-600 text-xs">
              <th className="px-6 py-3">{t('dictionary.type')}</th>
              <th className="px-6 py-3">{t('dictionary.id')}</th>
              <th className="px-6 py-3">{t('dictionary.name')}</th>
              <th className="px-6 py-3">{t('dictionary.description')}</th>
              <th className="px-6 py-3">{t('dictionary.categories')}</th>
              <th className="px-6 py-3">{t('dictionary.numerator')}</th>
              <th className="px-6 py-3">{t('dictionary.numeratorName')}</th>
              <th className="px-6 py-3">{t('dictionary.denominator')}</th>
              <th className="px-6 py-3">{t('dictionary.denominatorName')}</th>
            </tr>
            {/* filter row */}
            <tr className="bg-white">
              {[
                'category',
                'id',
                'displayName',
                'displayDescription',
                'categories',
                'numerator',
                'numeratorName',
                'denominator',
                'denominatorName'
              ].map((col) => (
                <th key={col} className="px-6 py-2">
                  <input
                    type={col === 'numerator' || col === 'denominator' ? 'number' : 'text'}
                    value={columnFilters[col]}
                    onChange={handleColumnFilterChange(col)}
                    placeholder={t('dictionary.filter') || 'Filtrer'}
                    className="w-full border-b border-gray-200 text-xs p-1 focus:outline-none"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-700">
            {currentPageData.length > 0 ? (
              currentPageData.map((el) => (
                <tr key={el.id}>
                  <td className="px-6 py-3">{el.category}</td>
                  <td className="px-6 py-3">{el.id}</td>
                  <td className="px-6 py-3">{el.displayName}</td>
                  <td className="px-6 py-3">{el.displayDescription}</td>
                  <td className="px-6 py-3">
                    {el.categoryCombo?.categories?.map((cat) => (
                      <div key={cat.id}>
                        <strong>{cat.displayName}:</strong>{' '}
                        {cat.categoryOptions?.map((opt) => opt.displayName).join(', ')}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-3">{el.numerator}</td>
                  <td className="px-6 py-3">{el.numeratorName}</td>
                  <td className="px-6 py-3">{el.denominator}</td>
                  <td className="px-6 py-3">{el.denominatorName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-400">
                  {t('dictionary.noResults') || 'Aucun résultat.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* actions & pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex space-x-3">
          <ExportLink onClick={handleExportAll} text={t('dictionary.exportAll')} />
          <ExportLink onClick={handleExportPage} text={t('dictionary.exportPage')} />
        </div>

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
