const DataElementsSelector = ({
  filteredDataPoints,
  handleFilterDataPoint,
  handleSelectDataPoint,
  handleAddSelectedDataPoint,
  handleExportAllDataPoints
}) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Filter data elements"
        onChange={handleFilterDataPoint}
        className="mb-2 w-full px-4 py-2 border border-gray-700 rounded"
      />
      <select
        multiple
        onChange={handleSelectDataPoint}
        className="w-full px-4 py-2 overflow-auto border-gray-700 rounded"
        style={{ minHeight: '200px' }}
      >
        {filteredDataPoints.map((element) => (
          <option key={element.id} value={element.id}>
            {element.category}-{element.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddSelectedDataPoint}
        className="mt-2 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Select
      </button>
      <button
        onClick={handleExportAllDataPoints}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Export All
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
  handleExportAllDataPoints
}) => {
  return (
    <div>
      <DataElementsSelector
        filteredDataPoints={filteredDataPoints}
        handleFilterDataPoint={handleFilterDataPoint}
        handleSelectDataPoint={handleSelectDataPoint}
        handleAddSelectedDataPoint={handleAddSelectedDataPoint}
        handleExportAllDataPoints={handleExportAllDataPoints}
      />
      <AddedElementsDisplay
        addedDataPoints={addedDataPoints}
        handleRemoveDataPoint={handleRemoveDataPoint}
      />
    </div>
  )
}

export default DataElementsMenu
