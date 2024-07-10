import { useState, useEffect } from 'react'
import { getOrganizationLevels } from '../../service/useApi'

// eslint-disable-next-line react/prop-types
const OrgUnitLevelMenu = ({ dhis2Url, username, password, orgUnitLevel, handleOrgUnitLevel }) => {
  const [allOrgUnitLevels, setAllOrgUnitLevels] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchOrganizationLevels = async () => {
      try {
        const data = await getOrganizationLevels(dhis2Url, username, password)
        const sortedData = data.organisationUnitLevels.sort((a, b) => a.level - b.level)
        setAllOrgUnitLevels(sortedData)
      } catch (error) {
        console.error('Error fetching organization levels:', error)
      }
    }
    fetchOrganizationLevels()
  }, [dhis2Url, username, password])

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const selectedOrgUnitName = allOrgUnitLevels
    .filter((level) => orgUnitLevel?.includes(level.level))
    ?.map((level) => level.displayName)

  return (
    <div className="relative w-full">
      <div className="p-4 bg-gray-100">
        <div>
          {orgUnitLevel.map((level, index) => (
            <span key={index} className="p-1">
              {allOrgUnitLevels.find((l) => l.level === level)?.displayName}
            </span>
          ))}
        </div>
        <div
          className="mb-2 w-full px-4 py-2 border border-gray-700 rounded cursor-pointer relative flex items-center"
          onClick={toggleDropdown}
        >
          {orgUnitLevel?.length > 0 ? (
            <span className="flex-grow">{orgUnitLevel?.length} selected</span>
          ) : (
            <span className="flex-grow">{'Select Level'}</span>
          )}
          <span className="absolute right-4 pointer-events-none">▼</span>
        </div>
        {dropdownOpen && (
          <div className="absolute bg-select-background border mt-1 z-10 overflow-y-auto no-scrollbar rounded shadow-lg">
            <ul className="min-w-max">
              {allOrgUnitLevels.map((level) => (
                <li key={level.id}>
                  <label className="flex items-center whitespace-nowrap cursor-pointer px-4 py-1 transition-colors hover:bg-blue-100">
                    <input
                      type="checkbox"
                      value={level.level}
                      checked={orgUnitLevel.includes(level.level)}
                      className="cursor-pointer"
                      onChange={handleOrgUnitLevel}
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
