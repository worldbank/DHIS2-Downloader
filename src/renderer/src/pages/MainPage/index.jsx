import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './OrgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import DataElementsMenu from './DataElements'
import CategoryDropdownMenu from './CategoryCombo'
import DownloadButton from './DownloadButton'
import store from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import {
  addLog,
  clearLogs,
  triggerLoading,
  triggerNotification
} from '../../reducers/statusReducer'
import Tooltip from '../../components/Tooltip'
import { openModal } from '../../reducers/modalReducer'
import { fetchCsvData } from '../../service/useApi'
import { generatePeriods } from '../../utils/dateUtils'
import { generateDownloadingUrl, createDataChunks } from '../../utils/downloadUtils'
import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/prop-types
const MainPage = ({ queryDb }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { selectedOrgUnits, selectedOrgUnitLevels } = useSelector((state) => state.orgUnit)
  const { addedElements } = useSelector((state) => state.dataElements)
  const { selectedCategory } = useSelector((state) => state.category)
  const { frequency, startDate, endDate } = useSelector((state) => state.dateRange)
  const { dhis2Url, username, password } = useSelector((state) => state.auth)
  const currentDate = new Date().toISOString().split('T')[0]

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
      dispatch(triggerNotification({ message: t('mainPage.downloadCanceled'), type: 'info' }))
    }
    return saveFilePath
  }

  const getDownloadParameters = (layout) => {
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
      layout: layout, // ensure layout object is stored
      downloadingUrl: generateDownloadingUrl(
        dhis2Url,
        ou,
        elementIds.join(';'),
        periods.join(';'),
        selectedCategory,
        'csv',
        layout // pass correct object
      )
    }
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
  const processChunks = async (chunks, fileStream, downloadParams, headerState) => {
    if (chunks.length === 0) {
      dispatch(addLog({ message: t('mainPage.noDataForHeader'), type: 'error' }))
      return
    }

    // (a) parallel fetch
    const fetches = chunks.map(({ dx, periods, ou }, idx) => {
      const url = generateDownloadingUrl(
        dhis2Url,
        ou,
        dx.join(';'),
        periods.join(';'),
        downloadParams.co,
        'csv',
        downloadParams.layout
      )
      return fetchCsvData(url, username, password)
        .then((blob) => blob.text())
        .then((text) => ({ idx, text, dx, periods }))
        .catch((error) => ({ idx, error, dx, periods }))
    })

    // (b) wait for all
    const results = await Promise.all(fetches)

    // (c) sort in ascending index
    results.sort((a, b) => a.idx - b.idx)

    // (d) write each chunk in order
    for (const { idx, text, error, dx, periods } of results) {
      if (error) {
        dispatch(
          addLog({
            message: t('mainPage.chunkFailed', {
              index: idx + 1,
              dx: dx.join(';'),
              startPeriod: periods[0],
              endPeriod: periods[periods.length - 1],
              error: error.message
            }),
            type: 'error'
          })
        )
        continue
      }

      writeChunkToFile(text, fileStream, headerState, idx)

      dispatch(
        addLog({
          message: t('mainPage.chunkSuccess', {
            index: idx + 1,
            dx: dx.join(';'),
            startPeriod: periods[0],
            endPeriod: periods[periods.length - 1]
          }),
          type: 'info'
        })
      )
    }
  }

  const writeChunkToFile = (text, fileStream, headerState, chunkIndex) => {
    const rows = text.split('\n').filter((line) => line.trim().length > 0)
    if (rows.length === 0) return

    let out = ''

    if (chunkIndex === 0) {
      // First chunk: pull off the header row, emit it once
      if (!headerState.written) {
        const hdr = rows.shift()
        out += `${hdr},downloaded_date\n`
        headerState.written = true
      } else {
        // (This shouldn’t happen, but just in case:)
        rows.shift()
      }
    } else {
      // Subsequent chunks: drop their header row
      rows.shift()
    }

    if (rows.length > 0) {
      out += rows.map((r) => `${r},${currentDate}`).join('\n') + '\n'
    }

    fileStream.write(out)
  }

  const handleDownloadClick = () => {
    dispatch(
      openModal({
        type: 'CHUNKING_STRATEGY',
        props: {
          onStrategySelect: (layout) => handleStreamDownload(layout)
        }
      })
    )
  }

  const handleStreamDownload = async (layout) => {
    console.log('Layout from modal:', layout)
    let fileStream = null
    try {
      const currentChunkingStrategy = store.getState().download.chunkingStrategy
      const saveFilePath = await getSaveFilePath()
      if (!saveFilePath) return

      fileStream = window.fileSystem.createWriteStream(saveFilePath, {
        flags: 'w',
        encoding: 'utf8'
      })
      fileStream.write('\uFEFF')

      const downloadParams = getDownloadParameters(layout)
      console.log(downloadParams)
      const chunks = createDataChunks(
        downloadParams.elementIds,
        downloadParams.periods,
        downloadParams.ou,
        parseInt(currentChunkingStrategy, 10),
        layout
      )

      console.log('Generated Chunks:', chunks)

      dispatch(clearLogs())
      dispatch(triggerLoading(true))

      const headerState = { written: false }
      await processChunks(chunks, fileStream, downloadParams, headerState)
      fileStream.end()

      dispatch(triggerNotification({ message: t('mainPage.downloadSuccess'), type: 'success' }))
      await saveQueryToDatabase(downloadParams)
      clearCacheIfPossible()
    } catch (error) {
      handleDownloadError(error, fileStream)
    } finally {
      dispatch(triggerLoading(false))
    }
  }

  const clearCacheIfPossible = () => {
    if (window.api.clearBrowserCache) {
      window.api.clearBrowserCache()
    }
  }

  const handleDownloadError = (error, fileStream) => {
    const errorMessage = error.message || error
    dispatch(triggerNotification({ message: errorMessage, type: 'error' }))
    if (fileStream) {
      fileStream.end()
    }
  }

  const isDownloadDisabled =
    !startDate ||
    !endDate ||
    new Date(startDate) > new Date(endDate) ||
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
              {t('mainPage.organizationUnits')}
              <Tooltip>
                <div>
                  <p>{t('mainPage.organizationUnitsTooltip')}</p>
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
              {t('mainPage.dataElementsAndIndicators')}
            </h3>
            <div
              className="overflow-y-auto p-4 bg-gray-100 rounded shadow-sm"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <DataElementsMenu />
            </div>
          </div>

          {/* Third Column: Organization Levels, Date Range, Disaggregation, Download */}
          <div
            className="w-full md:w-1/3 px-4 py-8 mt-1 md:mt-0"
            style={{ height: 'auto', minHeight: '70vh' }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('mainPage.organizationLevels')}
            </h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <OrgUnitLevelMenu />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('mainPage.dateRange')}</h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <DateRangeSelector />
            </div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('mainPage.disaggregation')}{' '}
              <Tooltip>
                <div className="text-gray-600 text-sm">
                  <p>{t('mainPage.disaggregationTooltip.header')}</p>
                  <ul className="list-disc pl-5">
                    {t('mainPage.disaggregationTooltip.list', { returnObjects: true }).map(
                      (item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                      ),
                      []
                    )}
                  </ul>
                </div>
              </Tooltip>
            </h3>
            <div style={{ height: 'calc((70vh -2rem) / 3)' }}>
              <CategoryDropdownMenu />
            </div>

            {/* Download Button */}
            <div className="w-full mt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('mainPage.download')}</h3>
              <p className="text-xs text-gray-500 mb-2">
                <em>{t('mainPage.downloadNote')}</em>
              </p>
              <DownloadButton
                handleDownload={handleDownloadClick}
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
