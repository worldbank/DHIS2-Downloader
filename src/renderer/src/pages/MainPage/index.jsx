import { useState, useRef } from 'react'
import NotificationModal from '../Modal'
import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './OrgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import { fetchData } from '../../service/useApi'
import DataElementsMenu from './DataElements'
import CategoryDropdownMenu from './CategoryCombo'
import { generateDownloadingUrl, jsonToCsv } from '../../utils/helpers'
import { generatePeriods } from '../../utils/dateUtils'
import DownloadButton from './DownloadButton'
import { useSelector, useDispatch } from 'react-redux'
import { setLoading, setError, setNotification } from '../../reducers/statusReducer'

// eslint-disable-next-line react/prop-types
const MainPage = ({ dictionaryDb, servicesDb }) => {
  const servicesDbRef = useRef(servicesDb)
  const dispatch = useDispatch()
  const { selectedOrgUnits, selectedOrgUnitLevels } = useSelector((state) => state.orgUnit)
  const { addedElements } = useSelector((state) => state.dataElements)
  const { selectedCategory } = useSelector((state) => state.category)
  const { frequency, startDate, endDate } = useSelector((state) => state.dateRange)
  const { dhis2Url, username, password } = useSelector((state) => state.auth)

  const handleDownload = async () => {
    let ou = ''
    if (selectedOrgUnits.length > 0) {
      ou = `${selectedOrgUnitLevels.join(';')};${selectedOrgUnits.join(';')}&ouMode=SELECTED`
    } else {
      ou = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
    }
    const co = selectedCategory
    const dx = addedElements.map((element) => element.id).join(';')
    const periods = generatePeriods(frequency, startDate, endDate)
    const pe = periods.join(';')
    const downloadingUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)
    console.log(downloadingUrl)
    try {
      dispatch(setLoading(true))
      const data = await fetchData(downloadingUrl, username, password)
      console.log(data)
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'An error occurred while fetching data')
      }
      const { csvData, headers, dbObjects } = jsonToCsv(data)
      // const schema = '++id, ' + headers.join(', ')
      // servicesDbRef.current = await changeSchema(servicesDbRef.current, { services: schema })
      // await servicesDbRef.current.services.bulkAdd(dbObjects)
      await dictionaryDb.query.add({
        ou: ou,
        pe: pe,
        dx: dx,
        co: co,
        url: downloadingUrl
      })
      const csvBlob = new Blob([csvData], { type: 'text/csv' })
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(csvBlob)
      downloadLink.download = 'dhis2_data.csv'
      downloadLink.click()
      dispatch(setNotification({ message: 'Download completed successfully', type: 'success' }))
    } catch (error) {
      if (error.message) {
        dispatch(setError(error.message))
      } else {
        dispatch(setError(error))
      }
    } finally {
      dispatch(setLoading(false))
    }
  }

  const isDownloadDisabled =
    new Date(startDate) >= new Date(endDate) ||
    addedElements.length == 0 ||
    selectedOrgUnitLevels.length == 0

  return (
    <div>
      <div dir="ltr">
        <div className="flex px-4 py-8">
          <div className="w-1/3 px-4 py-8" style={{ height: '70vh' }}>
            <h3 className="text-xl font-bold mb-2">Organization Units</h3>
            <div
              className="overflow-y-scroll border border-gray-300 p-4 bg-gray-100"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <OrganizationUnitTree dhis2Url={dhis2Url} username={username} password={password} />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8" style={{ height: '70vh' }}>
            <h3 className="text-xl font-bold mb-2">Data Elements and Indicators</h3>
            <div
              className="overflow-y-scroll border border-gray-300 p-4 bg-gray-100"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <DataElementsMenu />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8">
            <h3 className="text-xl font-bold mb-2">Organization Levels</h3>
            <div className="mb-4">
              <OrgUnitLevelMenu dhis2Url={dhis2Url} username={username} password={password} />
            </div>
            <h3 className="text-xl font-bold mb-2">Date Range</h3>
            <div className="overflow-y-auto">
              <DateRangeSelector />
            </div>
            <h3 className="text-xl font-bold mb-2">Category Combination</h3>
            <div className="overflow-y-auto">
              <CategoryDropdownMenu dhis2Url={dhis2Url} username={username} password={password} />
            </div>
            <div className="mt-4">
              <DownloadButton
                dictionaryDb={dictionaryDb}
                handleDownload={handleDownload}
                isDownloadDisabled={isDownloadDisabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainPage
