import { useState, useEffect } from 'react'
import { getOrganizationLevels } from '../../service/useApi'

// eslint-disable-next-line react/prop-types
const OrgUnitLevelMenu = ({ dhis2Url, username, password, orgUnitLevel, handleOrgUnitLevel }) => {
  const [allOrgUnitLevels, setOrgUnitLevels] = useState([])

  useEffect(() => {
    const fetchOrganizationLevels = async () => {
      try {
        const data = await getOrganizationLevels(dhis2Url, username, password)
        const sortedData = data.organisationUnitLevels.sort((a, b) => a.level - b.level)
        setOrgUnitLevels(sortedData)
      } catch (error) {
        console.error('Error fetching organization levels:', error)
      }
    }

    fetchOrganizationLevels()
  }, [dhis2Url, username, password])

  return (
    <>
      <select
        id="orgUnitLevel"
        value={orgUnitLevel}
        onChange={handleOrgUnitLevel}
        className="w-full px-4 py-2 border border-gray-700 rounded"
      >
        <option value="">Select Level</option>
        {allOrgUnitLevels?.map((level) => (
          <option key={level.id} value={level.level}>
            {level.displayName}
          </option>
        ))}
      </select>
    </>
  )
}

export default OrgUnitLevelMenu
