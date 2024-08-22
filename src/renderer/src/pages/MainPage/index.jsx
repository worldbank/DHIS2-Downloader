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
import {
  addLog,
  clearLogs,
  triggerLoading,
  triggerNotification
} from '../../reducers/statusReducer'
import Tooltip from '../../components/Tooltip'

// eslint-disable-next-line react/prop-types
const MainPage = ({ queryDb }) => {
  const dispatch = useDispatch()
  const { selectedOrgUnits, selectedOrgUnitLevels } = useSelector((state) => state.orgUnit)
  const { addedElements } = useSelector((state) => state.dataElements)
  const { selectedCategory } = useSelector((state) => state.category)
  const { frequency, startDate, endDate } = useSelector((state) => state.dateRange)
  const { dhis2Url, username, password } = useSelector((state) => state.auth)

  const handleStreamDownload = async () => {
    // Ask the user to select the save location and filename
    const saveFilePath = await window.electronAPI.selectSaveLocation()
    if (!saveFilePath) {
      dispatch(triggerNotification({ message: 'Download canceled by user.', type: 'info' }))
      return
    }

    const fileStream = window.fileSystem.createWriteStream(saveFilePath)

    let ou = ''
    if (selectedOrgUnits.length > 0) {
      let levels = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
      ou = `${levels};${selectedOrgUnits.join(';')}`
    } else {
      ou = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
    }
    const co = selectedCategory
    const elementIds = addedElements.map((element) => element.id)
    const dx = elementIds.join(';')
    const periods = generatePeriods(frequency, startDate, endDate)
    const pe = periods.join(';')
    const downloadingUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)
    const chunks = createDataChunks(elementIds, periods, ou)

    let headerWritten = false // Track if the header has been written

    const fetchChunk = async (chunk, index) => {
      const dx = chunk.dx.join(';')
      const pe = chunk.periods.join(';')
      const firstPe = chunk.periods[0]
      const lastPe = chunk.periods[chunk.periods.length - 1]
      const ou = chunk.ou
      let blob = null
      try {
        const chunkUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)

        // Use fetchCsvData method for consistent blob processing
        blob = await fetchCsvData(chunkUrl, username, password)
        const text = await blob.text()

        if (!headerWritten) {
          // Write the header from the first chunk
          const indexOfFirstNewline = text.indexOf('\n')
          const header = text.slice(0, indexOfFirstNewline)
          fileStream.write(header + '\n')
          const dataWithoutHeader = text.slice(indexOfFirstNewline + 1)
          fileStream.write(dataWithoutHeader)
          headerWritten = true
        } else {
          // For subsequent chunks, skip the header
          const indexOfFirstNewline = text.indexOf('\n')
          const dataWithoutHeader = text.slice(indexOfFirstNewline + 1)
          fileStream.write(dataWithoutHeader)
        }
        const successMessage = `Chunk ${index + 1}: ${dx} (${firstPe}-${lastPe}) finished successfully.`
        dispatch(addLog({ message: successMessage, type: 'info' }))
      } catch (error) {
        const errorMessage = `Chunk ${index + 1}: ${dx} (${firstPe}-${lastPe}) failed: ${error?.message}`
        dispatch(addLog({ message: errorMessage, type: 'error' }))
      } finally {
        if (blob) {
          blob = null
        }
        if (window.api.triggerGarbageCollection) {
          window.api.triggerGarbageCollection()
        }
      }
    }

    try {
      dispatch(clearLogs())
      dispatch(triggerLoading(true))
      // Fetch all chunks in parallel
      const fetchPromises = chunks.map((chunk, index) => fetchChunk(chunk, index))
      await Promise.all(fetchPromises) // Wait for all chunks to be fetched and processed

      fileStream.end()
      dispatch(triggerNotification({ message: 'Download completed successfully', type: 'success' }))

      await queryDb.query.add({
        organizationLevel: ou,
        period: pe,
        dimension: dx,
        disaggregation: co,
        url: downloadingUrl,
        notes: ''
      })

      if (window.api.clearBrowserCache) {
        window.api.clearBrowserCache()
      }
    } catch (error) {
      const errorMessage = error.message ? error.message : error
      dispatch(triggerNotification({ message: errorMessage, type: 'error' }))
      fileStream.end()
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
              <Tooltip>
                <div>
                  <p>
                    An organisational unit is usually a geographical unit, which exists within a
                    hierarchy.
                  </p>
                </div>
              </Tooltip>
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
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Disaggregation{' '}
              <Tooltip>
                <div>
                  <p>
                    Disaggregation includes <em>category combination options</em> and{' '}
                    <em>organization Group sets</em>
                  </p>
                </div>
              </Tooltip>
            </h3>
            <div style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <CategoryDropdownMenu />
            </div>

            {/* Download Button */}
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Download</h3>
              <DownloadButton
                handleDownload={handleStreamDownload}
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
