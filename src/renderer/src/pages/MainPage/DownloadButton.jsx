// eslint-disable-next-line react/prop-types
<<<<<<< Updated upstream
const DownloadButton = ({ dictionaryDb, handleDownload, isDownloadDisabled }) => {
  const queries = useLiveQuery(() => dictionaryDb.query.toArray(), []) || []

  console.log(queries)

  const handleExportQueries = () => {
    const csvContent = objectToCsv(queries)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'downloading_history.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

=======
const DownloadButton = ({ handleDownload, isDownloadDisabled }) => {
>>>>>>> Stashed changes
  return (
    <div className="mb-4 w-full md:w-1/2 lg:w-1/3 flex flex-col space-y-2">
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
