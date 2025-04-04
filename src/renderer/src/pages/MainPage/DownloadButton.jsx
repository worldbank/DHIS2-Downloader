import { useTranslation } from 'react-i18next'

// eslint-disable-next-line react/prop-types
const DownloadButton = ({ handleDownload, isDownloadDisabled }) => {
  const { t } = useTranslation()

  return (
    <div className="mb-4 w-full md:w-1/2 lg:w-1/3 flex flex-col space-y-2">
      <button
        onClick={handleDownload}
        disabled={isDownloadDisabled}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          isDownloadDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {t('mainPage.download')}
      </button>
    </div>
  )
}
export default DownloadButton
