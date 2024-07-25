import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategoryCombinations, setSelectedCategory } from '../../reducers/categoryReducer'
import { mouseClick, mouseToggle } from '../../reducers/mouseReducer'

const CategoryDropdownMenu = () => {
  const dispatch = useDispatch()
  const { category, selectedCategory } = useSelector((state) => state.category)
  const openDropdowns = useSelector((state) => state.mouse.openDropdowns)
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const dropdownId = 'categoryDropdown'
  const dropdownRef = useRef(null)

  useEffect(() => {
    dispatch(fetchCategoryCombinations({ dhis2Url, username, password }))
  }, [dhis2Url, username, password, dispatch])

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      dispatch(mouseClick())
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
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
          className="w-full px-3 py-2 border border-gray-300 rounded cursor-pointer relative flex items-center bg-white text-gray-700 focus:outline-none focus:border-blue-500"
          onClick={handleDropdownToggle}
        >
          {selectedCategory.length > 0 ? (
            <span className="flex-grow">{selectedCategory?.length} selected</span>
          ) : (
            <span className="flex-grow">Select Category Combination</span>
          )}
          <span className="absolute right-4 pointer-events-none">▼</span>
        </div>
        {openDropdowns[dropdownId] && (
          <div className="absolute bg-white border border-gray-300 mt-1 z-10 rounded shadow-lg">
            <ul className="max-h-60 overflow-auto custom-scrollbar">
              {category?.map((combo) => (
                <li
                  key={combo.id}
                  className="px-4 py-2 text-base text-gray-700 transition-colors hover:bg-blue-100"
                  onClick={(e) => handleSelectCategory(combo.id, e)}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={combo.id}
                      checked={selectedCategory.includes(combo.id)}
                      className="cursor-pointer"
                      onChange={(e) => handleSelectCategory(combo.id, e)}
                    />
                    <span className="ml-2">{combo.displayName}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryDropdownMenu
