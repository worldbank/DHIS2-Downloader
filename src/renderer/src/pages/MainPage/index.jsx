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

  const getOrganizationUnits = () => {
    if (selectedOrgUnits.length > 0) {
      const levels = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
      return `${levels};${selectedOrgUnits.join(';')}`
    }
    return selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
  }

  const getSaveFilePath = async () => {
    const saveFilePath = await window.electronAPI.selectSaveLocation()
    if (!saveFilePath) {
      dispatch(triggerNotification({ message: 'Download canceled by user.', type: 'info' }))
    }
    return saveFilePath
  }

  const getDownloadParameters = () => {
    const ou = getOrganizationUnits()
    const elementIds = addedElements.map((element) => element.id)
    const elementNames = addedElements.map((element) => element.displayName)
    const periods = generatePeriods(frequency, startDate, endDate)

    return {
      ou,
      co: selectedCategory,
      dx: elementIds.join(';'),
      dxNames: elementNames.join(';'),
      pe: periods.join(';'),
      periods,
      elementIds,
      downloadingUrl: generateDownloadingUrl(
        dhis2Url,
        ou,
        elementIds.join(';'),
        periods.join(';'),
        selectedCategory
      )
    }
  }

  const processChunks = async (chunks, fileStream, downloadParams) => {
    const headerState = { written: false } // Use an object to track header state
    const fetchPromises = chunks.map((chunk, index) =>
      fetchAndProcessChunk(chunk, index, fileStream, downloadParams, headerState)
    )
    await Promise.all(fetchPromises)
  }

  const fetchAndProcessChunk = async (chunk, index, fileStream, downloadParams, headerState) => {
    const { dx, periods, ou } = chunk
    const chunkUrl = generateDownloadingUrl(
      dhis2Url,
      ou,
      dx.join(';'),
      periods.join(';'),
      downloadParams.co
    )

    try {
      const blob = await fetchCsvData(chunkUrl, username, password)
      const text = await blob.text()

      writeChunkToFile(text, fileStream, headerState)

      dispatch(
        addLog({
          message: `Chunk ${index + 1}: ${dx.join(';')} (${periods[0]}-${periods[periods.length - 1]}) finished successfully.`,
          type: 'info'
        })
      )
    } catch (error) {
      dispatch(
        addLog({
          message: `Chunk ${index + 1}: ${dx.join(';')} (${periods[0]}-${periods[periods.length - 1]}) failed: ${error?.message}`,
          type: 'error'
        })
      )
    } finally {
      if (window.api.triggerGarbageCollection) {
        window.api.triggerGarbageCollection()
      }
    }
  }

  const writeChunkToFile = (text, fileStream, headerState) => {
    const indexOfFirstNewline = text.indexOf('\n')
    if (!headerState.written) {
      const header = text.slice(0, indexOfFirstNewline)
      fileStream.write(header + '\n')
      headerState.written = true // Update the shared header state
    }
    const dataWithoutHeader = text.slice(indexOfFirstNewline + 1)
    fileStream.write(dataWithoutHeader)
  }

  const saveQueryToDatabase = async (downloadParams) => {
    await queryDb.query.add({
      organizationLevel: downloadParams.ou,
      period: downloadParams.pe,
      dimension: downloadParams.dx,
      dimensionName: downloadParams.dxNames,
      disaggregation: downloadParams.co.join(';'),
      url: downloadParams.downloadingUrl,
      notes: ''
    })
  }

  const clearCacheIfPossible = () => {
    if (window.api.clearBrowserCache) {
      window.api.clearBrowserCache()
    }
  }

  const handleDownloadError = (error, fileStream) => {
    const errorMessage = error.message || error
    dispatch(triggerNotification({ message: errorMessage, type: 'error' }))
    fileStream.end()
  }

  const handleStreamDownload = async () => {
    const saveFilePath = await getSaveFilePath()
    if (!saveFilePath) return

    const fileStream = window.fileSystem.createWriteStream(saveFilePath)
    const downloadParams = getDownloadParameters()
    const chunks = createDataChunks(
      downloadParams.elementIds,
      downloadParams.periods,
      downloadParams.ou
    )

    try {
      dispatch(clearLogs())
      dispatch(triggerLoading(true))

      await processChunks(chunks, fileStream, downloadParams)

      fileStream.end()
      dispatch(triggerNotification({ message: 'Download completed successfully', type: 'success' }))

      await saveQueryToDatabase(downloadParams)
      clearCacheIfPossible()
    } catch (error) {
      handleDownloadError(error, fileStream)
    } finally {
      dispatch(triggerLoading(false))
    }
  }

  const isDownloadDisabled =
    !startDate ||
    !endDate ||
    new Date(startDate) >= new Date(endDate) ||
    addedElements.length === 0 ||
    selectedOrgUnitLevels.length === 0

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
                <div className="text-gray-600 text-sm">
                  Disaggregation includes:
                  <ul className="list-disc pl-5">
                    <li>
                      <em>Category combination options</em> are dynamically composed of all of the
                      different combinations of category options which compose a category
                      combination. As an example, two categories "Gender" and "Age," might have
                      options such as "Male" or "Female" and "{'<'}5 years" or "{'>'}5 years." One
                      of the Category combination options would be "Male {'<'}5 years."
                    </li>
                    <li>
                      <em>Organization Units Group Sets</em> are typically related to the attributes
                      of organization units, such as "ownership," "type."
                    </li>
                  </ul>
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
