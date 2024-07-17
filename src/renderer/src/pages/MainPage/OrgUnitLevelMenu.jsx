import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateOrgUnitLevels, fetchOrganizationLevels } from '../../reducers/orgUnitReducer'

const OrgUnitLevelMenu = ({ dhis2Url, username, password }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()
  const { allOrgUnitLevels, selectedOrgUnitLevels } = useSelector((state) => state.orgUnit)

  useEffect(() => {
    dispatch(fetchOrganizationLevels({ dhis2Url, username, password }))
  }, [dispatch, dhis2Url, username, password])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false)
    }
  }

  const handleOrgUnitLevelChange = (level) => {
    dispatch(updateOrgUnitLevels(level))
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="p-4 bg-gray-100">
        <div
          className="w-full px-3 py-2 border border-gray-300 rounded cursor-pointer relative flex items-center bg-white text-gray-700 focus:outline-none focus:border-blue-500"
          onClick={toggleDropdown}
        >
          {selectedOrgUnitLevels?.length > 0 ? (
            <span className="flex-grow">{selectedOrgUnitLevels?.length} selected</span>
          ) : (
            <span className="flex-grow">{'Select Level'}</span>
          )}
          <span className="absolute right-4 pointer-events-none">▼</span>
        </div>
        {dropdownOpen && (
          <div className="absolute bg-white border border-gray-300 mt-1 z-10 rounded shadow-lg">
            <ul className="max-h-60 overflow-auto custom-scrollbar">
              {allOrgUnitLevels.map((level) => (
                <li
                  key={level.id}
                  className="px-4 py-2 text-base text-gray-700 transition-colors hover:bg-blue-100"
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={level.level}
                      checked={selectedOrgUnitLevels.includes(level.level)}
                      className="cursor-pointer"
                      onChange={() => handleOrgUnitLevelChange(level.level)}
                    />
                    <span className="ml-2">{level.displayName}</span>
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

export default OrgUnitLevelMenu
