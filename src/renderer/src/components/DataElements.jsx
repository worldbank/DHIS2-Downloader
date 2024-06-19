const DataElementsSelector = ({
  filteredDataPoints,
  handleFilterDataPoint,
  handleSelectDataPoint,
  handleAddSelectedDataPoint
}) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Filter data elements"
        onChange={handleFilterDataPoint}
        className="mb-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
      />
      <select
        multiple
        onChange={handleSelectDataPoint}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
        style={{ minHeight: '200px' }}
      >
        {filteredDataPoints.map((element) => (
          <option key={element.id} value={element.id}>
            {element.displayName}
          </option>
        ))}
      </select>
      <button
        onClick={handleAddSelectedDataPoint}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Select Items
      </button>
    </div>
  )
}

const AddedElementsDisplay = ({ dataPoints, addedDataPoints, handleRemoveDataPoint }) => {
  return (
    <div className="mb-4">
      <h3 className="text-xl font-bold mb-2">Selected Elements</h3>
      <ul>
        {addedDataPoints.map((element) => (
          <li key={element.id}>
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
  dataPoints,
  addedDataPoints,
  filteredDataPoints,
  handleFilterDataPoint,
  handleSelectDataPoint,
  handleAddSelectedDataPoint,
  handleRemoveDataPoint
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
        dataPoints={dataPoints}
        addedDataPoints={addedDataPoints}
        handleRemoveDataPoint={handleRemoveDataPoint}
      />
    </div>
  )
}

export default DataElementsMenu
