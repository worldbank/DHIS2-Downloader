import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setData,
  setSearchQuery,
  setSelectedDataType,
  setFilteredElements,
  setSelectedElements,
  addSelectedElements,
  removeElement
} from '../../reducers/dataElementsReducer'
import { useLiveQuery } from 'dexie-react-hooks'
import { dictionaryDb } from '../../service/db'

const DataElementsSelector = () => {
  const dispatch = useDispatch()
  const { data, selectedDataType, searchQuery, filteredElements, selectedElements } = useSelector(
    (state) => state.dataElements
  )
  const elements = useLiveQuery(() => dictionaryDb.dataElements.toArray(), [])
  const indicators = useLiveQuery(() => dictionaryDb.indicators.toArray(), [])
  const programIndicators = useLiveQuery(() => dictionaryDb.programIndicators.toArray(), [])
  const dataSets = useLiveQuery(() => dictionaryDb.dataSets.toArray(), [])

  useEffect(() => {
    if (elements && indicators && programIndicators && dataSets) {
      const allData = [...elements, ...indicators, ...programIndicators, ...dataSets]
      dispatch(setData(allData))
    }
  }, [elements, indicators, programIndicators, dataSets, dispatch])

  useEffect(() => {
    const filtered = data
      .filter((element) =>
        selectedDataType !== 'All' ? element.category === selectedDataType : true
      )
      .filter(
        (element) =>
          searchQuery === '' ||
          element.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    dispatch(setFilteredElements(filtered))
  }, [data, selectedDataType, searchQuery, dispatch])

  const handleSelectElement = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => ({
      id: option.value,
      displayName: option.label
    }))
    dispatch(setSelectedElements(selected))
  }

  const handleAddSelectedElements = () => {
    dispatch(addSelectedElements(selectedElements))
  }

  return (
    <div className="mb-4">
      Data Type
      <select
        onChange={(e) => dispatch(setSelectedDataType(e.target.value))}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      >
        <option value="All">All Data Types</option>
        <option value="DataElement">Data Element</option>
        <option value="Indicator">Indicator</option>
        <option value="ProgramIndicator">Program Indicator</option>
        <option value="dataSets">DataSet</option>
      </select>
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      />
      <select
        multiple
        onChange={handleSelectElement}
        className="w-full px-4 py-2 overflow-y border-gray-700 rounded"
        style={{ minHeight: '200px', maxHeight: '200px' }}
      >
        {filteredElements?.map((element) => (
          <option key={element.id} value={element.id} className="whitespace-normal">
            - {element.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddSelectedElements}
        className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Select
      </button>
    </div>
  )
}

const SelectedDataElementsDisplay = () => {
  const dispatch = useDispatch()
  const addedDataElements = useSelector((state) => state.dataElements?.addedElements)

  const handleRemoveElement = (id) => {
    dispatch(removeElement(id))
  }

  return (
    <div className="mb-4">
      <h3 className="text-xl font-bold mb-2">Selected Items</h3>
      <ul>
        {addedDataElements?.map((element) => (
          <li key={element.id} className="text-sm">
            {element.displayName}
            <button onClick={() => handleRemoveElement(element.id)} className="ml-2 text-red-500">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const DataElementsMenu = () => {
  return (
    <div>
      <DataElementsSelector />
      <SelectedDataElementsDisplay />
    </div>
  )
}

export default DataElementsMenu
