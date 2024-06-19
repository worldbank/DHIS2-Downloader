import { useState, useEffect } from 'react'
import { getOrganizationLevels } from '../service/useApi'

const OrgUnitLevelMenu = ({ dhis2Url, username, password, OrgUnitLevel, handleOrgUnitLevel }) => {
  const [allOrgUnitLevels, setOrgUnitLevels] = useState([])

  useEffect(async () => {
    const data = await getOrganizationLevels(dhis2Url, username, password)
    const sortedData = data.organisationUnitLevels.sort((a, b) => a.level - b.level)
    setOrgUnitLevels(sortedData)
  }, [dhis2Url, username, password])

  return (
    <>
      <select
        id="orgUnitLevel"
        value={OrgUnitLevel}
        onChange={handleOrgUnitLevel}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
      >
        <option value="">Select Level</option>
        {allOrgUnitLevels.map((level) => (
          <option key={level.id} value={level.level}>
            {level.displayName}
          </option>
        ))}
      </select>
    </>
  )
}

export default OrgUnitLevelMenu
