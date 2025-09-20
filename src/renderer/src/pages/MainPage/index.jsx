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
import { openModal, closeModal } from '../../reducers/modalReducer'
import { fetchCsvData } from '../../service/useApi'
import { generatePeriods } from '../../utils/dateUtils'
import {
  generateDownloadingUrl,
  createDataChunks,
  buildOuParamForOneParent
} from '../../utils/downloadUtils'
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

  const getDownloadParameters = (layout, opts = {}) => {
    // opts.ouOverride is only used for saving query in per OU mode
    // in that case we want to save all OUs and levels in one query
    // instead of just the current OU or levels
    const ou = opts.ouOverride ?? getOrganizationUnits()
    const elementIds = addedElements.map((e) => e.id)
    const elementNames = addedElements.map((e) => e.displayName)
    const periods = generatePeriods(frequency, startDate, endDate)

    return {
      ou,
      co: selectedCategory,
      dx: elementIds.join(';'),
      dxNames: elementNames.join(';'),
      pe: periods.join(';'),
      periods,
      elementIds,
      layout,
      downloadingUrl: generateDownloadingUrl(
        dhis2Url,
        ou,
        elementIds.join(';'),
        periods.join(';'),
        selectedCategory,
        'csv',
        layout
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

    // (b) wait for all & sort
    const results = (await Promise.all(fetches)).sort((a, b) => a.idx - b.idx)

    // (c) write header ONCE, before any data
    if (!headerState.written) {
      const firstOk = results.find((r) => r.text && !r.error)
      if (!firstOk) {
        dispatch(addLog({ message: t('mainPage.noDataForHeader'), type: 'error' }))
        return
      }
      const lines = firstOk.text.split('\n').filter((l) => l.trim().length > 0)
      const header = lines[0].replace(/\r$/, '')
      fileStream.write(`${header},downloaded_date\n`)
      headerState.written = true
    }

    // (d) now write each chunk’s DATA rows (always drop first row)
    for (const { idx, text, error, dx, periods } of results) {
      if (error || !text) {
        dispatch(
          addLog({
            message: t('mainPage.chunkFailed', {
              index: idx + 1,
              dx: dx.join(';'),
              startPeriod: periods[0],
              endPeriod: periods[periods.length - 1],
              error: error?.message || 'Unknown error'
            }),
            type: 'error'
          })
        )
        continue
      }

      const rows = text.split('\n').filter((l) => l.trim().length > 0)
      // drop header line from this chunk
      if (rows.length) rows.shift()

      if (rows.length) {
        const out = rows.map((r) => `${r.replace(/\r$/, '')},${currentDate}`).join('\n') + '\n'
        fileStream.write(out)
      }

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

  const handleDownloadClick = () => {
    dispatch(
      openModal({
        type: 'CHUNKING_STRATEGY',
        props: {
          onStrategySelect: (layout, perOuMode) => handleStreamDownload({ layout, perOuMode })
        }
      })
    )
  }

  const handleStreamDownload = async ({ layout, perOuMode }) => {
    let fileStream = null
    try {
      // Validation for per OU mode
      const hasOUs = selectedOrgUnits.length > 0
      if (perOuMode && !hasOUs) {
        dispatch(closeModal())
        dispatch(
          triggerNotification({
            message: t('mainPage.errorNeedAtLeastOneOU'),
            type: 'error'
          })
        )
        return
      }
      const currentChunkingStrategy = store.getState().download.chunkingStrategy
      const saveFilePath = await getSaveFilePath()
      if (!saveFilePath) return

      fileStream = window.fileSystem.createWriteStream(saveFilePath, {
        flags: 'w',
        encoding: 'utf8'
      })
      fileStream.write('\uFEFF')

      const periods = generatePeriods(frequency, startDate, endDate)
      const elementIds = addedElements.map((e) => e.id)

      dispatch(clearLogs())
      dispatch(triggerLoading(true))

      const headerState = { written: false }

      if (perOuMode) {
        for (let i = 0; i < selectedOrgUnits.length; i++) {
          const parentId = selectedOrgUnits[i]
          const ouForThisParent = buildOuParamForOneParent(
            parentId,
            selectedOrgUnitLevels && selectedOrgUnitLevels.length ? selectedOrgUnitLevels : [5]
          )

          const chunks = createDataChunks(
            elementIds,
            periods,
            ouForThisParent,
            parseInt(currentChunkingStrategy, 10),
            layout
          )

          await processChunks(
            chunks,
            fileStream,
            {
              ou: ouForThisParent,
              co: selectedCategory,
              elementIds,
              periods,
              layout
            },
            headerState
          )

          dispatch(
            addLog({
              message: `Finished ${i + 1}/${selectedOrgUnits.length} • OU ${parentId}`,
              type: 'info'
            })
          )
          await new Promise((r) => setTimeout(r, 200))
        }

        // Save query with all OUs and levels into one database entry
        const levelsToken = selectedOrgUnitLevels.map((l) => `LEVEL-${l}`).join(';')
        const ouCombined = `${levelsToken};${selectedOrgUnits.join(';')}`

        const historyParams = getDownloadParameters(layout, { ouOverride: ouCombined })
        await saveQueryToDatabase(historyParams)
      } else {
        const downloadParams = getDownloadParameters(layout)
        const chunks = createDataChunks(
          downloadParams.elementIds,
          downloadParams.periods,
          downloadParams.ou,
          parseInt(currentChunkingStrategy, 10),
          layout
        )
        await processChunks(chunks, fileStream, downloadParams, headerState)
        // Save query into database
        await saveQueryToDatabase(downloadParams)
      }

      fileStream.end()
      dispatch(triggerNotification({ message: t('mainPage.downloadSuccess'), type: 'success' }))
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
