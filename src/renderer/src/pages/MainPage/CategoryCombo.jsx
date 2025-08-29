import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedCategory } from '../../reducers/categoryReducer'
import { mouseClick, mouseToggle } from '../../reducers/mouseReducer'
import { useTranslation } from 'react-i18next'

const CategoryDropdownMenu = () => {
  const dispatch = useDispatch()
  const { categories, orgUnitGroupSets, selectedCategory } = useSelector((state) => state.category)
  const openDropdowns = useSelector((state) => state.mouse.openDropdowns)
  const { t } = useTranslation()
  const dropdownId = 'categoryDropdown'
  const dropdownRef = useRef(null)

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      dispatch(mouseClick())
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleDropdownToggle = (e) => {
    e.stopPropagation()
    dispatch(mouseToggle(dropdownId))
  }

  const handleSelectCategory = (id, e) => {
    e.stopPropagation()
    dispatch(setSelectedCategory(id))
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="p-4 bg-gray-100">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded cursor-pointer relative flex items-center bg-white text-gray-700"
          onClick={handleDropdownToggle}
        >
          {selectedCategory.length > 0 ? (
            <span className="flex-grow">{selectedCategory.length} selected</span>
          ) : (
            <span className="flex-grow">{t('mainPage.selectDisaggregation')}</span>
          )}
          <span className="absolute right-4 pointer-events-none">▼</span>
        </div>

        {openDropdowns[dropdownId] && (
          <div className="absolute mt-1 w-full rounded-lg shadow-lg bg-white border border-gray-200 z-10">
            <ul className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {orgUnitGroupSets.length > 0 && (
                <>
                  <li className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Organization Unit Groups
                  </li>
                  {orgUnitGroupSets.map((set) => (
                    <li key={set.id}>
                      <label
                        className="flex text-sm items-center space-x-2 py-1 px-2 cursor-pointer font-semibold"
                        onClick={(e) => handleSelectCategory(set.id, e)}
                      >
                        <input
                          type="checkbox"
                          value={set.id}
                          checked={selectedCategory.includes(set.id)}
                          onChange={(e) => handleSelectCategory(set.id, e)}
                          className="cursor-pointer"
                        />
                        <span>{set.displayName}</span>
                      </label>
                    </li>
                  ))}
                </>
              )}

              {/* --- CATEGORIES --- */}
              {categories.length > 0 && (
                <>
                  <li className="px-2 pt-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-t border-gray-200">
                    Categories
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <label
                        className="flex text-sm items-center space-x-2 py-1 px-2 cursor-pointer"
                        onClick={(e) => handleSelectCategory(cat.id, e)}
                      >
                        <input
                          type="checkbox"
                          value={cat.id}
                          checked={selectedCategory.includes(cat.id)}
                          onChange={(e) => handleSelectCategory(cat.id, e)}
                          className="cursor-pointer"
                        />
                        <span>{cat.displayName}</span>
                      </label>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryDropdownMenu
