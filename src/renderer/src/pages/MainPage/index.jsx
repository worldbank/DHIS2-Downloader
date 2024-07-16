import { useEffect, useState, useRef } from 'react'
import LoadingModal from '../Modal'
import OrganizationUnitTree from './OrganizationUnitTree'
import OrgUnitLevelMenu from './OrgUnitLevelMenu'
import DateRangeSelector from './DateRangeSelector'
import { fetchData, getCategoryCombination, getProgramIndicators } from '../../service/useApi'
import DataElementsMenu from './DataElements'
import CategoryDropdownMenu from './CategoryCombo'
import { generateDownloadingUrl, jsonToCsv } from '../../utils/helpers'
import { generatePeriods } from '../../utils/dateUtils'
import DownloadButton from './DownloadButton'
import { useLiveQuery } from 'dexie-react-hooks'
import { changeSchema } from '../../service/db'

// eslint-disable-next-line react/prop-types
const MainPage = ({ dhis2Url, username, password, dictionaryDb, servicesDb }) => {
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([])
  const [orgUnitLevel, selectOrgUnitLevel] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [frequency, setFrequency] = useState('year')
  const [dataPoints, setdataPoints] = useState([])
  const [filteredDataPoints, setFilteredDataPoints] = useState([])
  const [addedDataPoints, setAddedDataPoints] = useState([])
  const [selectedDataPoints, setSelectedDataPoints] = useState([])
  const [category, setCategory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const [isLoading, setIsLoading] = useState('')
  const servicesDbRef = useRef(servicesDb)
  const elements = useLiveQuery(() => dictionaryDb.dataElements.toArray()) || []
  const indicators = useLiveQuery(() => dictionaryDb.indicators.toArray()) || []

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading('loading')
        const categories = await getCategoryCombination(dhis2Url, username, password)
        const programIndicators = await getProgramIndicators(dhis2Url, username, password)

        const data = [
          ...elements.map((item) => ({
            id: item.id,
            displayName: item.displayName,
            category: 'dataElement'
          })),
          ...indicators.map((item) => ({
            id: item.id,
            displayName: item.displayName,
            category: 'Indicator'
          })),
          ...programIndicators.programIndicators.map((item) => ({
            ...item,
            category: 'programIndicator'
          }))
        ]

        setCategory([...categories.categoryCombos])
        setdataPoints(data)
        setFilteredDataPoints(data)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading('')
      }
    }

    fetchData()
  }, [dhis2Url, username, password, elements, indicators])

  const handleOrgUnitSelect = (unitId) => {
    if (selectedOrgUnits.includes(unitId)) {
      setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId))
    } else {
      setSelectedOrgUnits([...selectedOrgUnits, unitId])
    }
  }

  const handleOrgUnitLevel = (event) => {
    const level = Number.parseInt(event.target.value)
    selectOrgUnitLevel((prevLevels) =>
      prevLevels.includes(level) ? prevLevels.filter((l) => l !== level) : [...prevLevels, level]
    )
  }

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value)
  }

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value)
  }

  const handleFrequency = (event) => {
    setFrequency(event.target.value)
  }

  const handleSelectCategory = (event) => {
    setSelectedCategory(event.target.value)
  }

  const handleFilterDataPoint = (event) => {
    const searchTerm = event.target.value ? event.target.value.toLowerCase() : ''
    const filteredData = dataPoints.filter((element) =>
      element.displayName ? element.displayName.toLowerCase().includes(searchTerm) : false
    )
    setFilteredDataPoints(filteredData)
  }

  const handleSelectDataPoint = (event) => {
    const selectedOptionId = Array.from(event.target.selectedOptions).map((option) => option.value)
    const selectedData = dataPoints.filter((element) => selectedOptionId.includes(element.id))
    setSelectedDataPoints(selectedData)
  }

  const handleAddSelectedDataPoint = () => {
    // Avoid duplicated selection
    const allSelectedIds = [
      ...addedDataPoints.map((item) => item.id),
      ...selectedDataPoints.map((item) => item.id)
    ]
    const uniqueSelectedDataId = Array.from(new Set(allSelectedIds))
    const uniqueSelectedData = dataPoints.filter((element) =>
      uniqueSelectedDataId.includes(element.id)
    )
    setAddedDataPoints(uniqueSelectedData)
    // Remove selected elements from displayed items.
    const updatedFilteredDataPoints = filteredDataPoints.filter(
      (element) => !uniqueSelectedDataId.includes(element.id)
    )

    setFilteredDataPoints(updatedFilteredDataPoints)
    setSelectedDataPoints([])
  }

  const handleRemoveDataPoint = (elementId) => {
    const dataToRemove = addedDataPoints.find((element) => element.id === elementId)
    setFilteredDataPoints(filteredDataPoints.concat(dataToRemove))
    setAddedDataPoints(addedDataPoints.filter((element) => element.id !== elementId))
  }

  const handleDownload = async () => {
    let ou = ''
    if (selectedOrgUnits.length > 0) {
      ou = `${orgUnitLevel};${selectedOrgUnits.join(';')}&ouMode=SELECTED`
    } else {
      ou = orgUnitLevel.map((level) => `LEVEL-${level}`).join(';')
    }
    console.log(ou)
    const co = selectedCategory
    const dx = addedDataPoints.map((element) => element.id).join(';')
    const periods = generatePeriods(frequency, startDate, endDate)
    const pe = periods.join(';')
    const downloadingUrl = generateDownloadingUrl(dhis2Url, ou, dx, pe, co)
    console.log(downloadingUrl)
    try {
      setIsLoading('downloading')
      const data = await fetchData(downloadingUrl, username, password)
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
      setIsLoading('')
    } catch (error) {
      setIsLoading(error)
      console.log(error)
    }
  }

  const handleExit = () => {
    setIsLoading('')
  }

  const isDownloadDisabled =
    new Date(startDate) >= new Date(endDate) ||
    addedDataPoints.length == 0 ||
    orgUnitLevel.length == 0

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
              <OrganizationUnitTree
                dhis2Url={dhis2Url}
                username={username}
                password={password}
                selectedOrgUnits={selectedOrgUnits}
                setSelectedOrgUnits={setSelectedOrgUnits}
                onSelect={handleOrgUnitSelect}
              />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8" style={{ height: '70vh' }}>
            <h3 className="text-xl font-bold mb-2">Data Elements and Indicators</h3>
            <div
              className="overflow-y-scroll border border-gray-300 p-4 bg-gray-100"
              style={{ height: 'calc(70vh - 2rem)' }}
            >
              <DataElementsMenu
                dataPoints={dataPoints}
                filteredDataPoints={filteredDataPoints}
                addedDataPoints={addedDataPoints}
                handleFilterDataPoint={handleFilterDataPoint}
                handleSelectDataPoint={handleSelectDataPoint}
                handleAddSelectedDataPoint={handleAddSelectedDataPoint}
                handleRemoveDataPoint={handleRemoveDataPoint}
              />
            </div>
          </div>
          <div className="w-1/3 px-4 py-8">
            <h3 className="text-xl font-bold mb-2">Organization Levels</h3>
            <div className="mb-4">
              <OrgUnitLevelMenu
                dhis2Url={dhis2Url}
                username={username}
                password={password}
                orgUnitLevel={orgUnitLevel}
                handleOrgUnitLevel={handleOrgUnitLevel}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Date Range</h3>
            <div className="overflow-y-auto">
              <DateRangeSelector
                startDate={startDate}
                endDate={endDate}
                frequency={frequency}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                handleFrequency={handleFrequency}
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Category Combination</h3>
            <div className="overflow-y-auto">
              <CategoryDropdownMenu
                category={category}
                selectedCategory={selectedCategory}
                handleSelectCategory={handleSelectCategory}
              />
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

      {isLoading.length > 0 && <LoadingModal isLoading={isLoading} onExit={handleExit} />}
    </div>
  )
}
export default MainPage
