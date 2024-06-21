const LoadingModal = ({ isLoading }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="loader mb-4"></div>
        <p>{isLoading}...</p>
      </div>
    </div>
  )
}

export default LoadingModal
