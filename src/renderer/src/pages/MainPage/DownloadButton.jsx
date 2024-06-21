// eslint-disable-next-line react/prop-types
const DownloadButton = ({ handleDownload, isDownloadDisabled }) => {
  return (
    <div className="mb-4 w-1/2">
      <button
        onClick={handleDownload}
        disabled={isDownloadDisabled}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          isDownloadDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Download
      </button>
    </div>
  )
}
export default DownloadButton
