import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchInitialOrgUnits,
  fetchChildOrgUnits,
  toggleOrgUnitSelection,
  toggleOrgUnitExpansion
} from '../../reducers/orgUnitReducer'

const OrganizationUnitTree = ({ dhis2Url, username, password }) => {
  const dispatch = useDispatch()
  const { orgUnits, expandedOrgUnits, selectedOrgUnits } = useSelector((state) => state.orgUnit)

  useEffect(() => {
    dispatch(fetchInitialOrgUnits({ dhis2Url, username, password }))
  }, [dispatch, dhis2Url, username, password])

  const handleOrgUnitSelect = (unitId) => {
    dispatch(toggleOrgUnitSelection(unitId))
  }

  const handleOrgUnitExpand = (unitId, path) => {
    dispatch(toggleOrgUnitExpansion(unitId))
    if (!expandedOrgUnits.includes(unitId)) {
      dispatch(fetchChildOrgUnits({ dhis2Url, parentId: unitId, username, password }))
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
