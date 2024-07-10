const LoadingModal = ({ isLoading, onExit }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="loader mb-4"></div>
        <p>{isLoading}...</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          Exit
        </button>
      </div>
    </div>
  )
}

export default LoadingModal
