// MainPage.jsx - Optimized version
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

const MainPage = ({ queryDb }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const { selectedOrgUnits, selectedOrgUnitLevels } = useSelector((s) => s.orgUnit)
  const { addedElements } = useSelector((s) => s.dataElements)
  const { selectedCategory } = useSelector((s) => s.category)
  const { frequency, startDate, endDate } = useSelector((s) => s.dateRange)
  const { dhis2Url, username, password } = useSelector((s) => s.auth)
  const currentDate = new Date().toISOString().split('T')[0]

  // --- Helpers ------------------------------------------------------------
  const getOrganizationUnits = () => {
    if (selectedOrgUnits.length > 0) {
      const levels = selectedOrgUnitLevels.map((l) => `LEVEL-${l}`).join(';')
      return `${levels};${selectedOrgUnits.join(';')}`
    }
    return selectedOrgUnitLevels.map((l) => `LEVEL-${l}`).join(';')
  }

  const getSaveFilePath = async () => {
    const saveFilePath = await window.electronAPI.selectSaveLocation()
    if (!saveFilePath) {
      dispatch(triggerNotification({ message: t('mainPage.downloadCanceled'), type: 'info' }))
    }
    return saveFilePath
  }

  const getDownloadParameters = (layout, opts = {}) => {
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

  // --- DB helpers ---------------------------------------------------------
  const saveQueryToDatabase = async (downloadParams) => {
    const id = await queryDb.query.add({
      organizationLevel: downloadParams.ou,
      period: downloadParams.pe,
      dimension: downloadParams.dx,
      dimensionName: downloadParams.dxNames,
      disaggregation: Array.isArray(downloadParams.co)
        ? downloadParams.co.join(';')
        : downloadParams.co,
      url: downloadParams.downloadingUrl,
      notes: ''
    })
    return id
  }

  const createRun = async (queryId) => {
    const runId = await queryDb.runs.add({ ok: false })
    await queryDb.runQueries.add({ runId, queryId })
    return runId
  }

  const finalizeRun = async (runId, hadAnySuccess, hadAnyFailure) => {
    const ok = hadAnySuccess && !hadAnyFailure
    await queryDb.runs.update(runId, { ok })
  }

  // --- OPTIMIZED Chunk processor ------------------------------------------
  /**
   * KEY OPTIMIZATION: Batch all DB writes at the end instead of inside loop
   */
  const processChunks = async (
    chunks,
    fileStream,
    downloadParams,
    headerState,
    { runId, queryId }
  ) => {
    let hadAnySuccess = false
    let hadAnyFailure = false
    if (!chunks.length) return { hadAnySuccess, hadAnyFailure }

    // 1️⃣ Fire all requests in parallel (no DB writes yet)
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
        .then((text) => ({ idx, text, dx, periods, ou }))
        .catch((error) => ({ idx, error, dx, periods, ou }))
    })

    // 2️⃣ Wait for all results
    const results = (await Promise.all(fetches)).sort((a, b) => a.idx - b.idx)

    // 3️⃣ Accumulate all result records in memory
    const resultsToInsert = []

    // 4️⃣ Write header if needed
    if (!headerState.written) {
      const firstOk = results.find((r) => r.text && !r.error)
      if (!firstOk) {
        // All failed - batch insert all failures
        await queryDb.results.bulkAdd(
          results.map((r) => ({
            runId,
            queryId,
            ok: false,
            chunkIndex: r.idx,
            ou: r.ou,
            startPeriod: r.periods?.[0],
            endPeriod: r.periods?.at(-1),
            dxCount: r.dx?.length ?? 0,
            errorMessage: 'No successful header chunk',
            createdAt: Date.now()
          }))
        )
        return { hadAnySuccess, hadAnyFailure: true }
      }
      const header = firstOk.text.split('\n')[0].replace(/\r$/, '')
      fileStream.write(`${header},downloaded_date\n`)
      headerState.written = true
    }

    for (const { idx, text, error, dx, periods, ou } of results) {
      if (error || !text) {
        hadAnyFailure = true
        resultsToInsert.push({
          runId,
          queryId,
          ok: false,
          chunkIndex: idx,
          ou,
          startPeriod: periods[0],
          endPeriod: periods.at(-1),
          dxCount: dx.length,
          errorMessage: error?.message || 'Unknown error',
          createdAt: Date.now()
        })

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

      // Write to file
      const lines = text.split('\n').filter((l) => l.trim().length)
      if (lines.length) lines.shift() // Remove header
      if (lines.length) {
        fileStream.write(
          lines.map((r) => `${r.replace(/\r$/, '')},${currentDate}`).join('\n') + '\n'
        )
      }

      hadAnySuccess = true
      resultsToInsert.push({
        runId,
        queryId,
        ok: true,
        chunkIndex: idx,
        ou,
        startPeriod: periods[0],
        endPeriod: periods.at(-1),
        dxCount: dx.length,
        errorMessage: null,
        createdAt: Date.now()
      })

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

    if (resultsToInsert.length) {
      await queryDb.results.bulkAdd(resultsToInsert)
    }

    return { hadAnySuccess, hadAnyFailure }
  }

  // --- Download trigger ---------------------------------------------------
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
    let runId = null
    let queryId = null
    let summary = { hadAnySuccess: false, hadAnyFailure: false }

    try {
      if (perOuMode && selectedOrgUnits.length === 0) {
        dispatch(closeModal())
        dispatch(
          triggerNotification({ message: t('mainPage.errorNeedAtLeastOneOU'), type: 'error' })
        )
        return
      }

      const chunkSize = parseInt(store.getState().download.chunkingStrategy, 10)
      const saveFilePath = await getSaveFilePath()
      if (!saveFilePath) return

      fileStream = window.fileSystem.createWriteStream(saveFilePath, {
        flags: 'w',
        encoding: 'utf8'
      })
      fileStream.write('\uFEFF')

      dispatch(clearLogs())
      dispatch(triggerLoading(true))

      const headerState = { written: false }

      if (perOuMode) {
        const levelsToken = selectedOrgUnitLevels.map((l) => `LEVEL-${l}`).join(';')
        const ouCombined = `${levelsToken};${selectedOrgUnits.join(';')}`
        const params = getDownloadParameters(layout, { ouOverride: ouCombined })
        queryId = await saveQueryToDatabase(params)
        runId = await createRun(queryId)

        for (let i = 0; i < selectedOrgUnits.length; i++) {
          const parentId = selectedOrgUnits[i]
          const ouForThisParent = buildOuParamForOneParent(
            parentId,
            selectedOrgUnitLevels.length ? selectedOrgUnitLevels : [5]
          )

          const chunks = createDataChunks(
            params.elementIds,
            params.periods,
            ouForThisParent,
            chunkSize,
            layout
          )

          const s = await processChunks(
            chunks,
            fileStream,
            { ...params, ou: ouForThisParent },
            headerState,
            { runId, queryId }
          )
          summary.hadAnySuccess ||= s.hadAnySuccess
          summary.hadAnyFailure ||= s.hadAnyFailure

          dispatch(
            addLog({
              message: `Finished ${i + 1}/${selectedOrgUnits.length} • OU ${parentId}`,
              type: 'info'
            })
          )
        }
      } else {
        const params = getDownloadParameters(layout)
        queryId = await saveQueryToDatabase(params)
        runId = await createRun(queryId)

        const chunks = createDataChunks(
          params.elementIds,
          params.periods,
          params.ou,
          chunkSize,
          layout
        )

        summary = await processChunks(chunks, fileStream, params, headerState, { runId, queryId })
      }

      fileStream.end()
      await finalizeRun(runId, summary.hadAnySuccess, summary.hadAnyFailure)

      dispatch(triggerNotification({ message: t('mainPage.downloadSuccess'), type: 'success' }))
      clearCacheIfPossible()
    } catch (error) {
      if (runId) await queryDb.runs.update(runId, { ok: false })
      handleDownloadError(error, fileStream)
    } finally {
      dispatch(triggerLoading(false))
    }
  }

  const clearCacheIfPossible = () => {
    if (window.api.clearBrowserCache) window.api.clearBrowserCache()
  }

  const handleDownloadError = (error, fileStream) => {
    const message = error.message || error
    dispatch(triggerNotification({ message, type: 'error' }))
    if (fileStream) fileStream.end()
  }

  const isDownloadDisabled =
    !startDate ||
    !endDate ||
    new Date(startDate) > new Date(endDate) ||
    addedElements.length === 0 ||
    selectedOrgUnitLevels.length === 0

  // --- UI ---------------------------------------------------------------
  return (
    <div>
      <div dir="ltr">
        <div className="flex flex-col md:flex-row px-4 py-8 mt-1">
          <div className="w-full md:w-1/3 px-4 py-8" style={{ minHeight: '70vh' }}>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('mainPage.organizationUnits')}
              <Tooltip>
                <p>{t('mainPage.organizationUnitsTooltip')}</p>
              </Tooltip>
            </h3>
            <div
              className="overflow-y-auto p-4 bg-gray-100 rounded shadow-sm"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <OrganizationUnitTree dhis2Url={dhis2Url} username={username} password={password} />
            </div>
          </div>

          <div className="w-full md:w-1/3 px-4 py-8" style={{ minHeight: '70vh' }}>
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

          <div className="w-full md:w-1/3 px-4 py-8" style={{ minHeight: '70vh' }}>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('mainPage.organizationLevels')}
            </h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem)/3)' }}>
              <OrgUnitLevelMenu />
            </div>

            <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('mainPage.dateRange')}</h3>
            <div className="mb-6" style={{ height: 'calc((70vh -2rem)/3)' }}>
              <DateRangeSelector />
            </div>

            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              {t('mainPage.disaggregation')}
            </h3>
            <div style={{ height: 'calc((70vh -2rem)/3)' }}>
              <CategoryDropdownMenu />
            </div>

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
