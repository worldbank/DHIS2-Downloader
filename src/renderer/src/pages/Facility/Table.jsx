import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Pagination from '../../components/Pagination'
import { fetchFacilityData, loadDataFromDexie } from '../../reducers/facilityReducer'
import { triggerLoading } from '../../reducers/statusReducer'
import Papa from 'papaparse'
import { MicroArrowTopRight } from '../../components/Icons'

// Format Polygon/MultiPolygon
const formatGeometrySummary = (geometry) => {
  if (!geometry) {
    return 'No geometry available'
  }
  if (geometry.type === 'Polygon') {
    return `Polygon with ${geometry.coordinates[0]?.length || 0} points`
  } else if (geometry.type === 'MultiPolygon') {
    const totalPolygons = geometry.coordinates.length
    const totalPoints = geometry.coordinates.reduce((sum, poly) => sum + (poly[0]?.length || 0), 0)
    return `Multipolygon with ${totalPolygons} polygons and a total of ${totalPoints} points`
  } else if (geometry.type === 'Point') {
    return geometry.coordinates.join(', ')
  } else {
    return 'Unknown geometry type'
  }
}

// eslint-disable-next-line react/display-name
const DataTable = React.memo(({ data }) => {
  const tableData = Array.isArray(data) ? data : []
  const maxLevels = Math.max(0, ...tableData.map((item) => item.decodedPath?.length || 0))

  return (
    <div className="w-full overflow-x-auto px-4">
      <div className="w-full bg-white rounded-lg shadow-lg">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
              <th className="py-2 px-2 whitespace-nowrap">Level</th>
              {/* Dynamically render headers for path levels */}
              {Array.from({ length: maxLevels }).map((_, idx) => (
                <th key={idx} className="py-2 px-2 whitespace-nowrap">
                  orgUnitLevel {idx + 1}
                </th>
              ))}
              <th className="py-2 px-2 whitespace-nowrap">Name</th>
              <th className="py-2 px-2 whitespace-nowrap">ID</th>
              <th className="py-2 px-2 whitespace-nowrap">Coordinates</th>
              <th className="py-2 px-2 whitespace-nowrap">Organization Unit Groups</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 text-xs font-light">
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
              >
                <td className="py-2 px-2 whitespace-nowrap">{item?.level}</td>
                {/* Dynamically render decoded path columns */}
                {Array.from({ length: maxLevels }).map((_, idx) => (
                  <td key={idx} className="py-2 px-2 whitespace-nowrap">
                    {item?.decodedPath && item.decodedPath[idx] ? item.decodedPath[idx] : 'N/A'}
                  </td>
                ))}
                <td className="py-2 px-2 [word-break:break-word]">{item?.displayName}</td>
                <td className="py-2 px-2 whitespace-nowrap">{item?.id}</td>
                <td className="py-2 px-2 whitespace-pre-wrap break-all">
                  {item.geometry ? formatGeometrySummary(item.geometry) : 'No geometry available'}
                </td>
                <td className="py-2 px-2 [word-break:break-word]">
                  {item?.organisationUnitGroups && item.organisationUnitGroups.length > 0
                    ? item.organisationUnitGroups.map((group) => group.name).join(', ')
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

const FacilityTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [jumpToPage, setJumpToPage] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPageData, setCurrentPageData] = useState([])
  const dispatch = useDispatch()
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const { mergedData: facilities } = useSelector((state) => state.facility)
  console.log(facilities)

  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch(triggerLoading(true))
        await dispatch(loadDataFromDexie()).unwrap()
      } catch (error) {
        console.log('No data in Dexie or error loading, fetching from remote...')
        await dispatch(fetchFacilityData({ dhis2Url, username, password })).unwrap()
        await dispatch(loadDataFromDexie()).unwrap()
      } finally {
        dispatch(triggerLoading(false))
      }
    }
    if (!facilities || facilities.length === 0) {
      loadData()
    }
  }, [dispatch, dhis2Url, username, password])

  // Ensure facilities is an array
  const facilitiesArray = Array.isArray(facilities) ? facilities : []

  const totalPages =
    facilitiesArray.length > 0 ? Math.ceil(facilitiesArray.length / itemsPerPage) : 0

  const handlePagination = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const pageData = facilitiesArray.slice(startIndex, startIndex + itemsPerPage)
    setCurrentPageData(pageData)
  }, [currentPage, itemsPerPage, facilitiesArray])
  useEffect(() => {
    handlePagination()
  }, [handlePagination])

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const handleJumpToPageSubmit = (event) => {
    event.preventDefault()
    const page = Number(jumpToPage)
    if (!isNaN(page) && page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleExportToCSV = () => {
    const csvData = facilities.map((item) => {
      const flatItem = {
        Level: item.level,
        Name: item.displayName,
        ID: item.id,
        Coordinates: item.geometry
          ? JSON.stringify(item.geometry.coordinates)
          : 'No geometry available',
        'Organization Unit Groups': item.organisationUnitGroups
          ? item.organisationUnitGroups.map((group) => group.name).join(', ')
          : 'N/A'
      }
      if (item.decodedPath && item.decodedPath.length > 0) {
        item.decodedPath.forEach((levelName, idx) => {
          flatItem[`orgUnitLevel ${idx + 1}`] = levelName
        })
      }

      return flatItem
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'facilities.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <div className="overflow-x-auto mb-4 w-full">
          <div className="flex justify-start space-x-4 mb-2">
            <button
              className="text-blue-500 hover:text-blue-700 font-medium text-sm"
              onClick={handleExportToCSV}
            >
              <MicroArrowTopRight /> Export CSV
            </button>
          </div>
          {/* DataTable component with no container */}
          <DataTable data={currentPageData} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 w-full">
          {/* Pagination without unnecessary container */}
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
    </div>
  )
}
export default FacilityTable
