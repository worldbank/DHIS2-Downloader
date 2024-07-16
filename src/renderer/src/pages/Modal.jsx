const LoadingModal = ({ isLoading, onExit }) => {
  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex items-start justify-center pt-20 z-50">
      <div className="bg-white p-4 rounded shadow-lg flex flex-col items-center max-w-sm w-full">
        <div className="loader mb-4"></div>
        <p className="text-gray-700 mb-2">{isLoading}...</p>
        <button
          onClick={onExit}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
        >
          Hide
        </button>
      </div>
    </div>
  )
}

export default LoadingModal
