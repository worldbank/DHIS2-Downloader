import React, { useState, useEffect } from 'react'
import { getInitialOrganizationUnitLevel, getChildOrgUnits } from '../../service/useApi'

const OrganizationUnitTree = ({
  dhis2Url,
  username,
  password,
  selectedOrgUnits,
  setSelectedOrgUnits,
  onSelect
}) => {
  const [orgUnits, setOrgUnits] = useState([])
  const [expandedOrgUnits, setExpandedOrgUnits] = useState([])

  useEffect(() => {
    const fetchOrgUnitLevel = async () => {
      const data = await getInitialOrganizationUnitLevel(dhis2Url, username, password)
      setOrgUnits(data.organisationUnits)
    }
    fetchOrgUnitLevel()
  }, [dhis2Url, username, password])

  const fetchChildOrgUnits = async (parentId, parentPath) => {
    try {
      const data = await getChildOrgUnits(dhis2Url, parentId, username, password)
      const updatedOrgUnits = updateOrgUnits(orgUnits, parentPath, data)
      setOrgUnits(updatedOrgUnits)
    } catch (error) {
      console.error(`Error fetching child organisation units for ${parentId}:`, error)
    }
  }

  const updateOrgUnits = (units, path, data) => {
    if (path.length === 0) {
      return data.children || []
    }

    const [head, ...tail] = path
    const updatedUnits = units.map((unit) => {
      if (unit.id === head) {
        return {
          ...unit,
          children: updateOrgUnits(unit.children || [], tail, data)
        }
      }
      return unit
    })

    return updatedUnits
  }

  const handleOrgUnitSelect = (unitId) => {
    if (selectedOrgUnits.includes(unitId)) {
      setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId))
    } else {
      setSelectedOrgUnits([...selectedOrgUnits, unitId])
    }
    onSelect(unitId)
  }

  const handleOrgUnitExpand = (unitId, path) => {
    if (!expandedOrgUnits.includes(unitId)) {
      setExpandedOrgUnits([...expandedOrgUnits, unitId])
      fetchChildOrgUnits(unitId, path)
    } else {
      setExpandedOrgUnits(expandedOrgUnits.filter((id) => id !== unitId))
    }
  }

  const renderTreeNodes = (units, path = []) => {
    return units.map((unit) => (
      <div key={unit.id} className="ml-4">
        <label>
          <input
            type="checkbox"
            checked={selectedOrgUnits.includes(unit.id)}
            onChange={() => handleOrgUnitSelect(unit.id)}
            className="mr-2"
          />
          {unit.displayName}
        </label>
        {unit.level !== 7 && (
          <button
            onClick={() => handleOrgUnitExpand(unit.id, [...path, unit.id])}
            className="ml-2 text-blue-500 hover:underline"
          >
            {expandedOrgUnits.includes(unit.id) ? '-' : '+'}
          </button>
        )}
        {expandedOrgUnits.includes(unit.id) &&
          unit.children &&
          renderTreeNodes(unit.children, [...path, unit.id])}
      </div>
    ))
  }

  return <div>{renderTreeNodes(orgUnits)}</div>
}

export default OrganizationUnitTree
