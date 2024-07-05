import { useState } from 'react'

const DataElementsSelector = ({
  filteredDataPoints,
  handleFilterDataPoint,
  handleSelectDataPoint,
  handleAddSelectedDataPoint,
}) => {
  const [dataType, setDataType] = useState('all')

  const handleDataType = (event) => {
    setDataType(event.target.value)
  }

  const filteredTypeDataPoints = filteredDataPoints.filter((element) =>
    dataType !== 'all' ? element.category === dataType : true
  )

  return (
    <div className="mb-4">
      Data Type
      <select
        onChange={handleDataType}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      >
        <option value={'all'}>All Data Types</option>
        <option value={'dataElement'}>Data Element</option>
        <option value={'Indicator'}>Indicator</option>
        <option value={'programIndicator'}>Program Indicator</option>
      </select>
      <input
        type="text"
        placeholder="Search"
        onChange={handleFilterDataPoint}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      />
      <select
        multiple
        onChange={handleSelectDataPoint}
        className="w-full px-4 py-2 overflow-y border-gray-700 rounded"
        style={{ minHeight: '200px', maxHeight: '200px' }}
      >
        {filteredTypeDataPoints.map((element) => (
          <option key={element.id} value={element.id} className="whitespace-normal">
            - {element.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddSelectedDataPoint}
        className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Select
      </button>
    </div>
  )
}

const AddedElementsDisplay = ({ addedDataPoints, handleRemoveDataPoint }) => {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-bold mb-2">Selected Items</h3>
      <ul>
        {addedDataPoints.map((element) => (
          <li key={element.id} className="text-sm">
            {element.displayName}
            <button onClick={() => handleRemoveDataPoint(element.id)} className="ml-2 text-red-500">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const DataElementsMenu = ({
  addedDataPoints,
  filteredDataPoints,
  handleFilterDataPoint,
  handleSelectDataPoint,
  handleAddSelectedDataPoint,
  handleRemoveDataPoint,
}) => {
  return (
    <div>
      <DataElementsSelector
        filteredDataPoints={filteredDataPoints}
        handleFilterDataPoint={handleFilterDataPoint}
        handleSelectDataPoint={handleSelectDataPoint}
        handleAddSelectedDataPoint={handleAddSelectedDataPoint}
      />
      <AddedElementsDisplay
        addedDataPoints={addedDataPoints}
        handleRemoveDataPoint={handleRemoveDataPoint}
      />
    </div>
  )
}

export default DataElementsMenu
