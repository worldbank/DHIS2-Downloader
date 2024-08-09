import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './OrgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import { fetchCsvData } from '../../service/useApi'
import DataElementsMenu from './DataElements'
import CategoryDropdownMenu from './CategoryCombo'
import { generatePeriods } from '../../utils/dateUtils'
import { generateDownloadingUrl, createDataChunks } from '../../utils/downloadUtils'
import DownloadButton from './DownloadButton'
import { useSelector, useDispatch } from 'react-redux'
import { triggerLoading, triggerNotification } from '../../reducers/statusReducer'
import Tooltip from '../../components/Tooltip'

// eslint-disable-next-line react/prop-types
const MainPage = ({ queryDb }) => {
  const dispatch = useDispatch()
  const { selectedOrgUnits, selectedOrgUnitLevels } = useSelector((state) => state.orgUnit)
  const { addedElements } = useSelector((state) => state.dataElements)
  const { selectedCategory } = useSelector((state) => state.category)
  const { frequency, startDate, endDate } = useSelector((state) => state.dateRange)
  const { dhis2Url, username, password } = useSelector((state) => state.auth)

  const handleDownload = async () => {
    let ou = ''
    if (selectedOrgUnits.length > 0) {
      let levels = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
      ou = `${levels};${selectedOrgUnits.join(';')}`
    } else {
      ou = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
    }
    const co = selectedCategory
    console.log(co)
    const elementIds = addedElements.map((element) => element.id)
    const dx = elementIds.join(';')
    const periods = generatePeriods(frequency, startDate, endDate)
    const pe = periods.join(';')
    const downloadingUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)
    console.log(downloadingUrl)
    const chunks = createDataChunks(elementIds, periods, ou)

    let notificationMessages = ''
    let header = null

    const fetchChunk = async (chunk, index) => {
      const dx = chunk.dx.join(';')
      const pe = chunk.periods.join(';')
      const firstPe = chunk.periods[0]
      const lastPe = chunk.periods[chunk.periods.length - 1]
      const ou = chunk.ou
      try {
        const chunkUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)
        let blob = await fetchCsvData(chunkUrl, username, password)
        const headerText = await blob.slice(0, 1024).text()
        const indexOfFirstNewline = headerText.indexOf('\n')
        blob = blob.slice(indexOfFirstNewline + 1)
        if (!header) {
          header = headerText.slice(0, indexOfFirstNewline)
        }
        notificationMessages += `Chunk ${index + 1}: \n${dx}(${firstPe}-${lastPe}) finished\n`
        dispatch(triggerNotification({ message: notificationMessages, type: 'info' }))
        return blob
      } catch (error) {
        notificationMessages += `Chunk ${index + 1}: \n${dx}(${firstPe}-${lastPe}) failed: ${error.message}\n`
        dispatch(triggerNotification({ message: notificationMessages, type: 'error' }))
        return null
      }
    }
    try {
      dispatch(triggerLoading(true))
      const fetchPromises = chunks.map((chunk, index) => fetchChunk(chunk, index))
      const results = await Promise.all(fetchPromises)
      const dataChunks = results.filter((result) => result !== null)
      const headerBlob = new Blob([header + '\n'], { type: 'text/csv' })
      if (dataChunks.length > 0) {
        await queryDb.query.add({
          organizationLevel: ou,
          period: pe,
          dimension: dx,
          disaggregation: co,
          url: downloadingUrl,
          notes: ''
        })
        const csvBlob = new Blob([headerBlob, ...dataChunks], { type: 'text/csv;charset=utf-8' })
        const downloadLink = document.createElement('a')
        downloadLink.href = URL.createObjectURL(csvBlob)
        downloadLink.download = 'dhis2_data.csv'
        downloadLink.click()
        dispatch(
          triggerNotification({ message: 'Download completed successfully', type: 'success' })
        )
      } else {
        throw new Error('No data chunks were successfully fetched.')
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : error
      dispatch(triggerNotification({ message: errorMessage, type: 'error' }))
    } finally {
      dispatch(triggerLoading(false))
    }
  }

  const isDownloadDisabled = !startDate || !endDate
  new Date(startDate) >= new Date(endDate) ||
    addedElements.length == 0 ||
    selectedOrgUnitLevels.length == 0

  return (
    <div>
      <div dir="ltr">
        <div className="flex flex-col md:flex-row px-4 py-8 mt-1">
          {/* Organization Units Column */}
          <div
            className="w-full md:w-1/3 px-4 py-8 mt-1 md:mt-0"
            style={{ height: 'auto', minHeight: '70vh' }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Organization Units
              <Tooltip
                text={
                  'An organisational unit is usually a geographical unit, which exists within a hierarchy.'
                }
              />
            </h3>
            <div
              className="overflow-y-auto p-4 bg-gray-100 rounded shadow-sm"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <OrganizationUnitTree dhis2Url={dhis2Url} username={username} password={password} />
            </div>
          </div>

          {/* Data Elements and Indicators Column */}
          <div
            className="w-full md:w-1/3 px-4 py-8 mt-1 md:mt-0"
            style={{ height: 'auto', minHeight: '70vh' }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Data Elements and Indicators
            </h3>
            <div
              className="overflow-y-auto p-4 bg-gray-100 rounded shadow-sm"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <DataElementsMenu />
            </div>
          </div>

          {/* Third Column: Organization Levels, Date Range, Disaggregation */}
          <div
            className="w-full md:w-1/3 px-4 py-8 mt-1 md:mt-0"
            style={{ height: 'auto', minHeight: '70vh' }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Organization Levels</h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <OrgUnitLevelMenu />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Date Range</h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <DateRangeSelector />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Disaggregation</h3>
            <div style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <CategoryDropdownMenu />
            </div>

            {/* Download Button */}
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Download</h3>
              <DownloadButton
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
