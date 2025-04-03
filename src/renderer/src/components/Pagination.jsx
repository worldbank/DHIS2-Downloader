import React from 'react'
import { useTranslation } from 'react-i18next'
import { MicroChevronLeft, MicroChevronRight } from './Icons'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onItemsPerPageChange,
  onJumpToPageSubmit,
  jumpToPage,
  setJumpToPage,
  itemsPerPage
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex justify-between items-center mt-4 w-full max-w-4xl mx-auto text-sm">
      <div className="flex items-center">
        <form onSubmit={onJumpToPageSubmit} className="flex items-center">
          <label htmlFor="jumpToPage" className="mr-2">
            {t('pagination.jumpToPage')}
          </label>
          <input
            type="number"
            id="jumpToPage"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded"
          />
          <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
            {t('pagination.go')}
          </button>
        </form>
      </div>
      <div className="flex items-center">
        <div>
          <label htmlFor="itemsPerPage" className="mr-2">
            {t('pagination.rowsPerPage')}
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <span className="mx-4">
          {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
        </span>
        <div className="mx-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            <MicroChevronLeft />
          </button>
        </div>
        <div className="mx-2">
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            <MicroChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
