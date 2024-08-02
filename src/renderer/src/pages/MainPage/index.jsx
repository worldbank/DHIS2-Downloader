import { useState, useRef } from 'react'
import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './OrgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import { fetchData, fetchCsvData } from '../../service/useApi'
import DataElementsMenu from './DataElements'
import CategoryDropdownMenu from './CategoryCombo'
import { generatePeriods } from '../../utils/dateUtils'
import { generateDownloadingUrl, createDataChunks } from '../../utils/downloadUtils'
import DownloadButton from './DownloadButton'
import { useSelector, useDispatch } from 'react-redux'
import { triggerLoading, triggerNotification } from '../../reducers/statusReducer'

// eslint-disable-next-line react/prop-types
const MainPage = ({ dictionaryDb, servicesDb, queryDb }) => {
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
      let levels = selectedOrgUnitLevels.map((level) => `LEVEL-${level}`).join(';')
      ou = `${levels};${selectedOrgUnits.join(';')}&ouMode=SELECTED`
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
          ou: ou,
          pe: pe,
          dx: dx,
          co: co,
          url: downloadingUrl
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
              <OrgUnitLevelMenu />
            </div>
            <h3 className="text-xl font-bold mb-2">Date Range</h3>
            <div className="overflow-y-auto">
              <DateRangeSelector />
            </div>
            <h3 className="text-xl font-bold mb-2">Category Combination</h3>
            <div className="mb-4">
              <CategoryDropdownMenu />
            </div>
            <div className="mt-4">
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
