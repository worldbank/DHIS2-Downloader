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
import { useTranslation } from 'react-i18next'

const DataElementsSelector = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { data, selectedDataType, searchQuery, filteredElements, selectedElements } = useSelector(
    (state) => state.dataElements
  )
  const allElements = useLiveQuery(() => dictionaryDb.elements.toArray(), [])

  useEffect(() => {
    if (allElements) {
      const downloadableElements = allElements.filter(
        (element) => element.category !== 'CategoryOptionCombos'
      )
      dispatch(setData(downloadableElements))
    }
  }, [allElements, dispatch])

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

  const handleDoubleClickElement = (element) => {
    dispatch(addSelectedElements([{ id: element.id, displayName: element.displayName }]))
  }

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
      <div className="mb-1 font-semibold">{t('dataElementsMenu.dataTypeLabel')}</div>
      <select
        onChange={(e) => dispatch(setSelectedDataType(e.target.value))}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      >
        <option value="All">{t('dataElementsMenu.dataTypeOptions.all')}</option>
        <option value="DataElement">{t('dataElementsMenu.dataTypeOptions.dataElement')}</option>
        <option value="Indicator">{t('dataElementsMenu.dataTypeOptions.indicator')}</option>
        <option value="ProgramIndicator">
          {t('dataElementsMenu.dataTypeOptions.programIndicator')}
        </option>
        <option value="dataSets">{t('dataElementsMenu.dataTypeOptions.dataSet')}</option>
      </select>
      <input
        type="text"
        placeholder={t('dataElementsMenu.searchPlaceholder')}
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
          <option
            key={element.id}
            value={element.id}
            className="whitespace-normal"
            onDoubleClick={() => handleDoubleClickElement(element)}
          >
            - {element.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddSelectedElements}
        className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('dataElementsMenu.selectButton')}
      </button>
    </div>
  )
}

const SelectedDataElementsDisplay = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const addedDataElements = useSelector((state) => state.dataElements?.addedElements)

  const handleRemoveElement = (id) => {
    dispatch(removeElement(id))
  }

  return (
    <div className="mb-4">
      <h3 className="text-xl font-bold mb-2">{t('dataElementsMenu.selectedItemsTitle')}</h3>
      <ul>
        {addedDataElements?.map((element) => (
          <li key={element.id} className="text-sm">
            - {element.displayName}
            <button onClick={() => handleRemoveElement(element.id)} className="ml-2 text-red-500">
              {t('dataElementsMenu.removeButton')}
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
